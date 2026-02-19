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
// URL CONFIGURATION
// Production custom domains - EDIT THESE if your domains are different
// ============================================
const CUSTOM_DOMAINS = {
    login: 'login.avlokai.com',
    week2: 'week2.avlokai.com'
};

// ============================================
// DYNAMIC URL DETECTION
// ============================================
function getDashboardUrl() {
    const hostname = window.location.hostname;

    // 1. Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5173';
    }

    // 2. Custom domain (login.avlokai.com) → go to week2.avlokai.com
    if (hostname === CUSTOM_DOMAINS.login) {
        return `https://${CUSTOM_DOMAINS.week2}`;
    }

    // 3. Vercel deployment → still redirect to production custom domain
    //    This ensures consistency: preview login → production week2
    //    If you want preview → preview, you'll need to use relative URLs
    if (hostname.endsWith('.vercel.app')) {
        console.log('[Login] Vercel deployment detected, using production week2 URL');
        return `https://${CUSTOM_DOMAINS.week2}`;
    }

    // 4. Fallback: relative URL (for monorepo deploys)
    return '../week2/';
}

const DASHBOARD_URL = getDashboardUrl();
console.log('[Login] Dashboard URL:', DASHBOARD_URL);

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

// Theme & Password Toggles
if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle icons
        const eyeOpen = passwordToggleBtn.querySelector('.eye-open');
        const eyeClosed = passwordToggleBtn.querySelector('.eye-closed');

        if (type === 'text') {
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
            passwordToggleBtn.setAttribute('aria-label', 'Hide password');
        } else {
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
            passwordToggleBtn.setAttribute('aria-label', 'Show password');
        }
    });
}
