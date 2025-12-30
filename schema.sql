-- GDSTC Kafin-Hausa Student Results Management System
-- Database Schema

-- Create Students Table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    class_id INT,
    admission_date DATE,
    status ENUM('active', 'inactive', 'graduated', 'transferred') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Create Teachers Table
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INT,
    qualification VARCHAR(255),
    hire_date DATE,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create Classes Table
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    stream VARCHAR(50),
    form_teacher_id INT,
    max_capacity INT DEFAULT 40,
    current_count INT DEFAULT 0,
    academic_session_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id)
);

-- Create Subjects Table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id INT,
    credit_hours INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create Departments Table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    head_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (head_id) REFERENCES teachers(id)
);

-- Create Academic Sessions Table
CREATE TABLE academic_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_name VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Terms Table
CREATE TABLE terms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    term_number INT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES academic_sessions(id),
    UNIQUE KEY unique_session_term (session_id, term_number)
);

-- Create Results Table
CREATE TABLE results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    term_id INT NOT NULL,
    test_score DECIMAL(5, 2),
    assignment_score DECIMAL(5, 2),
    exam_score DECIMAL(5, 2),
    total_score DECIMAL(5, 2),
    grade CHAR(1),
    remarks VARCHAR(255),
    submitted_by INT,
    submission_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (term_id) REFERENCES terms(id),
    FOREIGN KEY (submitted_by) REFERENCES teachers(id),
    UNIQUE KEY unique_result (student_id, subject_id, term_id)
);

-- Create Attendance Table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    term_id INT NOT NULL,
    attendance_date DATE,
    present BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (term_id) REFERENCES terms(id)
);

-- Create Grades Table (Grade Scale Definition)
CREATE TABLE grade_scale (
    id INT PRIMARY KEY AUTO_INCREMENT,
    grade CHAR(1) UNIQUE,
    min_score INT,
    max_score INT,
    description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users Table (Authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    student_id INT,
    teacher_id INT,
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Create Audit Log Table
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    module VARCHAR(50),
    details JSON,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert Grade Scale
INSERT INTO grade_scale (grade, min_score, max_score, description) VALUES
('A', 90, 100, 'Excellent'),
('B', 80, 89, 'Good'),
('C', 70, 79, 'Average'),
('D', 60, 69, 'Pass'),
('F', 0, 59, 'Fail');

-- Create Indexes for Performance
CREATE INDEX idx_student_class ON students(class_id);
CREATE INDEX idx_student_status ON students(status);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_subject ON results(subject_id);
CREATE INDEX idx_results_term ON results(term_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Create Views
-- View for Student Performance Summary
CREATE VIEW student_performance_summary AS
SELECT 
    s. id,
    s.registration_number,
    CONCAT(s.first_name, ' ', s.last_name) as student_name,
    c.name as class_name,
    AVG(r.total_score) as average_score,
    COUNT(DISTINCT r.subject_id) as subjects_taken,
    SUM(CASE WHEN r.grade IN ('A', 'B') THEN 1 ELSE 0 END) as excellent_subjects,
    MAX(r.grade) as best_grade,
    MIN(r.grade) as lowest_grade
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN results r ON s.id = r.student_id
GROUP BY s.id, s.registration_number, s.first_name, s.last_name, c.name;

-- View for Class Performance Summary
CREATE VIEW class_performance_summary AS
SELECT 
    c.id,
    c. name as class_name,
    COUNT(DISTINCT s.id) as total_students,
    AVG(r.total_score) as average_class_score,
    SUM