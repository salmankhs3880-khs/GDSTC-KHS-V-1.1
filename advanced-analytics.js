// Advanced Analytics Module
const AnalyticsModule = {
    charts: {},

    // Initialize all charts
    initCharts:  function() {
        this.initSubjectChart();
        this.initGradeChart();
        this.initTrendChart();
        this.initClassChart();
        this.initGenderChart();
        this.initAttendanceChart();
    },

    // Subject Performance Chart
    initSubjectChart: function() {
        const ctx = document.getElementById('subjectChart').getContext('2d');

        if (this.charts.subject) {
            this.charts.subject. destroy();
        }

        this.charts.subject = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
                datasets: [{
                    label: 'Average Score',
                    data: [78. 5, 82.3, 75.8, 72.1, 80.2, 85.4],
                    backgroundColor: [
                        'rgba(30, 60, 114, 0.8)',
                        'rgba(42, 82, 152, 0.8)',
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgba(30, 60, 114, 1)',
                        'rgba(42, 82, 152, 1)',
                        'rgba(0, 212, 255, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options:  {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend:  { display: false },
                    datalabels: { display: true, color: 'black', font: { weight: 'bold' } }
                },
                scales: {
                    x: { beginAtZero: true, max: 100 }
                }
            }
        });
    },

    // Grade Distribution Chart
    initGradeChart: function() {
        const ctx = document.getElementById('gradeChart').getContext('2d');

        if (this.charts.grade) {
            this.charts.grade. destroy();
        }

        this.charts.grade = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Grade A (90-100)', 'Grade B (80-89)', 'Grade C (70-79)', 'Grade D (60-69)', 'Grade F (0-59)'],
                datasets:  [{
                    data: [45, 32, 16, 5, 2],
                    backgroundColor: [
                        '#d1fae5',
                        '#bfdbfe',
                        '#fef08a',
                        '#fed7aa',
                        '#fee2e2'
                    ],
                    borderColor: [
                        '#065f46',
                        '#1e40af',
                        '#713f12',
                        '#92400e',
                        '#7f1d1d'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive:  true,
                maintainAspectRatio: false,
                plugins: {
                    legend:  {
                        position: 'bottom'
                    },
                    datalabels:  {
                        color: 'black',
                        font: { weight: 'bold' },
                        formatter: (value) => value + '%'
                    }
                }
            }
        });
    },

    // Performance Trend Chart
    initTrendChart: function() {
        const ctx = document.getElementById('trendChart').getContext('2d');

        if (this.charts.trend) {
            this.charts. trend.destroy();
        }

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Term 1', 'Term 2', 'Term 3'],
                datasets: [
                    {
                        label: 'SS1 Average',
                        data: [72, 74, 76],
                        borderColor: '#1e3c72',
                        backgroundColor: 'rgba(30, 60, 114, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'SS2 Average',
                        data:  [75, 77, 79],
                        borderColor: '#2a5298',
                        backgroundColor: 'rgba(42, 82, 152, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'SS3 Average',
                        data:  [78, 80, 82],
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    },

    // Class Comparison Chart
    initClassChart: function() {
        const ctx = document.getElementById('classChart').getContext('2d');

        if (this.charts.class) {
            this. charts.class.destroy();
        }

        this.charts.class = new Chart(ctx, {
            type: 'bar',
            data: {
                labels:  ['SS3 Science', 'SS3 Arts', 'SS2 Science', 'SS2 Arts', 'SS1'],
                datasets: [{
                    label: 'Average Class Score',
                    data: [87.5, 79.2, 81.3, 76.8, 74.5],
                    backgroundColor: 'rgba(42, 82, 152, 0.8)',
                    borderColor: 'rgba(42, 82, 152, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins:  {
                    legend: { display: false },
                    datalabels: { display: true, color:  'black', font: { weight: 'bold' } }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    },

    // Gender Distribution Chart
    initGenderChart:  function() {
        const ctx = document.getElementById('genderChart').getContext('2d');

        if (this.charts.gender) {
            this.charts.gender.destroy();
        }

        this.charts.gender = new Chart(ctx, {
            type:  'polarArea',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [620, 625],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor:  [
                        'rgba(59, 130, 246, 1)',
                        'rgba(236, 72, 153, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive:  true,
                maintainAspectRatio: false,
                plugins: {
                    legend:  { position: 'bottom' }
                }
            }
        });
    },

    // Attendance vs Performance
    initAttendanceChart: function() {
        const ctx = document.getElementById('attendanceChart').getContext('2d');

        if (this.charts.attendance) {
            this.charts.attendance. destroy();
        }

        this.charts.attendance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label:  'Attendance vs Performance',
                    data: [
                        { x: 85, y: 72 },
                        { x:  90, y: 78 },
                        { x: 95, y: 85 },
                        { x: 88, y: 75 },
                        { x:  92, y: 82 }
                    ],
                    backgroundColor: 'rgba(0, 212, 255, 0.8)',
                    borderColor: 'rgba(0, 212, 255, 1)',
                    borderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Attendance Rate (%)' },
                        min: 0, max: 100
                    },
                    y: {
                        title: { display: true, text: 'Performance Score' },
                        min: 0, max: 100
                    }
                }
            }
        });
    }
};

// Load analytics on page load
document.addEventListener('DOMContentLoaded', () => {
    AnalyticsModule.initCharts();
});

// Load data function
function loadAnalytics() {
    const session = document.getElementById('sessionFilter').value;
    const term = document.getElementById('termFilter').value;
    const className = document.getElementById('classFilter').value;

    console.log('Loading analytics for:', { session, term, className });

    // Fetch data from API
    fetch('/api/admin/reports/analytics', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console. log('Analytics data:', data);
        AnalyticsModule.initCharts();
    })
    .catch(error => console.error('Error loading analytics:', error));
}