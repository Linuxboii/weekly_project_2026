/**
 * Authentication Module for Avlok AI Login Page
 * Handles login flow with JWT token storage
 * 
 * This file is for the LOGIN PAGE (https://login.avlokai.com)
 * For protected projects, use auth-guard.js instead.
 */

// ============================================
// CONFIGURATION (DO NOT MODIFY)
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

/**
 * Get redirect URL from query parameters
 * @returns {string|null} The redirect URL or null if not present
 */
function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect');
}

/**
 * Redirect to the original project or dashboard
 * @param {string|null} redirectUrl - URL to redirect to
 */
function redirectToProject(redirectUrl) {
    if (redirectUrl) {
        window.location.href = redirectUrl;
    } else {
        // No redirect param - show dashboard
        showMainApp();
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
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

// ============================================
// AUTH CHECK (ON PAGE LOAD)
// ============================================

/**
 * Check if user is already authenticated
 * Per contract: If token exists → immediately redirect
 */
function checkAuth() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const redirectUrl = getRedirectUrl();

    if (token) {
        // Token exists - redirect immediately
        redirectToProject(redirectUrl);
    } else {
        // No token - show login form
        showLoginScreen();
    }
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Show login screen, hide main app
 */
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    document.title = 'Avlok AI - Login';
}

/**
 * Show main app (dashboard), hide login screen
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

// ============================================
// FORM VALIDATION
// ============================================

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

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Show error message with shake animation
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');

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

// ============================================
// LOGIN HANDLER (EXACT CONTRACT)
// ============================================

/**
 * Handle login form submission
 * Per contract:
 * - Disable submit button
 * - Send credentials to /auth/login
 * - If successful: Store token, redirect to original project
 * - If failure: Show friendly error message, re-enable button
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
        // LOGIN REQUEST (DO NOT CHANGE - per contract)
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success - store token exactly as per contract
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);

            // Clear form
            emailInput.value = '';
            passwordInput.value = '';

            // Redirect to original project or show dashboard
            const redirectUrl = getRedirectUrl();
            redirectToProject(redirectUrl);
        } else {
            // Handle specific error cases per contract
            switch (response.status) {
                case 400:
                    showError('Please fill in all required fields.');
                    break;
                case 401:
                    showError('Invalid email or password. Please try again.');
                    break;
                case 403:
                    showError('Your account has been disabled. Please contact support.');
                    break;
                default:
                    showError('Something went wrong. Please try again later.');
            }
        }
    } catch (error) {
        // Network error or server unreachable
        console.error('[Auth] Login request failed:', error);
        console.error('[Auth] Attempted URL:', `${API_BASE_URL}/auth/login`);

        // Check if it's a CORS error or network error
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showError('Unable to connect to server. This may be a CORS issue or the server is unreachable.');
        } else {
            showError('Unable to connect. Please check your internet connection.');
        }
    } finally {
        setLoading(false);
    }
}

// ============================================
// LOGOUT (GLOBAL - PER CONTRACT)
// ============================================

/**
 * Handle logout - affects all projects globally
 * Per contract: Remove token, redirect to login page
 */
function logout() {
    console.log('[Auth] Logging out...');
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem('auth_session');

    // If already on login page, reload to show login form
    if (window.location.hostname === 'login.avlokai.com' ||
        window.location.hostname === 'localhost' ||
        window.location.pathname.includes('/login')) {
        window.location.reload();
    } else {
        window.location.href = LOGIN_PAGE_URL;
    }
}

/**
 * Legacy handleLogout for backward compatibility
 */
function handleLogout() {
    logout();
}

// Make logout globally available
window.logout = logout;
window.handleLogout = handleLogout;

// ============================================
// EVENT LISTENERS
// ============================================

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Logout button (will be added after DOM is ready for main app)
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Focus management for accessibility
if (emailInput) {
    emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });

    // Clear error when user starts typing
    emailInput.addEventListener('input', hideError);
}

if (passwordInput) {
    passwordInput.addEventListener('input', hideError);
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize auth check after all scripts are loaded
// This ensures app.js renderProjects function is available
window.addEventListener('load', () => {
    checkAuth();
});
