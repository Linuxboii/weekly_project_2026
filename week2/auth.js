/**
 * STRICT PROJECT-LEVEL AUTHENTICATION
 *
 * PROJECT: Week 2
 * PROJECT_ID: week2
 *
 * GUARANTEES:
 * - No redirect loops
 * - Fail-open on network/server errors
 * - Hard stop on login domain
 * - Canonical project ID alignment
 */

// ============================================
// LOGIN URL (HARDCODED - FIX 2)
// All environments use the same login domain
// ============================================
const LOGIN_PAGE_URL = 'https://login.avlokai.com';

// ============================================
// LOGOUT (ALWAYS AVAILABLE GLOBALLY)
// ============================================
window.logout = function () {
    console.log('[Week2] Logout triggered');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('last_redirect_ts');
    window.location.href = `${LOGIN_PAGE_URL}?action=logout`;
};

// ============================================
// LOGIN DOMAIN DETECTION (FIX 1 - DOMAIN ONLY)
// No pathname checks allowed
// ============================================
function isLoginDomain() {
    return window.location.hostname === 'login.avlokai.com';
}

(async function () {
    /* =========================================================
       A. HARD STOP — NEVER RUN ON LOGIN DOMAIN
       ========================================================= */
    if (isLoginDomain()) {
        console.warn('[Week2 Auth] STOP: Login domain/path detected');
        return;
    }

    /* =========================================================
       B. RUN-ONCE PROTECTION
       ========================================================= */
    if (window.__WEEK2_AUTH_RAN__) {
        console.warn('[Week2 Auth] STOP: Already executed');
        return;
    }
    window.__WEEK2_AUTH_RAN__ = true;

    /* =========================================================
       C. CONFIGURATION (CANONICAL)
       ========================================================= */
    const PROJECT_ID = 'week2';                 // 🔒 MUST match DB
    const PROJECT_REQUIRES_AUTH = true;
    const API_BASE_URL = 'https://api.avlokai.com';
    const AUTH_TOKEN_KEY = 'auth_token';

    /* =========================================================
       D. TOKEN HANDOFF (URL → localStorage)
       ========================================================= */
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('auth_token');

    if (urlToken) {
        console.log('[Week2 Auth] Token handoff detected');
        localStorage.setItem(AUTH_TOKEN_KEY, urlToken);

        // Remove token from URL without reload
        params.delete('auth_token');
        const cleanUrl =
            window.location.pathname +
            (params.toString() ? `?${params.toString()}` : '') +
            window.location.hash;

        window.history.replaceState({}, document.title, cleanUrl);
    }

    /* =========================================================
       E. TOKEN PRESENCE CHECK
       ========================================================= */
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (PROJECT_REQUIRES_AUTH && !token) {
        console.warn('[Week2 Auth] No token → redirecting to login');
        redirectToLogin('no_token');
        return;
    }

    // Public project (future-proofing)
    if (!PROJECT_REQUIRES_AUTH) {
        showApp();
        return;
    }

    /* =========================================================
       F. VERIFY TOKEN (FAIL-OPEN STRATEGY)
       ========================================================= */

    // DEV MODE: Skip API verification for local development
    const DEV_MODE = window.location.hostname === 'localhost';

    if (DEV_MODE) {
        console.log('[Week2 Auth] DEV MODE: Skipping API verification');
        console.log('[Week2 Auth] Token present:', token ? 'Yes' : 'No');
        showApp();
        return;
    }

    try {
        console.log('[Week2 Auth] Verifying token with API...');
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Project-Id': PROJECT_ID
            }
        });

        console.log('[Week2 Auth] Verify response status:', response.status);

        // FAIL-OPEN on backend/network failure
        if (response.status >= 500) {
            console.warn('[Week2 Auth] Server error → FAIL OPEN');
            showApp();
            return;
        }

        if (response.ok) {
            const result = await response.json();
            console.log('[Week2 Auth] Verify result:', result);

            if (result.valid) {
                console.log('[Week2 Auth] Access verified');
                showApp();
                return;
            }
        }

        // Explicit denial (401 / 403)
        console.warn('[Week2 Auth] Access denied → redirecting');
        localStorage.removeItem(AUTH_TOKEN_KEY);
        redirectToLogin('unauthorized');

    } catch (err) {
        // Network error → FAIL OPEN
        console.warn('[Week2 Auth] Network error → FAIL OPEN');
        console.error(err);
        showApp();
    }

    /* =========================================================
       HELPERS
       ========================================================= */

    function redirectToLogin(action) {
        const now = Date.now();
        const lastRedirect = Number(localStorage.getItem('last_redirect_ts') || 0);

        // FIX 3: Prevent redirect loops (3-second window)
        if (now - lastRedirect < 3000) {
            console.warn('[Auth] Redirect suppressed to prevent loop');
            return;
        }

        localStorage.setItem('last_redirect_ts', now.toString());

        const currentUrl = window.location.href;
        window.location.href =
            `${LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}` +
            (action ? `&action=${action}` : '');
    }

    function showApp() {
        // Signal app that auth passed
        window.dispatchEvent(new CustomEvent('authSuccess'));
    }

    /* =========================================================
       LOGOUT (GLOBAL) - Moved outside IIFE
       ========================================================= */
    // window.logout is now defined at the top of the file

})();
