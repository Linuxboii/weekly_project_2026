/**
 * Auth Guard for Week 1 Project (File Uploader)
 * 
 * Checks for auth token and shows the app.
 * Note: Verification is disabled until CORS is fixed on backend.
 */

// ============================================
// PROJECT METADATA
// ============================================
const PROJECT_ID = 'week1';
const PROJECT_REQUIRES_AUTH = true;

// ============================================
// CONFIGURATION
// ============================================
const AUTH_GUARD_CONFIG = {
    API_BASE_URL: 'https://api.avlokai.com',
    AUTH_TOKEN_KEY: 'auth_token',
    LOGIN_PAGE_URL: 'https://login.avlokai.com/',
};

const THEME_KEY = 'theme';

// ============================================
// DOM ELEMENTS
// ============================================
const mainContainer = document.getElementById('main-container');

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
    updateThemeButton();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
}

// Initialize theme
initTheme();

// ============================================
// AUTH GUARD CORE
// ============================================

function redirectToLogin() {
    const currentUrl = window.location.href;
    window.location.href = `${AUTH_GUARD_CONFIG.LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}`;
}

function showMainApp() {
    const authLoading = document.getElementById('auth-loading');
    if (authLoading) {
        authLoading.classList.add('hidden');
    }
    if (mainContainer) {
        mainContainer.classList.remove('hidden');
    }
    document.title = 'Avlok AI - Week 1';
}

function initAuthGuard() {
    const token = localStorage.getItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);

    if (!token && PROJECT_REQUIRES_AUTH) {
        // No token - redirect to login (only once)
        console.log('[AuthGuard] No token - redirecting to login');
        redirectToLogin();
        return;
    }

    if (!PROJECT_REQUIRES_AUTH) {
        // Public project
        showMainApp();
        return;
    }

    // Has token - show the app
    // Note: Skipping /auth/verify due to CORS issues on backend
    // When CORS is fixed, uncomment the verification code below
    console.log('[AuthGuard] Token found - showing app');
    showMainApp();

    /*
    // VERIFICATION CODE (enable when CORS is fixed)
    try {
        const response = await fetch(`${AUTH_GUARD_CONFIG.API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Project-Id': PROJECT_ID
            }
        });
        const result = await response.json();
        if (result.valid) {
            showMainApp();
        } else {
            localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
            redirectToLogin();
        }
    } catch (error) {
        console.error('[AuthGuard] Verification failed:', error);
        showMainApp(); // Show app anyway on error
    }
    */
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
    window.location.href = AUTH_GUARD_CONFIG.LOGIN_PAGE_URL;
}

function handleLogout() {
    logout();
}

window.logout = logout;
window.handleLogout = handleLogout;

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

// ============================================
// INITIALIZATION
// ============================================

initAuthGuard();
