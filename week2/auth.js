/**
 * =========================================================
 * CANONICAL PROJECT AUTH GUARD (NO REDIRECT LOOPS)
 * =========================================================
 *
 * PROJECT: Week 2
 * PROJECT_ID: week2
 *
 * GUARANTEES:
 * - Hard stop on login domain
 * - Redirect throttling (loop-proof)
 * - Fail-open on backend / network errors
 * - No environment guessing
 * - Safe for 50+ projects
 */

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
const REDIRECT_COOLDOWN_MS = 3000;

/* =========================================================
   SAFETY: NEVER RUN ON LOGIN DOMAIN
   ========================================================= */
const IS_LOGIN_DOMAIN = window.location.hostname === 'login.avlokai.com';

if (IS_LOGIN_DOMAIN) {
    console.warn('[AuthGuard] Login domain detected — guard disabled');
} else if (window.__AUTH_GUARD_RAN__) {
    console.warn('[AuthGuard] Already executed — stopping');
} else {
    window.__AUTH_GUARD_RAN__ = true;
    runAuthGuard();
}

async function runAuthGuard() {

    /* =========================================================
       TOKEN HANDOFF (URL → localStorage)
       ========================================================= */
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('auth_token');

    if (urlToken) {
        console.log('[AuthGuard] Token handoff detected');
        localStorage.setItem(AUTH_TOKEN_KEY, urlToken);

        params.delete('auth_token');
        const cleanUrl =
            window.location.pathname +
            (params.toString() ? `?${params}` : '') +
            window.location.hash;

        window.history.replaceState({}, document.title, cleanUrl);
    }

    /* =========================================================
       MAIN AUTH FLOW
       ========================================================= */
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

    // Verify token with backend
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
} // end runAuthGuard

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
    const loginUrl =
        `${LOGIN_PAGE_URL}?redirect=${encodeURIComponent(currentUrl)}` +
        (reason ? `&reason=${reason}` : '');

    window.location.href = loginUrl;
}

/* =========================================================
   SUCCESS HANDOFF
   ========================================================= */
function allowApp() {
    console.log('[AuthGuard] Access granted');
    window.dispatchEvent(new CustomEvent('authSuccess'));
}

/* =========================================================
   LOGOUT (GLOBAL)
   ========================================================= */
window.logout = function () {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REDIRECT_TS_KEY);
    window.location.href = LOGIN_PAGE_URL;
};
