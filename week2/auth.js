/**
 * =========================================================
 * CANONICAL PROJECT AUTH GUARD (LOOP-PROOF)
 * =========================================================
 *
 * PROJECT: Week 2
 * PROJECT_ID: week2
 *
 * GUARANTEES:
 * - auth_token NEVER stays in URL
 * - Hard stop on login domain
 * - Redirect throttling
 * - Logout always works
 * - Fail-open on backend/network
 * - Safe for 50+ projects
 */

/* =========================================================
   🔐 AUTH TOKEN URL CLEANUP (MUST RUN FIRST)
   ========================================================= */
(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('auth_token');

    if (token) {
        console.log('[AuthGuard] Token handoff detected — storing token');

        // Persist token immediately
        localStorage.setItem('auth_token', token);

        // CRITICAL: Clear redirect cooldown on fresh token
        // This prevents loop-lock when user successfully logs in
        localStorage.removeItem('last_redirect_ts');

        // Remove token from URL
        params.delete('auth_token');
        const cleanUrl =
            window.location.pathname +
            (params.toString() ? `?${params.toString()}` : '') +
            window.location.hash;

        window.history.replaceState({}, document.title, cleanUrl);

        console.log('[AuthGuard] URL cleaned, token stored');
    }
})();

/* =========================================================
   PROJECT CONFIG (ONLY CHANGE THIS)
   ========================================================= */
const PROJECT_ID = 'week2';
const PROJECT_REQUIRES_AUTH = true;

/* =========================================================
   GLOBAL CONSTANTS (DO NOT CHANGE)
   ========================================================= */
const API_BASE_URL = 'https://api.avlokai.com';
const LOGIN_PAGE_URL = 'https://login.avlokai.com';
const AUTH_TOKEN_KEY = 'auth_token';
const REDIRECT_TS_KEY = 'last_redirect_ts';
const LOGOUT_FLAG_KEY = 'logout_in_progress';
const REDIRECT_COOLDOWN_MS = 3000;

/* =========================================================
   🚪 LOGOUT BYPASS (CRITICAL)
   ========================================================= */
const isLogoutInProgress = localStorage.getItem(LOGOUT_FLAG_KEY) === '1';
if (isLogoutInProgress) {
    console.warn('[AuthGuard] Logout in progress — skipping guard');
    localStorage.removeItem(LOGOUT_FLAG_KEY);
}

/* =========================================================
   SAFETY: NEVER RUN ON LOGIN DOMAIN
   ========================================================= */
const isLoginDomain = window.location.hostname === 'login.avlokai.com';
if (isLoginDomain) {
    console.warn('[AuthGuard] Login domain detected — guard disabled');
}

/* =========================================================
   RUN-ONCE PROTECTION
   ========================================================= */
const alreadyRan = window.__AUTH_GUARD_RAN__;
if (alreadyRan) {
    console.warn('[AuthGuard] Already executed — stopping');
}

/* =========================================================
   EXECUTE AUTH GUARD (only if conditions allow)
   ========================================================= */
if (!isLogoutInProgress && !isLoginDomain && !alreadyRan) {
    window.__AUTH_GUARD_RAN__ = true;

    /* =========================================================
       MAIN AUTH FLOW
       ========================================================= */
    (async function runAuthGuard() {

        const token = localStorage.getItem(AUTH_TOKEN_KEY);

        // Public project
        if (!PROJECT_REQUIRES_AUTH) {
            allowApp();
            return;
        }

        // No token → login
        if (!token) {
            redirectToLogin('no_token');
            return;
        }

        // Local dev → skip verification
        if (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1'
        ) {
            console.log('[AuthGuard] DEV MODE — skipping verification');
            allowApp();
            return;
        }

        // Verify token
        try {
            console.log('[AuthGuard] Verifying token...');
            const res = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Project-Id': PROJECT_ID
                }
            });

            // Backend failure → FAIL OPEN
            if (res.status >= 500) {
                console.warn('[AuthGuard] Backend error — FAIL OPEN');
                allowApp();
                return;
            }

            if (!res.ok) {
                console.warn('[AuthGuard] Token rejected');
                localStorage.removeItem(AUTH_TOKEN_KEY);
                redirectToLogin('unauthorized');
                return;
            }

            const result = await res.json();
            if (result.valid) {
                allowApp();
                return;
            }

            localStorage.removeItem(AUTH_TOKEN_KEY);
            redirectToLogin('invalid');

        } catch (err) {
            // Network / CORS → FAIL OPEN
            console.warn('[AuthGuard] Network error — FAIL OPEN');
            console.error(err);
            allowApp();
        }
    })();

    /* =========================================================
       REDIRECT (LOOP-SAFE)
       ========================================================= */
    function redirectToLogin(reason) {
        const now = Date.now();
        const last = Number(localStorage.getItem(REDIRECT_TS_KEY) || 0);

        if (now - last < REDIRECT_COOLDOWN_MS) {
            console.warn('[AuthGuard] Redirect suppressed (cooldown)');
            return;
        }

        localStorage.setItem(REDIRECT_TS_KEY, String(now));

        const currentUrl = window.location.href;
        window.location.href =
            `${LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}` +
            (reason ? `&reason=${reason}` : '');
    }

    /* =========================================================
       SUCCESS HANDOFF
       ========================================================= */
    function allowApp() {
        console.log('[AuthGuard] Access granted');
        window.dispatchEvent(new CustomEvent('authSuccess'));
    }

} // END conditional auth guard block

/* =========================================================
   LOGOUT (GLOBAL — ALWAYS WORKS, OUTSIDE CONDITIONAL)
   ========================================================= */
window.logout = function () {
    console.log('[AuthGuard] Logout initiated');

    localStorage.setItem(LOGOUT_FLAG_KEY, '1');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REDIRECT_TS_KEY);

    window.location.replace(`${LOGIN_PAGE_URL}?action=logout`);
};
