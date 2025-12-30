// Authentication Module
const AuthModule = {
    // User storage
    users: {
        'student@gdstc.edu. ng': { password: 'student123', role: 'student', name: 'John David' },
        'teacher@gdstc.edu.ng': { password: 'teacher123', role: 'teacher', name: 'Mr. Ahmed Hassan' },
        'admin@gdstc.edu.ng': { password: 'admin123', role: 'admin', name: 'Administrator' }
    },

    // Login function
    login: function(username, password, role) {
        const user = this.users[username];
        if (user && user.password === password && user.role === role) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                role: role,
                name: user.name,
                loginTime: new Date().toISOString()
            }));
            return { success: true, message: 'Login successful', role: role };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    // Logout function
    logout: function() {
        localStorage.removeItem('currentUser');
        return { success:  true, message: 'Logged out successfully' };
    },

    // Get current user
    getCurrentUser: function() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return this.getCurrentUser() !== null;
    },

    // Register new user
    register: function(username, password, role, name) {
        if (this.users[username]) {
            return { success: false, message: 'User already exists' };
        }
        this.users[username] = { password, role, name };
        return { success: true, message: 'Registration successful' };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthModule;
}