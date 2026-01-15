// Password Protection for Static Site
// IMPORTANT: Change this hash to your own password hash using SHA-256
// To generate: Open browser console and run:
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword')).then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('')))

const PASSWORD_HASH = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'; // Default: "password123"

const passwordGate = document.getElementById('password-gate');
const mainContainer = document.getElementById('main-container');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');
const passwordError = document.getElementById('password-error');

// Check if already authenticated in this session
const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';

if (isAuthenticated) {
    showMainContent();
}

// Hash function using Web Crypto API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
async function verifyPassword() {
    const enteredPassword = passwordInput.value;

    if (!enteredPassword) {
        showError();
        return;
    }

    const enteredHash = await hashPassword(enteredPassword);

    if (enteredHash === PASSWORD_HASH) {
        sessionStorage.setItem('authenticated', 'true');
        showMainContent();
    } else {
        showError();
        passwordInput.value = '';
    }
}

function showMainContent() {
    passwordGate.classList.add('hidden');
    mainContainer.classList.remove('hidden');
}

function showError() {
    passwordError.classList.remove('hidden');
    passwordInput.classList.add('shake');
    setTimeout(() => {
        passwordInput.classList.remove('shake');
    }, 500);
}

// Event listeners
passwordSubmit.addEventListener('click', verifyPassword);

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyPassword();
    }
});

// Hide error when typing
passwordInput.addEventListener('input', () => {
    passwordError.classList.add('hidden');
});
