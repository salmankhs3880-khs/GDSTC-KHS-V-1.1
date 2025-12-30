// Results Management Module
const ResultsModule = {
    // Sample results data
    results: [
        {
            id: 1,
            studentId: '2022/001234',
            studentName: 'John David Ibrahim',
            class: 'SS3 (Science)',
            session: '2025/2026',
            subjects: [
                { name: 'English Language', term1: 85, term2: 88, term3: 90, average: 87. 67, grade: 'A' },
                { name: 'Mathematics', term1: 92, term2: 89, term3: 91, average: 90.67, grade: 'A' },
                { name: 'Physics', term1: 88, term2: 85, term3: 87, average: 86.67, grade: 'A' },
                { name: 'Chemistry', term1: 80, term2: 82, term3: 84, average: 82.00, grade: 'B' },
                { name: 'Biology', term1: 84, term2: 86, term3: 85, average: 85.00, grade: 'A' },
                { name: 'Computer Science', term1: 89, term2: 91, term3: 92, average: 90.67, grade: 'A' }
            ],
            overallAverage: 87.8,
            position: '3rd out of 150'
        }
    ],

    // Get student results
    getStudentResults:  function(studentId, session) {
        return this.results.filter(r => r.studentId === studentId && r.session === session);
    },

    // Get all results
    getAllResults: function() {
        return this.results;
    },

    // Add new result
    addResult: function(result) {
        result.id = this.results.length + 1;
        this. results.push(result);
        return { success: true, message: 'Result added successfully', id: result.id };
    },

    // Update result
    updateResult: function(id, updatedData) {
        const index = this.results.findIndex(r => r.id === id);
        if (index !== -1) {
            this.results[index] = { ...this.results[index], ...updatedData };
            return { success: true, message: 'Result updated successfully' };
        }
        return { success: false, message: 'Result not found' };
    },

    // Delete result
    deleteResult: function(id) {
        this.results = this.results.filter(r => r.id !== id);
        return { success: true, message: 'Result deleted successfully' };
    },

    // Calculate grade from score
    calculateGrade: function(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    },

    // Get class performance
    getClassPerformance:  function(className) {
        return {
            class: className,
            totalStudents: 30,
            averageScore: 76.5,
            topPerformer: 'John David Ibrahim (92%)',
            passRate: 95,
            failRate: 5
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultsModule;
}