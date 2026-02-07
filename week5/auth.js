/**
 * ============================================
 * PROTECTED PROJECT PAGE - AUTH GUARD
 * ============================================
 * 
 * FOR USE ON: https://week5.avlokai.com (and other protected projects)
 * 
 * This script handles:
 * - Checking for auth token
 * - Redirecting to login if missing
 * - Verifying token with /auth/verify
 * - Showing the app after verification
 * 
 * SAFETY: This script will NOT run on login domain
 */

// ============================================
// PROJECT METADATA (PROTECTED PAGES ONLY)
// ============================================
const PROJECT_ID = 'week5';
const PROJECT_REQUIRES_AUTH = true;

// ============================================
// URL CONFIGURATION
// Production custom domains - EDIT THESE if your domains are different
// ============================================
const CUSTOM_DOMAINS = {
    login: 'login.avlokai.com',
    week5: 'week5.avlokai.com'
};

// ============================================
// DYNAMIC URL DETECTION
// ============================================
function getLoginUrl() {
    const hostname = window.location.hostname;

    // 1. Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001/';
    }

    // 2. Custom domain (week5.avlokai.com) → go to login.avlokai.com
    if (hostname === CUSTOM_DOMAINS.week5) {
        return `https://${CUSTOM_DOMAINS.login}/`;
    }

    // 3. Vercel deployment → redirect to production custom domain
    if (hostname.endsWith('.vercel.app')) {
        console.log('[week5] Vercel deployment detected, using production login URL');
        return `https://${CUSTOM_DOMAINS.login}/`;
    }

    // 4. Fallback: relative URL
    return '../login/';
}

// ============================================
// HELPER: Check if we're on the login domain/page
// ============================================
function isLoginDomain() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Check if we're on the login custom domain
    if (hostname === CUSTOM_DOMAINS.login) return true;

    // Path-based check (monorepo style)
    if (pathname.includes('/login/') || pathname.startsWith('/login')) return true;

    return false;
}

// ============================================
// CONFIGURATION
// ============================================
const AUTH_GUARD_CONFIG = {
    API_BASE_URL: 'https://api.avlokai.com',
    AUTH_TOKEN_KEY: 'auth_token',
    LOGIN_PAGE_URL: getLoginUrl(),
};
console.log('[week5] Login URL:', AUTH_GUARD_CONFIG.LOGIN_PAGE_URL);

const THEME_KEY = 'theme';

// ============================================
// DOM ELEMENTS
// ============================================
const mainContainer = document.getElementById('root');

// ============================================
// LOGIN PAGE DETECTION (SAFETY - REQUIRED)
// ============================================
const IS_LOGIN_PAGE = isLoginDomain();

if (IS_LOGIN_PAGE) {
    console.log('[AuthGuard] Login page detected — auth guard disabled');
    // Exit immediately - do not run auth guard on login page
} else {
    // Run auth guard only on protected pages
    initProtectedPage();
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

// ============================================
// AUTH GUARD CORE
// ============================================

/**
 * Check for token passed via URL (cross-subdomain handoff)
 * Stores it in localStorage and cleans the URL
 */
function checkUrlTokenHandoff() {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('auth_token');

    if (urlToken) {
        // Store the token
        localStorage.setItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY, urlToken);
        console.log('[AuthGuard] Token received via URL handoff');

        // Clean the URL (remove token parameter for security)
        params.delete('auth_token');
        const newUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        return urlToken;
    }
    return null;
}

function redirectToLogin() {
    // SAFETY: Never redirect if already on login page
    if (window.location.hostname === 'login.avlokai.com') {
        console.log('[AuthGuard] Already on login page - not redirecting');
        return;
    }

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
    document.title = 'AvlokAi Dashboard';
}

async function verifyToken(token) {
    try {
        const response = await fetch(`${AUTH_GUARD_CONFIG.API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Project-Id': PROJECT_ID,
                'Content-Type': 'application/json'
            }
        });

        // Handle non-OK responses explicitly
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return { valid: false, reason: data.reason || 'invalid_token' };
        }

        return await response.json();
    } catch (error) {
        console.error('[AuthGuard] Verification request failed:', error);
        // CRITICAL (spec section 6): On network/CORS error, do NOT redirect
        // Allow UI to load - backend APIs will enforce access on actual calls
        console.warn('[AuthGuard] Network error - allowing UI to load (backend will enforce)');
        return { valid: true, network_error: true };
    }
}

async function initProtectedPage() {
    // Initialize theme first
    initTheme();

    // Check for token handoff from login page (cross-subdomain)
    // If we just received a fresh token, skip verification (it was just issued)
    const freshToken = checkUrlTokenHandoff();

    const token = localStorage.getItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);

    // No token - redirect to login
    if (!token && PROJECT_REQUIRES_AUTH) {
        console.log('[AuthGuard] No token - redirecting to login');
        redirectToLogin();
        return;
    }

    // Public project - skip auth
    if (!PROJECT_REQUIRES_AUTH) {
        console.log('[AuthGuard] Public project - showing app');
        showMainApp();
        setupEventListeners();
        return;
    }

    // Fresh token from login page - trust it, skip verification
    if (freshToken) {
        console.log('[AuthGuard] Fresh token from login - showing app');
        showMainApp();
        setupEventListeners();
        return;
    }

    // Existing token - verify with backend
    console.log('[AuthGuard] Verifying existing token...');
    const result = await verifyToken(token);

    if (result.valid) {
        console.log('[AuthGuard] Token valid - showing app');
        showMainApp();
        setupEventListeners();
    } else {
        console.log('[AuthGuard] Token invalid - redirecting to login');
        localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
        redirectToLogin();
    }
}

// ============================================
// LOGOUT (GLOBAL)
// ============================================

function logout() {
    localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
    window.location.href = `${AUTH_GUARD_CONFIG.LOGIN_PAGE_URL}?action=logout`;
}

window.logout = logout;

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
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
}

// ============================================
// EXPOSE AUTH HELPERS ON WINDOW (for React to access)
// ============================================

/**
 * Get the current auth token
 * @returns {string|null} The auth token or null if not authenticated
 */
window.getAuthToken = function () {
    return localStorage.getItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
window.isAuthenticated = function () {
    return !!window.getAuthToken();
};

