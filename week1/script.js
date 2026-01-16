const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusContainer = document.getElementById('status-container');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');

// Use n8n webhook directly (no server proxy needed for static hosting)
const WEBHOOK_URL = 'https://n8n.avlokai.com/webhook-test/image';

const BLOCKED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
];


const themeToggle = document.getElementById('theme-toggle');

// Theme Management - sync with auth.js theme
let currentTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

// Update button text based on current theme
if (themeToggle) {
    themeToggle.textContent = currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';

    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);

        // Update button text
        if (currentTheme === 'light') {
            themeToggle.textContent = '🌙 Dark Mode';
        } else {
            themeToggle.textContent = '☀️ Light Mode';
        }
    });
}

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        resetUI();
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        resetUI();
        handleFile(e.target.files[0]);
    }
    // Always clear the input so the same file can be selected again
    fileInput.value = '';
});

function resetUI() {
    statusContainer.classList.add('hidden');
    progressFill.style.width = '0%';
    statusText.textContent = '';
    statusText.className = '';
    // Remove dissolve class to restart animation for next upload
    progressFill.classList.remove('dissolve');
    progressFill.style.opacity = '1';
    progressFill.style.transform = 'scale(1)';
}

function handleFile(file) {
    if (!validateFile(file)) return;
    uploadFile(file);
}

function validateFile(file) {
    const isVideo = file.type.startsWith('video/');
    const isBlockedType = BLOCKED_TYPES.includes(file.type);

    // Fallback check for extensions in case mime type is missing or generic
    const ext = file.name.split('.').pop().toLowerCase();
    const blockedExts = ['pdf', 'docx', 'xlsx'];
    const isBlockedExt = blockedExts.includes(ext);

    if (isVideo || isBlockedType || isBlockedExt) {
        showStatus('File type not allowed.', 'error');
        return false;
    }
    return true;
}

let progressInterval;

function uploadFile(file) {
    showStatus('Uploading...', 'normal');

    // Reset progress
    progressFill.style.width = '0%';
    progressFill.classList.remove('dissolve');
    progressFill.style.opacity = '1';
    progressFill.style.transform = 'scale(1)';
    let currentProgress = 0;

    // Clear any existing interval
    if (progressInterval) clearInterval(progressInterval);

    // Simulate smooth progress up to 90%
    progressInterval = setInterval(() => {
        if (currentProgress < 90) {
            // Random-ish increment for "realism"
            const increment = Math.random() * 10 + 2;
            currentProgress = Math.min(currentProgress + increment, 90);
            progressFill.style.width = `${currentProgress}%`;
        }
    }, 200);

    const formData = new FormData();
    formData.append('file', file);

    fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            clearInterval(progressInterval);
            if (response.ok) {
                progressFill.style.width = '100%';

                // 4. DISPERSE PARTICLES & DISSOLVE
                setTimeout(() => {
                    progressFill.classList.add('dissolve');

                    if (window.disperse) window.disperse();

                    showStatus('Upload complete.', 'success');

                    setTimeout(() => {
                        statusContainer.classList.add('hidden');
                        progressFill.style.width = '0%';
                        progressFill.classList.remove('dissolve');
                        progressFill.style.opacity = '1';
                        progressFill.style.transform = 'scale(1)';
                    }, 2000);
                }, 500);
            } else {
                return response.text().then(text => { throw new Error(text || response.statusText); });
            }
        })
        .catch(error => {
            clearInterval(progressInterval);
            progressFill.style.width = '0%';
            progressFill.classList.remove('dissolve');
            progressFill.style.opacity = '1';
            progressFill.style.transform = 'scale(1)';
            showStatus(`Error: ${error.message}`, 'error');
            if (window.disperse) window.disperse();

            // Hide status container after 3 seconds (longer than success to let user read error)
            setTimeout(() => {
                statusContainer.classList.add('hidden');
                progressFill.style.width = '0%';
            }, 3000);
        });
}

function showStatus(message, type) {
    statusContainer.classList.remove('hidden');
    statusText.textContent = message;
    statusText.className = '';

    if (type === 'error') statusText.classList.add('error');
    if (type === 'success') statusText.classList.add('success');
}
