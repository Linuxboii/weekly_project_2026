import './style.css'
import { SolarSystem } from './SolarSystem.js';
import { GestureController } from './GestureController.js';

// Suppress MediaPipe WASM internal logs (not errors, just noisy info logs)
const originalLog = console.log;
const originalWarn = console.warn;
const mediapipeLogFilter = (msg) => {
    if (typeof msg === 'string') {
        return msg.includes('I0000') || msg.includes('W0000') ||
            msg.includes('gl_context') || msg.includes('Successfully created a WebGL');
    }
    return false;
};
console.log = (...args) => { if (!mediapipeLogFilter(args[0])) originalLog.apply(console, args); };
console.warn = (...args) => { if (!mediapipeLogFilter(args[0])) originalWarn.apply(console, args); };

console.log('Solar System Gesture App Initialized');

async function init() {
    // 1. Initialize Solar System Visualization
    const solarSystem = new SolarSystem('app');

    // 2. Initialize Gesture Controller with callbacks
    // 2. Initialize Gesture Controller with callbacks
    const gestureController = new GestureController({
        onZoom: (scale) => {
            solarSystem.setZoom(scale);
        },
        onDrag: (dx, dy) => {
            solarSystem.handleDrag(dx, dy);
        },
        onReset: () => {
            solarSystem.resumeOrbit();
        },
        onSpeedUp: () => {
            solarSystem.setTimeScale(5.0);
        },
        onRewind: () => {
            solarSystem.setTimeScale(-2.0);
        },
        onShowHelp: () => {
            const overlay = document.getElementById('gesture-help-overlay');
            if (overlay) overlay.style.display = 'block';
        },
        onHideHelp: () => {
            const overlay = document.getElementById('gesture-help-overlay');
            if (overlay) overlay.style.display = 'none';
        },
        onLock: () => {
            solarSystem.toggleLock();
        },
        onComet: () => {
            solarSystem.spawnComet();
        },
        onSwipeLeft: () => {
            solarSystem.selectPreviousPlanet();
        },
        onSwipeRight: () => {
            solarSystem.selectNextPlanet();
        }
    });

    // 3. Wait for User Interaction to Start Camera (Fixes Autoplay/Permission issues)
    const startBtn = document.getElementById('start-btn');
    const startScreen = document.getElementById('start-screen');

    startBtn.addEventListener('click', async () => {
        // UI Feedback
        startBtn.textContent = 'Starting...';
        startBtn.style.opacity = '0.7';

        // Initialize Audio Contexts (if any) here...

        // Start Gestures
        try {
            await gestureController.start();
            console.log("Gesture Controller Started");

            // Success - Hide Screen
            startScreen.classList.add('hidden');
            setTimeout(() => {
                startScreen.style.display = 'none';
            }, 500);

        } catch (err) {
            console.error("Failed to start gesture controller:", err);

            // Analyze specific error
            let userMessage = "Unable to access camera.";
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                userMessage = "Camera permission denied. Please click the lock icon 🔒 in your address bar to allow access.";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                userMessage = "No camera found. Please connect a webcam.";
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                userMessage = "Camera is in use by another application. Please close other apps using the camera.";
            } else {
                userMessage = `Error: ${err.message || 'Unknown error'}`;
            }

            // Update UI
            const errorEl = document.getElementById('start-error');
            if (errorEl) {
                errorEl.textContent = userMessage;
                errorEl.style.display = 'block';
            }

            gestureController.setError("Camera Error");
            startBtn.textContent = 'Retry Start';
            startBtn.style.backgroundColor = '#ef4444'; // Red
            startBtn.style.opacity = '1';
        }
    });
}

init();
