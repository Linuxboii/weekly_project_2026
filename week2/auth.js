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
// DYNAMIC URL DETECTION (Production-Grade)
// ============================================
function getLoginUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // 1. Custom Domain: week2.avlokai.com → login.avlokai.com
    if (hostname === 'week2.avlokai.com') {
        return 'https://login.avlokai.com';
    }

    // 2. Vercel Preview/Production: Detect Vercel deployment
    if (hostname.endsWith('.vercel.app')) {
        // Pattern: week2-xxx.vercel.app → login-xxx.vercel.app
        const loginHostname = hostname
            .replace(/^week2-/, 'login-')           // week2-xxx → login-xxx
            .replace(/-week2\./, '-login.')         // xxx-week2.vercel → xxx-login.vercel
            .replace(/-week2-/, '-login-');         // xxx-week2-yyy → xxx-login-yyy

        if (loginHostname === hostname) {
            console.warn('[Week2] Could not infer login URL from Vercel hostname');
            return '../login/';  // Fallback to relative
        }

        return `${protocol}//${loginHostname}`;
    }

    // 3. Local Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }

    // 4. Fallback: Same origin, relative path
    return '../login/';
}

// ============================================
// LOGOUT (ALWAYS AVAILABLE GLOBALLY)
// ============================================
const __WEEK2_LOGIN_URL__ = getLoginUrl();
console.log('[Week2] Login URL resolved to:', __WEEK2_LOGIN_URL__);

window.logout = function () {
    console.log('[Week2] Logout triggered');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('last_redirect_ts');
    window.location.href = `${__WEEK2_LOGIN_URL__}?action=logout`;
};

// ============================================
// HELPER: Check if we're on the login domain/page
// ============================================
function isLoginDomain() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Custom domain check
    if (hostname === 'login.avlokai.com') return true;

    // Vercel login deployment check
    if (hostname.endsWith('.vercel.app')) {
        if (hostname.startsWith('login-') ||
            hostname.includes('-login.') ||
            hostname.includes('-login-')) {
            return true;
        }
    }

    // Path-based check (monorepo style)
    if (pathname.includes('/login/') || pathname.startsWith('/login')) return true;

    return false;
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
    const LOGIN_PAGE_URL = __WEEK2_LOGIN_URL__;  // Use dynamically resolved URL
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
        const currentUrl = window.location.href;
        const loginUrl =
            `${LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}` +
            (action ? `&action=${action}` : '');

        window.location.href = loginUrl;
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
