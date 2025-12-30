// GDSTC Kafin-Hausa - Backend Server
// Node.js/Express API Server

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gdstc_results',
    waitForConnections:  true,
    connectionLimit: 10,
    queueLimit:  0
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth:  {
        user: process.env.EMAIL_USER,
        pass: process.env. EMAIL_PASSWORD
    }
});

// Twilio configuration for SMS
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process. env.TWILIO_AUTH_TOKEN
);

// ============ AUTHENTICATION ROUTES ============

// Register user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role, name } = req.body;

        const connection = await pool.getConnection();

        // Check if user exists
        const [existingUser] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser. length > 0) {
            connection.release();
            return res. status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await connection.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ? )',
            [username, email, hashedPassword, role]
        );

        connection.release();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const connection = await pool. getConnection();

        // Get user
        const [users] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            connection.release();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn:  '24h' }
        );

        // Update last login
        await connection. query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        connection.release();

        res.json({
            token,
            user:  {
                id: user.id,
                email: user.email,
                role: user.role,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify 2FA code
app.post('/api/auth/verify-2fa', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const connection = await pool.getConnection();

        // Get 2FA code from database
        const [twoFA] = await connection.query(
            'SELECT * FROM two_fa_codes WHERE user_id = ?  AND code = ?  AND expires_at > NOW()',
            [userId, code]
        );

        if (twoFA.length === 0) {
            connection.release();
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        // Mark code as verified
        await connection.query(
            'UPDATE two_fa_codes SET verified = 1 WHERE id = ?',
            [twoFA[0].id]
        );

        connection.release();

        res.json({ message: '2FA verification successful' });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: '2FA verification failed' });
    }
});

// ============ STUDENT ROUTES ============

// Get student dashboard
app.get('/api/students/dashboard/: studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const connection = await pool.getConnection();

        // Get student details
        const [student] = await connection.query(
            `SELECT s.*, c.name as class_name 
             FROM students s 
             LEFT JOIN classes c ON s.class_id = c.id 
             WHERE s.id = ?`,
            [studentId]
        );

        // Get student results
        const [results] = await connection.query(
            `SELECT r.*, su.name as subject_name, t.term_number
             FROM results r
             JOIN subjects su ON r.subject_id = su.id
             JOIN terms t ON r.term_id = t.id
             WHERE r.student_id = ? 
             ORDER BY t.term_number DESC`,
            [studentId]
        );

        // Calculate average
        const average = results.length > 0
            ? (results. reduce((sum, r) => sum + parseFloat(r.total_score || 0), 0) / results.length).toFixed(2)
            : 0;

        connection.release();

        res.json({
            student: student[0],
            results,
            average,
            totalSubjects: results.length
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// Get student results with filters
app.get('/api/students/results', async (req, res) => {
    try {
        const { studentId, session, term, subject } = req. query;
        const connection = await pool.getConnection();

        let query = `
            SELECT r.*, su.name as subject_name, t.term_number, s.session_name
            FROM results r
            JOIN subjects su ON r.subject_id = su.id
            JOIN terms t ON r.term_id = t.id
            JOIN academic_sessions s ON t.session_id = s.id
            WHERE r.student_id = ? 
        `;

        const params = [studentId];

        if (session) {
            query += ' AND s.session_name = ?';
            params.push(session);
        }

        if (term) {
            query += ' AND t.term_number = ?';
            params.push(term);
        }

        if (subject) {
            query += ' AND su.id = ?';
            params.push(subject);
        }

        query += ' ORDER BY s.session_name DESC, t.term_number DESC';

        const [results] = await connection.query(query, params);

        connection.release();

        res.json(results);
    } catch (error) {
        console.error('Results fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Download transcript
app.get('/api/students/transcript/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const connection = await pool.getConnection();

        // Get student details
        const [student] = await connection.query(
            'SELECT * FROM students WHERE id = ?',
            [studentId]
        );

        // Get all results
        const [results] = await connection.query(
            `SELECT r.*, su.name as subject_name, t.term_number, s.session_name
             FROM results r
             JOIN subjects su ON r.subject_id = su.id
             JOIN terms t ON r.term_id = t.id
             JOIN academic_sessions s ON t.session_id = s.id
             WHERE r. student_id = ?
             ORDER BY s.session_name DESC, t. term_number DESC`,
            [studentId]
        );

        connection.release();

        // Generate PDF or return as JSON (implement PDF generation as needed)
        res.json({
            student: student[0],
            results,
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('Transcript error:', error);
        res.status(500).json({ error: 'Failed to generate transcript' });
    }
});

// ============ TEACHER ROUTES ============

// Get teacher dashboard
app. get('/api/teachers/dashboard/: teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const connection = await pool.getConnection();

        // Get teacher details
        const [teacher] = await connection.query(
            'SELECT * FROM teachers WHERE id = ?',
            [teacherId]
        );

        // Get assigned classes
        const [classes] = await connection.query(
            'SELECT * FROM classes WHERE form_teacher_id = ?',
            [teacherId]
        );

        // Get pending grades
        const [pendingGrades] = await connection.query(
            `SELECT COUNT(*) as count FROM results 
             WHERE submitted_by = ? AND submission_date IS NULL`,
            [teacherId]
        );

        connection.release();

        res.json({
            teacher: teacher[0],
            classes,
            pendingGrades:  pendingGrades[0].count
        });
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// Submit grades
app.post('/api/teachers/submit-grades', async (req, res) => {
    try {
        const { grades, teacherId, classId, termId } = req.body;
        const connection = await pool.getConnection();

        for (const grade of grades) {
            await connection.query(
                `INSERT INTO results 
                (student_id, subject_id, term_id, test_score, assignment_score, exam_score, total_score, grade, submitted_by, submission_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                test_score = VALUES(test_score),
                assignment_score = VALUES(assignment_score),
                exam_score = VALUES(exam_score),
                total_score = VALUES(total_score),
                grade = VALUES(grade),
                submitted_by = VALUES(submitted_by),
                submission_date = NOW()`,
                [
                    grade.studentId,
                    grade.subjectId,
                    termId,
                    grade. testScore,
                    grade. assignmentScore,
                    grade.examScore,
                    grade.totalScore,
                    grade.grade,
                    teacherId
                ]
            );
        }

        // Send notification email to students
        for (const grade of grades) {
            const [student] = await connection.query(
                'SELECT email FROM students WHERE id = ?',
                [grade.studentId]
            );

            if (student.length > 0) {
                await sendEmail(
                    student[0]. email,
                    'Grades Published',
                    `Your grades have been published.  Please log in to view your results.`
                );
            }
        }

        connection.release();

        res.json({ message: 'Grades submitted successfully' });
    } catch (error) {
        console.error('Grade submission error:', error);
        res.status(500).json({ error: 'Failed to submit grades' });
    }
});

// Get class performance
app.get('/api/teachers/class-performance/:classId', async (req, res) => {
    try {
        const { classId } = req. params;
        const connection = await pool.getConnection();

        // Get class info
        const [classInfo] = await connection.query(
            'SELECT * FROM classes WHERE id = ?',
            [classId]
        );

        // Get students in class
        const [students] = await connection.query(
            'SELECT * FROM students WHERE class_id = ? ',
            [classId]
        );

        // Get average scores per student
        const [performance] = await connection.query(
            `SELECT s.id, s.first_name, s.last_name, AVG(r.total_score) as average_score, COUNT(DISTINCT r.subject_id) as subjects
             FROM students s
             LEFT JOIN results r ON s.id = r.student_id
             WHERE s.class_id = ? 
             GROUP BY s.id
             ORDER BY average_score DESC`,
            [classId]
        );

        connection.release();

        res.json({
            class: classInfo[0],
            students:  performance,
            totalStudents: students.length,
            classAverage: performance. length > 0
                ? (performance. reduce((sum, p) => sum + parseFloat(p.average_score || 0), 0) / performance.length).toFixed(2)
                : 0
        });
    } catch (error) {
        console.error('Class performance error:', error);
        res.status(500).json({ error: 'Failed to fetch class performance' });
    }
});

// ============ ADMIN ROUTES ============

// Get admin dashboard
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const connection = await pool. getConnection();

        // Get statistics
        const [studentCount] = await connection.query('SELECT COUNT(*) as count FROM students WHERE status = "active"');
        const [teacherCount] = await connection.query('SELECT COUNT(*) as count FROM teachers WHERE status = "active"');
        const [classCount] = await connection.query('SELECT COUNT(*) as count FROM classes');
        const [resultsCount] = await connection.query('SELECT COUNT(*) as count FROM results WHERE submission_date IS NOT NULL');

        connection.release();

        res.json({
            totalStudents: studentCount[0]. count,
            activeTeachers: teacherCount[0].count,
            academicClasses: classCount[0].count,
            resultsSubmitted: resultsCount[0]. count
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// Upload results (CSV)
app.post('/api/admin/upload-results', upload.single('file'), async (req, res) => {
    try {
        const { classId, termId } = req.body;
        const connection = await pool.getConnection();

        // Parse CSV file
        const csv = require('csv-parser');
        const fs = require('fs');

        const results = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    for (const row of results) {
                        const [student] = await connection.query(
                            'SELECT id FROM students WHERE registration_number = ?',
                            [row.admission_no]
                        );

                        if (student.length > 0) {
                            await connection. query(
                                `INSERT INTO results (student_id, subject_id, term_id, test_score, assignment_score, exam_score, total_score, grade)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    student[0]. id,
                                    row. subject_id,
                                    termId,
                                    row.test_score,
                                    row.assignment_score,
                                    row.exam_score,
                                    row.total_score,
                                    calculateGrade(row.total_score)
                                ]
                            );
                        }
                    }

                    connection.release();
                    fs.unlinkSync(req.file.path);

                    res. json({ message: 'Results uploaded successfully' });
                } catch (error) {
                    connection.release();
                    res.status(500).json({ error: 'Failed to process results' });
                }
            });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Manage students
app.get('/api/admin/students', async (req, res) => {
    try {
        const { search, class:  classId, status } = req.query;
        const connection = await pool.getConnection();

        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ?  OR registration_number LIKE ?  OR email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (classId) {
            query += ' AND class_id = ?';
            params.push(classId);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        const [students] = await connection.query(query, params);
        connection.release();

        res.json(students);
    } catch (error) {
        console.error('Students fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Add new student
app.post('/api/admin/students', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, classId, dob } = req.body;
        const connection = await pool.getConnection();

        // Generate registration number
        const [lastStudent] = await connection.query(
            'SELECT registration_number FROM students ORDER BY id DESC LIMIT 1'
        );

        const regNumber = lastStudent. length > 0
            ? `${new Date().getFullYear()}/${parseInt(lastStudent[0].registration_number.split('/')[1]) + 1}`
            : `${new Date().getFullYear()}/001`;

        await connection.query(
            `INSERT INTO students (registration_number, first_name, last_name, email, phone, class_id, date_of_birth, admission_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [regNumber, firstName, lastName, email, phone, classId, dob]
        );

        connection.release();

        res.status(201).json({ message: 'Student added successfully', registration_number: regNumber });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ error: 'Failed to add student' });
    }
});

// Delete student
app.delete('/api/admin/students/:studentId', async (req, res) => {
    try {
        const { studentId } = req. params;
        const connection = await pool.getConnection();

        await connection.query(
            'UPDATE students SET status = "inactive" WHERE id = ?',
            [studentId]
        );

        connection.release();

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

// Generate analytics report
app.get('/api/admin/reports/analytics', async (req, res) => {
    try {
        const { session, term, class:  classId } = req.query;
        const connection = await pool.getConnection();

        let query = `
            SELECT 
                su.name as subject,
                COUNT(DISTINCT r.student_id) as total_students,
                AVG(r.total_score) as average_score,
                SUM(CASE WHEN r. grade IN ('A', 'B') THEN 1 ELSE 0 END) as excellent_count,
                SUM(CASE WHEN r.grade = 'F' THEN 1 ELSE 0 END) as fail_count
            FROM results r
            JOIN subjects su ON r.subject_id = su.id
            JOIN terms t ON r.term_id = t.id
            JOIN academic_sessions s ON t.session_id = s.id
            WHERE 1=1
        `;

        const params = [];

        if (session) {
            query += ' AND s.session_name = ?';
            params.push(session);
        }

        if (term) {
            query += ' AND t.term_number = ?';
            params.push(term);
        }

        query += ' GROUP BY su.id, su.name';

        const [analytics] = await connection.query(query, params);
        connection.release();

        res.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ============ PARENT ROUTES ============

// Get parent dashboard (view child results)
app.get('/api/parents/dashboard/: parentId', async (req, res) => {
    try {
        const { parentId } = req.params;
        const connection = await pool.getConnection();

        // Get assigned children
        const [children] = await connection.query(
            'SELECT s.* FROM students s JOIN parent_student ps ON s.id = ps.student_id WHERE ps. parent_id = ?',
            [parentId]
        );

        // Get results for each child
        const childrenWithResults = [];
        for (const child of children) {
            const [results] = await connection.query(
                `SELECT r.*, su.name as subject_name, t.term_number
                 FROM results r
                 JOIN subjects su ON r.subject_id = su.id
                 JOIN terms t ON r.term_id = t.id
                 WHERE r.student_id = ? 
                 ORDER BY t.term_number DESC LIMIT 10`,
                [child.id]
            );

            childrenWithResults.push({
                ...child,
                results,
                average: results.length > 0
                    ? (results.reduce((sum, r) => sum + parseFloat(r.total_score || 0), 0) / results.length).toFixed(2)
                    : 0
            });
        }

        connection.release();

        res.json(childrenWithResults);
    } catch (error) {
        console.error('Parent dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

// ============ NOTIFICATION ROUTES ============

// Send email notification
async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: text
        });
        console.log('Email sent to', to);
    } catch (error) {
        console.error('Email error:', error);
    }
}

// Send SMS notification
async function sendSMS(phoneNumber, message) {
    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env. TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        console.log('SMS sent to', phoneNumber);
    } catch (error) {
        console.error('SMS error:', error);
    }
}

// Endpoint to send notifications
app.post('/api/notifications/email', async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        await sendEmail(to, subject, message);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/api/notifications/sms', async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        await sendSMS(phoneNumber, message);
        res.json({ message: 'SMS sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send SMS' });
    }
});

// ============ UTILITY FUNCTIONS ============

function calculateGrade(score) {
    const numScore = parseFloat(score);
    if (numScore >= 90) return 'A';
    if (numScore >= 80) return 'B';
    if (numScore >= 70) return 'C';
    if (numScore >= 60) return 'D';
    return 'F';
}

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;