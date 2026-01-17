/**
 * Auth Guard for Week 1 Project (File Uploader)
 * 
 * This file handles authentication verification for the Week 1 project.
 * It follows the Avlok AI authentication contract exactly.
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

async function verifyAccess(token) {
    const response = await fetch(`${AUTH_GUARD_CONFIG.API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Project-Id': PROJECT_ID
        }
    });
    return await response.json();
}

function handleAccessDenied(reason) {
    let message = 'Access denied. Please log in again.';
    if (reason === 'role_not_allowed') {
        message = 'You do not have permission to access this project.';
    } else if (reason === 'project_not_found') {
        message = 'This project could not be found.';
    }
    alert(message);
    localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
    redirectToLogin();
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

async function initAuthGuard() {
    const token = localStorage.getItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);

    // No token → redirect to login
    if (!token && PROJECT_REQUIRES_AUTH) {
        console.log('[AuthGuard] No token - redirecting to login');
        redirectToLogin();
        return;
    }

    // Public projects: skip verification
    if (!PROJECT_REQUIRES_AUTH) {
        showMainApp();
        return;
    }

    // Verify access with backend
    try {
        console.log('[AuthGuard] Verifying access...');
        const result = await verifyAccess(token);

        if (result.valid) {
            console.log('[AuthGuard] Access verified');
            showMainApp();
        } else {
            console.log('[AuthGuard] Access denied:', result.reason);
            handleAccessDenied(result.reason);
        }
    } catch (error) {
        console.error('[AuthGuard] Verification error:', error);
        // On error, just show the app (don't loop)
        showMainApp();
    }
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
