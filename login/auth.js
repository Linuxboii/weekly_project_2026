/**
 * Authentication Module for Avlok AI
 * Handles login flow with JWT token storage
 */

const API_BASE_URL = 'https://api.avlokai.com';
const AUTH_TOKEN_KEY = 'auth_token';
const THEME_KEY = 'theme';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainContainer = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const btnText = loginBtn.querySelector('.btn-text');
const btnLoader = loginBtn.querySelector('.btn-loader');
const errorMessage = document.getElementById('error-message');
const loginThemeToggle = document.getElementById('login-theme-toggle');
const passwordToggleBtn = document.getElementById('toggle-password');

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);

    // Update main app theme toggle button text if it exists
    const mainThemeToggle = document.getElementById('theme-toggle');
    if (mainThemeToggle) {
        mainThemeToggle.textContent = newTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggleBtn.classList.toggle('password-visible', isPassword);
    passwordToggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
}

// Initialize theme on page load
initTheme();

// Theme toggle event listener
if (loginThemeToggle) {
    loginThemeToggle.addEventListener('click', toggleTheme);
}

// Password visibility toggle event listener
if (passwordToggleBtn) {
    passwordToggleBtn.addEventListener('click', togglePasswordVisibility);
}

/**
 * Check if user is already authenticated
 */
function checkAuth() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        showMainApp();
    } else {
        showLoginScreen();
    }
}

/**
 * Show login screen, hide main app
 */
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    document.title = 'Avlok Ai - Login';
}

/**
 * Show main app, hide login screen
 */
function showMainApp() {
    loginScreen.classList.add('hidden');
    mainContainer.classList.remove('hidden');
    document.title = 'Avlok AI - Projects';

    // Render project cards if the function exists (defined in app.js)
    if (typeof renderProjects === 'function') {
        renderProjects();
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate form inputs
 */
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

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');

    // Add shake animation
    errorMessage.classList.add('shake');
    setTimeout(() => {
        errorMessage.classList.remove('shake');
    }, 500);
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
}

/**
 * Set loading state on button
 */
function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    if (isLoading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Client-side validation
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Success - store token and show main app
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);

            // Clear form
            emailInput.value = '';
            passwordInput.value = '';

            // Transition to main app
            showMainApp();
        } else {
            // Handle specific error cases
            if (response.status === 401) {
                showError('Invalid email or password. Please try again.');
            } else if (response.status === 400) {
                showError('Please fill in all required fields.');
            } else {
                showError('Something went wrong. Please try again later.');
            }
        }
    } catch (error) {
        // Network error or server unreachable
        showError('Unable to connect. Please check your internet connection.');
    } finally {
        setLoading(false);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    showLoginScreen();

    // Clear any sensitive data
    emailInput.value = '';
    passwordInput.value = '';
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);

// Logout button (will be added after DOM is ready for main app)
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Focus management for accessibility
emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        passwordInput.focus();
    }
});

// Clear error when user starts typing
emailInput.addEventListener('input', hideError);
passwordInput.addEventListener('input', hideError);

// Initialize auth check after all scripts are loaded
// This ensures app.js renderProjects function is available
window.addEventListener('load', () => {
    checkAuth();
});

