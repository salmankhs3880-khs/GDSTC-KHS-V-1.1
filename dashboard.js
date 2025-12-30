// Dashboard Module
const DashboardModule = {
    // Get admin dashboard data
    getAdminDashboard: function() {
        return {
            totalStudents:  1245,
            activeTeachers: 52,
            academicClasses: 24,
            resultsUploaded: 98,
            recentActivities: [
                { date: '2025-12-30', activity: 'Results uploaded for Class 12A', user: 'Mr. Ahmed', status: 'Completed' },
                { date:  '2025-12-29', activity: 'New student registered', user: 'Admin', status: 'Completed' },
                { date: '2025-12-28', activity: 'Teacher account created', user: 'Admin', status: 'Completed' }
            ]
        };
    },

    // Get student dashboard data
    getStudentDashboard: function(studentId) {
        return {
            studentId: studentId,
            studentName: 'John David Ibrahim',
            registrationNo: '2022/001234',
            class: 'Senior Secondary School III (Science)',
            averageScore: 87.8,
            position: '3rd/150',
            performance: 'Excellent',
            subjects: [
                { name: 'English Language', average: 87.67, grade: 'A' },
                { name: 'Mathematics', average: 90.67, grade: 'A' },
                { name: 'Physics', average: 86.67, grade: 'A' },
                { name: 'Chemistry', average: 82.00, grade: 'B' },
                { name: 'Biology', average: 85.00, grade: 'A' },
                { name: 'Computer Science', average: 90.67, grade: 'A' }
            ]
        };
    },

    // Get teacher dashboard data
    getTeacherDashboard: function(teacherId) {
        return {
            teacherId: teacherId,
            teacherName: 'Mr. Ahmed Hassan',
            department: 'Science',
            classesTeaching: 6,
            totalStudents: 180,
            gradesSubmitted: 85,
            attendanceRate: 92,
            pendingReviews: 5,
            classes: [
                { name: 'Physics - SS2', students: 30 },
                { name: 'Chemistry - SS3', students: 28 },
                { name: 'Physics - SS1', students: 32 },
                { name: 'Advanced Physics - SS3', students: 25 }
            ],
            recentActivities: [
                { date: '2025-12-28', activity: 'Grades submitted for SS2 Physics', status: 'Completed' },
                { date: '2025-12-27', activity: 'Attendance marked for all classes', status: 'Completed' }
            ]
        };
    },

    // Generate performance report
    generatePerformanceReport: function(studentId) {
        return {
            studentId:  studentId,
            reportDate: new Date().toISOString().split('T')[0],
            academicStrength: ['Mathematics', 'Computer Science'],
            academicWeakness: ['Chemistry'],
            overallTrend: 'Improving',
            recommendations: [
                'Continue to maintain excellent performance in Mathematics',
                'Focus more on Chemistry to improve grades',
                'Participate in extracurricular activities'
            ]
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardModule;
}