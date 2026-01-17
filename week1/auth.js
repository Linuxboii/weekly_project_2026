/**
 * Auth Guard for Week 1 Project (File Uploader)
 * 
 * This file handles authentication verification for the Week 1 project.
 * It follows the Avlok AI authentication contract exactly.
 * 
 * The login form has been REMOVED from this project.
 * Users MUST be redirected from https://login.avlokai.com for authentication.
 */

// ============================================
// PROJECT METADATA (AUTHORITATIVE)
// ============================================
const PROJECT_ID = 'week1';
const PROJECT_REQUIRES_AUTH = true;

// ============================================
// CONFIGURATION (DO NOT MODIFY)
// ============================================
const AUTH_GUARD_CONFIG = {
    API_BASE_URL: 'https://api.avlokai.com',
    AUTH_TOKEN_KEY: 'auth_token',
    AUTH_SESSION_KEY: 'auth_session', // Tracks valid login session
    LOGIN_PAGE_URL: 'https://login.avlokai.com/',
    ALLOWED_REFERRERS: ['login.avlokai.com', 'localhost'], // Add localhost for development
};

const THEME_KEY = 'theme';

// ============================================
// DOM ELEMENTS
// ============================================
const mainContainer = document.getElementById('main-container');

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
    updateThemeButton();
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeButton();
}

/**
 * Update theme button text
 */
function updateThemeButton() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
}

// Initialize theme on page load
initTheme();

// ============================================
// AUTH GUARD CORE
// ============================================

/**
 * Redirect to login page with current URL as redirect param
 */
function redirectToLogin() {
    const currentUrl = window.location.href;
    window.location.href = `${AUTH_GUARD_CONFIG.LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}`;
}

/**
 * Check if the user came from an allowed referrer (login page)
 * This prevents direct access to the project without going through login
 */
function isValidReferrer() {
    const referrer = document.referrer;

    // If there's a valid auth session, allow access
    if (sessionStorage.getItem(AUTH_GUARD_CONFIG.AUTH_SESSION_KEY) === 'valid') {
        return true;
    }

    // Check if referrer is from an allowed domain
    if (referrer) {
        try {
            const referrerUrl = new URL(referrer);
            const isAllowed = AUTH_GUARD_CONFIG.ALLOWED_REFERRERS.some(
                allowed => referrerUrl.hostname === allowed || referrerUrl.hostname.endsWith('.' + allowed)
            );

            if (isAllowed) {
                // Mark this session as valid (for page refreshes)
                sessionStorage.setItem(AUTH_GUARD_CONFIG.AUTH_SESSION_KEY, 'valid');
                return true;
            }
        } catch (e) {
            // Invalid referrer URL
        }
    }

    return false;
}

/**
 * Verify access with the backend
 * Per contract: POST /auth/verify with Authorization and X-Project-Id headers
 * 
 * @param {string} token - JWT token from localStorage
 * @returns {Promise<Object>} Verification response
 */
async function verifyAccess(token) {
    const response = await fetch(`${AUTH_GUARD_CONFIG.API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Project-Id': PROJECT_ID
        }
    });

    const data = await response.json();
    return data;
}

/**
 * Handle access denied
 * Per contract: Alert, remove token, redirect to login
 * 
 * @param {string} reason - Reason for denial
 */
function handleAccessDenied(reason) {
    let message = 'Access denied';

    switch (reason) {
        case 'role_not_allowed':
            message = 'You do not have permission to access this project.';
            break;
        case 'project_not_found':
            message = 'This project could not be found.';
            break;
        case 'verification_failed':
            message = 'Unable to verify your access. Please log in again.';
            break;
        case 'direct_access':
            message = 'Please log in to access this project.';
            break;
        default:
            message = 'Access denied. Please log in again.';
    }

    alert(message);
    localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_SESSION_KEY);
    redirectToLogin();
}

/**
 * Show the main application UI
 */
function showMainApp() {
    // Hide auth loading spinner
    const authLoading = document.getElementById('auth-loading');
    if (authLoading) {
        authLoading.classList.add('hidden');
    }

    if (mainContainer) {
        mainContainer.classList.remove('hidden');
    }
    document.title = 'Avlok AI - Week 1';
}

/**
 * Initialize the auth guard
 * Per contract:
 * - Check if accessed from valid referrer (login page)
 * - If no token and PROJECT_REQUIRES_AUTH → redirect to login
 * - If token exists → call /auth/verify
 * - Only render UI after verification succeeds
 */
async function initAuthGuard() {
    // Check for token
    const token = localStorage.getItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);

    // No token → redirect to login
    if (!token && PROJECT_REQUIRES_AUTH) {
        console.log('[AuthGuard] No token - redirecting to login');
        sessionStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_SESSION_KEY);
        redirectToLogin();
        return;
    }

    // PUBLIC PROJECTS: No verification needed
    if (!PROJECT_REQUIRES_AUTH) {
        console.log('[AuthGuard] Public project - skipping verification');
        showMainApp();
        return;
    }

    // Check if user came from login page (prevent direct access)
    if (!isValidReferrer()) {
        console.log('[AuthGuard] Direct access detected - redirecting to login');
        handleAccessDenied('direct_access');
        return;
    }

    // PROTECTED PROJECTS: Verify access before showing UI
    try {
        console.log('[AuthGuard] Verifying access...');
        const result = await verifyAccess(token);

        if (result.valid) {
            console.log('[AuthGuard] Access verified for user:', result.userId);
            showMainApp();
        } else {
            console.log('[AuthGuard] Access denied:', result.reason);
            handleAccessDenied(result.reason);
        }
    } catch (error) {
        console.error('[AuthGuard] Verification error:', error);
        handleAccessDenied('verification_failed');
    }
}

// ============================================
// LOGOUT (GLOBAL)
// ============================================

/**
 * Logout - affects all projects globally
 * Per contract: Remove token, redirect to login (which will show login form)
 */
function logout() {
    console.log('[AuthGuard] Logging out...');
    // Clear all auth data
    localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_SESSION_KEY);
    // Redirect to login page (token is removed, so login form will show)
    window.location.href = AUTH_GUARD_CONFIG.LOGIN_PAGE_URL;
}

// Legacy alias
function handleLogout() {
    logout();
}

// Make logout globally available
window.logout = logout;
window.handleLogout = handleLogout;

// ============================================
// EVENT LISTENERS
// ============================================

// Attach event listeners immediately when script loads
(function attachEventListeners() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupEventListeners);
    } else {
        setupEventListeners();
    }
})();

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Logout button - use onclick attribute as backup
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
        // Also set onclick directly for reliability
        logoutBtn.onclick = function (e) {
            e.preventDefault();
            logout();
            return false;
        };
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize auth guard on page load
initAuthGuard();
