/**
 * Authentication Module for Avlok AI Login Page
 * Handles login flow with JWT token storage
 */

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'https://api.avlokai.com';
const AUTH_TOKEN_KEY = 'auth_token';
const LOGIN_PAGE_URL = 'https://login.avlokai.com/';
const THEME_KEY = 'theme';

// ============================================
// DOM ELEMENTS
// ============================================
const loginScreen = document.getElementById('login-screen');
const mainContainer = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const btnText = loginBtn?.querySelector('.btn-text');
const btnLoader = loginBtn?.querySelector('.btn-loader');
const errorMessage = document.getElementById('error-message');
const loginThemeToggle = document.getElementById('login-theme-toggle');
const passwordToggleBtn = document.getElementById('toggle-password');

// ============================================
// URL REDIRECT HANDLING
// ============================================

function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect');
}

function redirectToProject(redirectUrl) {
    if (redirectUrl) {
        window.location.href = redirectUrl;
    } else {
        showMainApp();
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
}

function togglePasswordVisibility() {
    if (!passwordInput || !passwordToggleBtn) return;
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggleBtn.classList.toggle('password-visible', isPassword);
}

// Initialize theme
initTheme();

if (loginThemeToggle) {
    loginThemeToggle.addEventListener('click', toggleTheme);
}

if (passwordToggleBtn) {
    passwordToggleBtn.addEventListener('click', togglePasswordVisibility);
}

// ============================================
// AUTH CHECK
// ============================================

function checkAuth() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const redirectUrl = getRedirectUrl();

    if (token && redirectUrl) {
        // Has token and redirect URL - go to project
        redirectToProject(redirectUrl);
    } else if (token && !redirectUrl) {
        // Has token, no redirect - show dashboard
        showMainApp();
    } else {
        // No token - show login form
        showLoginScreen();
    }
}

// ============================================
// UI STATE
// ============================================

function showLoginScreen() {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (mainContainer) mainContainer.classList.add('hidden');
    document.title = 'Avlok AI - Login';
}

function showMainApp() {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (mainContainer) mainContainer.classList.remove('hidden');
    document.title = 'Avlok AI - Projects';
    if (typeof renderProjects === 'function') {
        renderProjects();
    }
}

// ============================================
// FORM VALIDATION
// ============================================

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateInputs(email, password) {
    if (!email || !password) {
        return { valid: false, message: 'Please fill in all fields.' };
    }
    if (!isValidEmail(email)) {
        return { valid: false, message: 'Please enter a valid email address.' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters.' };
    }
    return { valid: true };
}

// ============================================
// ERROR HANDLING
// ============================================

function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('shake');
    setTimeout(() => errorMessage.classList.remove('shake'), 500);
}

function hideError() {
    if (!errorMessage) return;
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
}

function setLoading(isLoading) {
    if (!loginBtn || !btnText || !btnLoader) return;
    loginBtn.disabled = isLoading;
    if (isLoading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

// ============================================
// LOGIN HANDLER
// ============================================

async function handleLogin(e) {
    e.preventDefault();

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    const validation = validateInputs(email, password);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }

    hideError();
    setLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';

            const redirectUrl = getRedirectUrl();
            redirectToProject(redirectUrl);
        } else {
            switch (response.status) {
                case 400:
                    showError('Please fill in all required fields.');
                    break;
                case 401:
                    showError('Invalid email or password.');
                    break;
                case 403:
                    showError('Your account has been disabled.');
                    break;
                default:
                    showError('Something went wrong. Please try again.');
            }
        }
    } catch (error) {
        console.error('[Auth] Login failed:', error);
        showError('Unable to connect. Please check your connection.');
    } finally {
        setLoading(false);
    }
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    showLoginScreen();
}

function handleLogout() {
    logout();
}

window.logout = logout;
window.handleLogout = handleLogout;

// ============================================
// EVENT LISTENERS
// ============================================

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

if (emailInput) {
    emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput?.focus();
        }
    });
    emailInput.addEventListener('input', hideError);
}

if (passwordInput) {
    passwordInput.addEventListener('input', hideError);
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('load', () => {
    checkAuth();
});
