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
// LOGIN URL (HARDCODED)
// ============================================
const LOGIN_PAGE_URL = 'https://login.avlokai.com';

// ============================================
// GLOBAL REDIRECT LOCK
// ============================================
let __REDIRECT_IN_PROGRESS__ = false;

// ============================================
// LOGOUT (GLOBAL)
// ============================================
window.logout = function () {
    console.log('[Week2] Logout triggered');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('last_redirect_ts');
    window.location.href = `${LOGIN_PAGE_URL}?action=logout`;
};

// ============================================
// LOGIN DOMAIN DETECTION (DOMAIN ONLY)
// ============================================
function isLoginDomain() {
    return window.location.hostname === 'login.avlokai.com';
}

(async function () {

    /* =========================================================
       A. HARD STOP — NEVER RUN ON LOGIN DOMAIN
       ========================================================= */
    if (isLoginDomain()) {
        console.warn('[Week2 Auth] STOP: Login domain detected');
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
       C. CONFIGURATION
       ========================================================= */
    const PROJECT_ID = 'week2';
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

        // CRITICAL: reset redirect state
        localStorage.removeItem('last_redirect_ts');

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
        redirectToLogin('no_token');
        return;
    }

    if (!PROJECT_REQUIRES_AUTH) {
        showApp();
        return;
    }

    /* =========================================================
       F. VERIFY TOKEN (FAIL-OPEN)
       ========================================================= */

    const DEV_MODE = (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    );

    if (DEV_MODE) {
        console.log('[Week2 Auth] DEV MODE — skipping verification');
        showApp();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Project-Id': PROJECT_ID
            }
        });

        if (response.status >= 500) {
            console.warn('[Week2 Auth] Server error — FAIL OPEN');
            showApp();
            return;
        }

        if (response.ok) {
            const result = await response.json();
            if (result.valid) {
                showApp();
                return;
            }
        }

        localStorage.removeItem(AUTH_TOKEN_KEY);
        redirectToLogin('unauthorized');

    } catch (err) {
        console.warn('[Week2 Auth] Network error — FAIL OPEN');
        console.error(err);
        showApp();
    }

    /* =========================================================
       HELPERS
       ========================================================= */

    function redirectToLogin(action) {
        if (__REDIRECT_IN_PROGRESS__) return;
        __REDIRECT_IN_PROGRESS__ = true;

        const now = Date.now();
        const lastRedirect = Number(localStorage.getItem('last_redirect_ts') || 0);

        if (now - lastRedirect < 3000) {
            console.warn('[Auth] Redirect suppressed');
            return;
        }

        localStorage.setItem('last_redirect_ts', now.toString());

        const currentUrl = window.location.href;
        window.location.href =
            `${LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}` +
            (action ? `&action=${action}` : '');
    }

    function showApp() {
        window.dispatchEvent(new CustomEvent('authSuccess'));
    }

})();
