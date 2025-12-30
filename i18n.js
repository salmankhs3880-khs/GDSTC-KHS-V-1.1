// Internationalization Module (i18n)
const i18n = {
    currentLanguage: localStorage.getItem('language') || 'en',

    translations: {
        en: {
            nav: {
                home: 'Home',
                features: 'Features',
                about: 'About',
                contact: 'Contact',
                login: 'Login'
            },
            hero: {
                title: 'Welcome to Student Results Management System',
                subtitle: 'Track Academic Performance with Ease and Transparency'
            },
            features: {
                analytics: 'Performance Analytics',
                security: 'Secure Access',
                download: 'Easy Download'
            },
            buttons: {
                getStarted: 'Get Started',
                learnMore: 'Learn More',
                login