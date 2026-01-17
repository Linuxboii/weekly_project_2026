/**
 * Auth Guard Module for Avlok AI Protected Projects
 * 
 * Include this file in any protected project to enforce authentication.
 * 
 * USAGE:
 * 1. Define PROJECT_ID and PROJECT_REQUIRES_AUTH before including this script
 * 2. Call initAuthGuard() on page load
 * 3. Use logout() for logout functionality
 * 
 * EXAMPLE:
 * ```html
 * <script>
 *     const PROJECT_ID = "week1";
 *     const PROJECT_REQUIRES_AUTH = true;
 * </script>
 * <script src="auth-guard.js"></script>
 * ```
 */

// ============================================
// CONFIGURATION (DO NOT MODIFY)
// ============================================
const AUTH_GUARD_CONFIG = {
    API_BASE_URL: 'https://api.avlokai.com',
    AUTH_TOKEN_KEY: 'auth_token',
    LOGIN_PAGE_URL: 'https://login.avlokai.com/',
};

// ============================================
// PROJECT METADATA (PROVIDED BY DEVELOPER)
// These should be defined BEFORE including this script
// ============================================
// const PROJECT_ID = "week1";        // unique project identifier
// const PROJECT_REQUIRES_AUTH = true; // true or false

// ============================================
// AUTH GUARD CORE
// ============================================

/**
 * Initialize the auth guard
 * Call this function on page load for protected projects
 * 
 * @param {Object} options - Optional configuration
 * @param {Function} options.onSuccess - Callback when auth succeeds
 * @param {Function} options.onFailure - Callback when auth fails
 * @returns {Promise<Object|null>} Verification response or null for public projects
 */
async function initAuthGuard(options = {}) {
    const { onSuccess, onFailure } = options;

    // Check if project metadata is defined
    if (typeof PROJECT_ID === 'undefined') {
        console.error('[AuthGuard] PROJECT_ID is not defined');
        return null;
    }

    if (typeof PROJECT_REQUIRES_AUTH === 'undefined') {
        console.error('[AuthGuard] PROJECT_REQUIRES_AUTH is not defined');
        return null;
    }

    // PUBLIC PROJECTS: No auth required
    if (!PROJECT_REQUIRES_AUTH) {
        console.log('[AuthGuard] Public project - skipping auth');
        if (onSuccess) onSuccess({ valid: true, public: true });
        return { valid: true, public: true };
    }

    // PROTECTED PROJECTS: Check token and verify
    const token = localStorage.getItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);

    // No token → redirect to login
    if (!token) {
        console.log('[AuthGuard] No token - redirecting to login');
        redirectToLogin();
        return null;
    }

    // Verify access with backend
    try {
        const verifyResult = await verifyAccess(token);

        if (verifyResult.valid) {
            console.log('[AuthGuard] Access verified for user:', verifyResult.userId);
            if (onSuccess) onSuccess(verifyResult);
            return verifyResult;
        } else {
            console.log('[AuthGuard] Access denied:', verifyResult.reason);
            handleAccessDenied(verifyResult.reason);
            if (onFailure) onFailure(verifyResult);
            return null;
        }
    } catch (error) {
        console.error('[AuthGuard] Verification error:', error);
        handleAccessDenied('verification_failed');
        if (onFailure) onFailure({ valid: false, reason: 'verification_failed' });
        return null;
    }
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
 * @param {string} reason - Reason for denial (role_not_allowed | project_not_found | etc.)
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
        default:
            message = 'Access denied. Please log in again.';
    }

    alert(message);
    localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
    redirectToLogin();
}

/**
 * Redirect to login page with current URL as redirect param
 */
function redirectToLogin() {
    const currentUrl = window.location.href;
    window.location.href = `${AUTH_GUARD_CONFIG.LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}`;
}

// ============================================
// LOGOUT (GLOBAL)
// ============================================

/**
 * Logout - affects all projects globally
 * Per contract: Remove token, redirect to login
 */
function logout() {
    localStorage.removeItem(AUTH_GUARD_CONFIG.AUTH_TOKEN_KEY);
    window.location.href = AUTH_GUARD_CONFIG.LOGIN_PAGE_URL;
}

// Make functions globally available
window.initAuthGuard = initAuthGuard;
window.logout = logout;
window.verifyAccess = verifyAccess;

// ============================================
// AUTO-INIT (OPTIONAL)
// ============================================

/**
 * Auto-initialize on DOMContentLoaded if PROJECT_ID is defined
 * This allows for simple drop-in usage
 */
document.addEventListener('DOMContentLoaded', () => {
    // Only auto-init if we have project metadata
    if (typeof PROJECT_ID !== 'undefined' && typeof PROJECT_REQUIRES_AUTH !== 'undefined') {
        // Check for auto-init flag (can be disabled by setting this to false)
        if (typeof AUTH_GUARD_AUTO_INIT === 'undefined' || AUTH_GUARD_AUTO_INIT === true) {
            initAuthGuard().then((result) => {
                if (result && result.valid) {
                    // Dispatch custom event for app to listen to
                    window.dispatchEvent(new CustomEvent('authGuardSuccess', { detail: result }));
                }
            });
        }
    }
});
