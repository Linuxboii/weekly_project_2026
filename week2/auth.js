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
 * - Logout-safe (no race conditions)
 * - Fail-open on backend / network errors
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
const LOGOUT_FLAG_KEY = 'logout_in_progress';
const REDIRECT_COOLDOWN_MS = 3000;

/* =========================================================
   LOGOUT BYPASS (CRITICAL)
   Must run BEFORE any auth logic
   ========================================================= */
if (localStorage.getItem(LOGOUT_FLAG_KEY) === '1') {
  console.warn('[AuthGuard] Logout in progress — skipping guard');
  localStorage.removeItem(LOGOUT_FLAG_KEY);
  return;
}

/* =========================================================
   SAFETY: NEVER RUN ON LOGIN DOMAIN
   ========================================================= */
if (window.location.hostname === 'login.avlokai.com') {
  console.warn('[AuthGuard] Login domain detected — guard disabled');
  return;
}

/* =========================================================
   RUN-ONCE PROTECTION
   ========================================================= */
if (window.__AUTH_GUARD_RAN__) {
  console.warn('[AuthGuard] Already executed — stopping');
  return;
}
window.__AUTH_GUARD_RAN__ = true;

/* =========================================================
   MAIN AUTH FLOW
   ========================================================= */
runAuthGuard();

async function runAuthGuard() {
  /* -------------------------------------------------------
     TOKEN HANDOFF (URL → localStorage)
     ------------------------------------------------------- */
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('auth_token');

  if (urlToken) {
    console.log('[AuthGuard] Token handoff detected');
    localStorage.setItem(AUTH_TOKEN_KEY, urlToken);

    params.delete('auth_token');
    const cleanUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : '') +
      window.location.hash;

    window.history.replaceState({}, document.title, cleanUrl);
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  /* -------------------------------------------------------
     PUBLIC PROJECT
     ------------------------------------------------------- */
  if (!PROJECT_REQUIRES_AUTH) {
    allowApp();
    return;
  }

  /* -------------------------------------------------------
     NO TOKEN → LOGIN
     ------------------------------------------------------- */
  if (!token) {
    redirectToLogin('no_token');
    return;
  }

  /* -------------------------------------------------------
     LOCAL DEV → SKIP VERIFY
     ------------------------------------------------------- */
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    console.log('[AuthGuard] DEV MODE — skipping verification');
    allowApp();
    return;
  }

  /* -------------------------------------------------------
     VERIFY TOKEN WITH BACKEND
     ------------------------------------------------------- */
  try {
    console.log('[AuthGuard] Verifying token...');
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Project-Id': PROJECT_ID
      }
    });

    // Backend error → FAIL OPEN
    if (res.status >= 500) {
      console.warn('[AuthGuard] Backend error — FAIL OPEN');
      allowApp();
      return;
    }

    // Explicit denial
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
    // Network / CORS error → FAIL OPEN
    console.warn('[AuthGuard] Network error — FAIL OPEN');
    console.error(err);
    allowApp();
  }
}

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

/* =========================================================
   LOGOUT (GLOBAL — GUARANTEED)
   ========================================================= */
window.logout = function () {
  console.log('[AuthGuard] Logout initiated');

  // Prevent auth guard from firing during navigation
  localStorage.setItem(LOGOUT_FLAG_KEY, '1');

  // Clear auth data immediately
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REDIRECT_TS_KEY);

  // Hard redirect
  window.location.replace(`${LOGIN_PAGE_URL}?action=logout`);
};
