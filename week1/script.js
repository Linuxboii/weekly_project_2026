const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusContainer = document.getElementById('status-container');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');
const previewAudio = document.getElementById('preview-audio');
const audioPreviewWrapper = document.getElementById('audio-preview-wrapper');
const uploadBtn = document.getElementById('upload-btn');
const clearPreviewBtn = document.getElementById('clear-preview');
const responseContainer = document.getElementById('response-container');
const imageDescription = document.getElementById('image-description');
const copyResponseBtn = document.getElementById('copy-response-btn');
const promptSection = document.getElementById('prompt-section');
const promptToggleCheckbox = document.getElementById('prompt-toggle-checkbox');
const promptInputWrapper = document.getElementById('prompt-input-wrapper');
const promptInput = document.getElementById('prompt-input');

// Store full response text for copy functionality
let currentResponseText = '';

// Use n8n webhook directly (no server proxy needed for static hosting)
const WEBHOOK_URL = 'https://n8n.avlokai.com/webhook/image';

const BLOCKED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
];

// Store the file for upload after preview
let pendingFile = null;

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

// Upload button click handler
if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        if (pendingFile) {
            uploadFile(pendingFile);
        }
    });
}

// Clear preview button handler
if (clearPreviewBtn) {
    clearPreviewBtn.addEventListener('click', () => {
        clearPreview();
    });
}

// Prompt toggle checkbox handler
if (promptToggleCheckbox) {
    promptToggleCheckbox.addEventListener('change', () => {
        if (promptToggleCheckbox.checked) {
            promptInputWrapper.classList.remove('hidden');
            promptInput.focus();
        } else {
            promptInputWrapper.classList.add('hidden');
            promptInput.value = '';
            // Reset height when cleared
            if (promptInput) promptInput.style.height = 'auto';
        }
    });
}

// Auto-resize textarea as user types
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

if (promptInput) {
    promptInput.addEventListener('input', () => {
        autoResizeTextarea(promptInput);
    });
}

function clearPreview() {
    pendingFile = null;

    // Clear image preview
    previewImage.src = '';
    previewImage.classList.add('hidden');

    // Clear audio preview
    if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
    }
    if (audioPreviewWrapper) {
        audioPreviewWrapper.classList.add('hidden');
    }

    // Clear prompt section
    if (promptSection) {
        promptSection.classList.add('hidden');
    }
    if (promptToggleCheckbox) {
        promptToggleCheckbox.checked = false;
    }
    if (promptInputWrapper) {
        promptInputWrapper.classList.add('hidden');
    }
    if (promptInput) {
        promptInput.value = '';
        promptInput.style.height = 'auto';
    }

    previewContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');

    // Clear response/description
    if (responseContainer) {
        responseContainer.classList.add('hidden');
    }
    if (imageDescription) {
        imageDescription.innerHTML = '';
    }
    currentResponseText = '';
}

// Copy button handler
if (copyResponseBtn) {
    copyResponseBtn.addEventListener('click', async () => {
        if (currentResponseText) {
            try {
                await navigator.clipboard.writeText(currentResponseText);
                copyResponseBtn.classList.add('copied');
                setTimeout(() => {
                    copyResponseBtn.classList.remove('copied');
                }, 1500);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    });
}

/**
 * Typewriter effect with shadow reveal - displays text one character at a time
 * Each character fades in from blur/shadow
 * @param {string} text - The text to display
 * @param {number} duration - Total duration in milliseconds (default 2500ms)
 */
function typewriterEffect(text, duration = 2500) {
    if (!imageDescription || !responseContainer) return;

    // Store for copy functionality
    currentResponseText = text;

    imageDescription.innerHTML = '';
    responseContainer.classList.remove('hidden');

    const chars = text.split('');
    const delay = duration / chars.length;

    chars.forEach((char, index) => {
        setTimeout(() => {
            const span = document.createElement('span');
            span.className = 'description-char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            imageDescription.appendChild(span);
        }, index * delay);
    });
}

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

    // Check file type for appropriate preview
    if (file.type.startsWith('image/')) {
        showImagePreview(file);
    } else if (file.type.startsWith('audio/')) {
        showAudioPreview(file);
    } else {
        // For other files, upload directly
        uploadFile(file);
    }
}

function showImagePreview(file) {
    pendingFile = file;

    // Hide audio, show image
    if (audioPreviewWrapper) audioPreviewWrapper.classList.add('hidden');
    previewImage.classList.remove('hidden');

    // Show prompt section for images
    if (promptSection) promptSection.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.classList.remove('hidden');
        dropZone.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function showAudioPreview(file) {
    pendingFile = file;

    // Hide image, show audio
    previewImage.classList.add('hidden');
    if (audioPreviewWrapper) audioPreviewWrapper.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = (e) => {
        if (previewAudio) {
            previewAudio.src = e.target.result;
        }
        previewContainer.classList.remove('hidden');
        dropZone.classList.add('hidden');
    };
    reader.readAsDataURL(file);
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

    // Build headers - include prompt if toggle is ON for images
    const headers = {};
    if (promptToggleCheckbox && promptToggleCheckbox.checked && promptInput && promptInput.value.trim()) {
        // URL-encode to ensure only ASCII chars in header (HTTP header limitation)
        headers['X-Prompt'] = encodeURIComponent(JSON.stringify({ prompt: promptInput.value }));
    }

    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: headers,
        body: formData
    })
        .then(response => {
            clearInterval(progressInterval);
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(text || response.statusText); });
            }
        })
        .then(data => {
            progressFill.style.width = '100%';

            // DISPERSE PARTICLES & DISSOLVE
            setTimeout(() => {
                progressFill.classList.add('dissolve');

                if (window.disperse) window.disperse();

                showStatus('Upload complete.', 'success');

                // Build display text from response
                let displayText = '';

                if (data && data.description) {
                    displayText = data.description;
                }

                if (data && data.Text) {
                    // If we already have description, add a separator
                    if (displayText) {
                        displayText += '\n\n';
                    }
                    displayText += 'Transcribed Text: ' + data.Text;
                }

                // Show with typewriter effect
                if (displayText) {
                    typewriterEffect(displayText, 2500);
                }

                // Hide status bar after brief delay, but keep preview and description visible
                setTimeout(() => {
                    statusContainer.classList.add('hidden');
                    progressFill.style.width = '0%';
                    progressFill.classList.remove('dissolve');
                    progressFill.style.opacity = '1';
                    progressFill.style.transform = 'scale(1)';
                    // Description stays visible until user clears preview
                }, 2000);
            }, 500);
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
