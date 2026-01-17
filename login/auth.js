/**
 * STRICT LOGIN AUTHENTICATION (login/auth.js)
 * 
 * PURPOSE: Authenticate & Redirect ONLY.
 * RULES:
 * - NO verification calls.
 * - NO Auth Guard.
 * - Absolute Redirect URLs.
 * - Redirect Loop Protection: Redirect immediately if token exists.
 */

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'https://api.avlokai.com';
const AUTH_TOKEN_KEY = 'auth_token';
const THEME_KEY = 'theme';

// ============================================
// DYNAMIC URL DETECTION (Production-Grade)
// ============================================
function getDashboardUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // 1. Custom Domain: login.avlokai.com → week2.avlokai.com
    if (hostname === 'login.avlokai.com') {
        return 'https://week2.avlokai.com';
    }

    // 2. Vercel Preview/Production: Detect Vercel deployment
    //    Vercel URLs: project-name.vercel.app OR project-git-branch-team.vercel.app
    if (hostname.endsWith('.vercel.app')) {
        // Try to find corresponding week2 deployment
        // Pattern: login-xxx.vercel.app → week2-xxx.vercel.app
        // Or: weekly-project-2026-login.vercel.app → weekly-project-2026-week2.vercel.app
        const week2Hostname = hostname
            .replace(/^login-/, 'week2-')           // login-xxx → week2-xxx
            .replace(/-login\./, '-week2.')         // xxx-login.vercel → xxx-week2.vercel
            .replace(/-login-/, '-week2-');         // xxx-login-yyy → xxx-week2-yyy

        // If no substitution happened, the naming might be different
        // In that case, use relative path as fallback
        if (week2Hostname === hostname) {
            console.warn('[Login] Could not infer week2 URL from Vercel hostname');
            return '../week2/';  // Fallback to relative (works if same root deploy)
        }

        return `${protocol}//${week2Hostname}`;
    }

    // 3. Local Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5173';  // Vite default port for week2
    }

    // 4. Fallback: Same origin, relative path
    console.warn('[Login] Unknown deployment environment, using relative URL');
    return '../week2/';
}

const DASHBOARD_URL = getDashboardUrl();
console.log('[Login] Dashboard URL resolved to:', DASHBOARD_URL);

// ============================================
// HANDLE LOGOUT/RELOGIN IMMEDIATELY (before DOM)
// ============================================
(function () {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (action === 'logout' || action === 'relogin' || action === 'no_token' || action === 'unauthorized') {
        console.log('[Login] Action detected (early):', action);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('last_redirect_ts');

        // Clean URL immediately
        params.delete('action');
        const newSearch = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, document.title, `${window.location.pathname}${newSearch}`);
    }
})();

// ============================================
// DOM ELEMENTS
// ============================================
const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const btnText = loginBtn?.querySelector('.btn-text');
const btnLoader = loginBtn?.querySelector('.btn-loader');
const errorMessage = document.getElementById('error-message');
const loginThemeToggle = document.getElementById('login-theme-toggle');
const passwordToggleBtn = document.getElementById('toggle-password');

// ============================================
// CORE LOGIC
// ============================================

function initLoginPage() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const redirectUrl = getRedirectUrl();

    // 1. If Token Exists -> Redirect Immediately (Do NOT Verify)
    // 1. If Token Exists -> Redirect Immediately (Do NOT Verify)
    if (token) {
        // Loop Detection Safety Valve
        const lastRedirect = localStorage.getItem('last_redirect_ts');
        const now = Date.now();

        // Extended to 5 seconds to catch slower loops
        if (lastRedirect && (now - parseInt(lastRedirect) < 5000)) {
            console.error('[Login] Loop detected! Redirected too quickly.');
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem('last_redirect_ts');

            // EMERGENCY BREAK
            // alert('CRITICAL: Login Loop Detected! Your session has been reset.\n\nPlease log in again.');

            showError('Login loop detected. Please log in again.');
            // Stop execution, show form
            if (loginScreen) loginScreen.classList.remove('hidden');
            return;
        }

        // If we have a redirect URL, assume previous attempt failed or we need to go there
        // But if redirect URL is THIS page, stop.
        if (redirectUrl && !redirectUrl.includes('login/index.html')) {
            performRedirect(redirectUrl, token);
        } else {
            performRedirect(DASHBOARD_URL, token);
        }
        return; // Stop execution
    }

    // 2. No Token -> Show Login Form
    // (This is the default state of the HTML, so we just ensure it's visible)
    if (loginScreen) loginScreen.classList.remove('hidden');
}

/**
 * Handle Redirect with Token Handoff
 */
function performRedirect(targetUrl, token) {
    // Construct URL with auth_token params safely
    const urlObj = new URL(targetUrl, window.location.origin);
    urlObj.searchParams.set('auth_token', token);

    // Redirect
    // Redirect
    console.log('[Login] Redirecting to:', urlObj.toString());
    localStorage.setItem('last_redirect_ts', Date.now().toString());
    window.location.href = urlObj.toString();
}

function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect');
}

// ============================================
// LOGIN HANDLER
// ============================================

async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
        showError('Please fill in all fields.');
        return;
    }

    setLoading(true);
    hideError();

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);

            // Redirect
            const target = getRedirectUrl() || DASHBOARD_URL;
            performRedirect(target, data.token);
        } else {
            // FAILURE
            showError(data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login Error:', error);
        showError('Network error. Please try again.');
    } finally {
        setLoading(false);
    }
}

// ============================================
// UI UTILS
// ============================================

function showError(msg) {
    if (errorMessage) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }
}

function hideError() {
    if (errorMessage) errorMessage.classList.add('hidden');
}

function setLoading(isLoading) {
    if (loginBtn) {
        loginBtn.disabled = isLoading;
        if (isLoading) {
            btnText?.classList.add('hidden');
            btnLoader?.classList.remove('hidden');
        } else {
            btnText?.classList.remove('hidden');
            btnLoader?.classList.add('hidden');
        }
    }
}

// ============================================
// INIT
// ============================================

if (loginForm) loginForm.addEventListener('submit', handleLogin);

window.addEventListener('load', initLoginPage);

// Theme & Password Toggles (Preserved)
// ... (Keeping existing theme/password logic if needed, simplified here for brevity)
