import './style.css'
import { SolarSystem } from './SolarSystem.js';
import { GestureController } from './GestureController.js';

console.log('Solar System Gesture App Initialized');

async function init() {
    // 1. Initialize Solar System Visualization
    const solarSystem = new SolarSystem('app');

    // 2. Initialize Gesture Controller with callbacks
    // 2. Initialize Gesture Controller with callbacks
    const gestureController = new GestureController({
        onZoom: (scale) => {
            // console.log('Zoom:', scale); // Too noisy
            solarSystem.setZoom(scale);
        },
        onDrag: (dx, dy) => {
            // console.log('Drag:', dx, dy);
            solarSystem.handleDrag(dx, dy);
        },
        onReset: () => {
            console.log('Action: RESET');
            solarSystem.resumeOrbit();
        },
        onSpeedUp: () => {
            console.log('Action: SPEED UP');
            solarSystem.setTimeScale(5.0);
        },
        onRewind: () => {
            console.log('Action: REWIND');
            solarSystem.setTimeScale(-2.0);
        },
        onToggleHelp: () => {
            console.log('Action: HELP');
            const overlay = document.getElementById('gesture-help-overlay');
            if (overlay) overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
        },
        onLock: () => {
            console.log('Action: LOCK');
            solarSystem.toggleLock();
        },
        onComet: () => {
            console.log('Action: COMET');
            solarSystem.spawnComet();
        },
        onSwipeLeft: () => {
            console.log('Action: SWIPE LEFT');
            solarSystem.selectPreviousPlanet();
        },
        onSwipeRight: () => {
            console.log('Action: SWIPE RIGHT');
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
            gestureController.setError("Camera Access Denied");
            startBtn.textContent = 'Camera Denied ❌';
            startBtn.style.backgroundColor = 'red';
            alert("Camera access denied. Please allow camera access in your browser settings and reload.");
        }
    });
}

init();
