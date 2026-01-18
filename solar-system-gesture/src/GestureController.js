import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export class GestureController {
    constructor(callbacks) {
        // Callback Mappings
        this.callbacks = callbacks || {};

        this.videoElement = document.getElementById('input-video');
        this.canvasElement = document.getElementById('output-canvas');
        this.canvasCtx = this.canvasElement.getContext('2d');

        // Debug Information
        this.debugInfo = document.createElement('div');
        this.debugInfo.className = 'gesture-debug-info';
        this.debugInfo.innerHTML = 'Initializing Hands...';
        document.body.appendChild(this.debugInfo);

        // MediaPipe Setup - PINNED VERSION
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));

        // State
        this.gestureMode = 'NONE';
        this.lastDragPos = null;
        this.lastSwipePos = null;

        // Debounce / Cooldown state
        this.cooldowns = {
            swipe: 0,
            toggle: 0,
            comet: 0
        };
    }

    async start() {
        this.debugInfo.innerHTML = 'Requesting Camera Access...';

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.setError('Camera API Unavailable');
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, frameRate: { ideal: 30 } }
        });

        this.debugInfo.innerHTML = 'Camera Access Granted. Starting Video...';

        this.videoElement.srcObject = stream;
        await new Promise((resolve) => {
            this.videoElement.onloadedmetadata = () => {
                this.videoElement.play();
                resolve();
            };
        });

        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;

        this.debugInfo.innerHTML = 'Video Active. Loading AI Model (v0.4.1646)...';

        this.processVideo();
    }

    async processVideo() {
        if (this.videoElement.paused || this.videoElement.ended) {
            requestAnimationFrame(this.processVideo.bind(this));
            return;
        }

        try {
            await this.hands.send({ image: this.videoElement });
        } catch (error) {
            console.error('MediaPipe Send Error:', error);
            this.debugInfo.innerHTML = `Model Error: ${error.message}`;
            setTimeout(() => requestAnimationFrame(this.processVideo.bind(this)), 1000);
            return;
        }

        requestAnimationFrame(this.processVideo.bind(this));
    }

    setError(msg) {
        this.debugInfo.innerHTML = `<span style="color:red">${msg}</span>`;
    }

    onResults(results) {
        // Decrease cooldowns
        for (let k in this.cooldowns) {
            if (this.cooldowns[k] > 0) this.cooldowns[k]--;
        }

        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);

        const overlay = document.getElementById('instruction-overlay');

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            drawConnectors(this.canvasCtx, landmarks, Hands.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 1 });
            drawLandmarks(this.canvasCtx, landmarks, { color: '#FF0000', lineWidth: 0.5, radius: 2 });

            const gesture = this.detectPose(landmarks);

            // --- VISUAL DEBUG TEXT ---
            this.canvasCtx.font = "bold 24px monospace";
            this.canvasCtx.fillStyle = "yellow";
            this.canvasCtx.strokeStyle = "black";
            this.canvasCtx.lineWidth = 3;
            this.canvasCtx.strokeText(`Gesture: ${gesture}`, 10, 30);
            this.canvasCtx.fillText(`Gesture: ${gesture}`, 10, 30);

            this.handleGesture(gesture, landmarks);

            this.debugInfo.innerHTML = `Camera: ON<br>Mode: ${gesture}<br>Active Detected`;
            if (overlay) overlay.classList.add('active');
        } else {
            this.debugInfo.innerHTML = `Camera: ON<br>No Hand`;
            if (overlay) overlay.classList.remove('active');
            this.lastDragPos = null;
        }
        this.canvasCtx.restore();
    }

    // --- Core Logic: Pose Detection ---
    detectPose(landmarks) {
        // Finger States (Extended vs Folded)
        // 0: Thumb, 1: Index, 2: Middle, 3: Ring, 4: Pinky
        const fingers = [
            !this.isFingerFolded(landmarks, 4),  // Thumb (Unreliable)
            !this.isFingerFolded(landmarks, 8),  // Index
            !this.isFingerFolded(landmarks, 12), // Middle
            !this.isFingerFolded(landmarks, 16), // Ring
            !this.isFingerFolded(landmarks, 20)  // Pinky
        ];

        const [thumb, index, middle, ring, pinky] = fingers;
        // Count non-thumb fingers up
        const fingersUp = [index, middle, ring, pinky].filter(f => f).length;

        const pinchDist = this.getDistance(landmarks[4], landmarks[8]);
        const isTouching = pinchDist < 0.05;

        // --- Priority 1: Open Palm (All 4 fingers Up) ---
        // Relaxed: Ignore thumb
        if (fingersUp === 4) return 'PALM';

        // --- Priority 2: Fist (No fingers Up) ---
        if (fingersUp === 0) {
            const thumbTip = landmarks[4];
            const thumbIP = landmarks[3];

            // Check Thumb for Special Fist Variations
            // Only strictly separated if Thumb is VERY clearly up or down
            if (thumbTip.y < thumbIP.y - 0.05) return 'THUMBS_UP';
            if (thumbTip.y > thumbIP.y + 0.05) return 'THUMBS_DOWN';

            return 'FIST';
        }

        // --- Priority 3: Rock / Metal (Index + Pinky Up) ---
        // Middle + Ring MUST be down. Thumb ignored.
        if (index && !middle && !ring && pinky) return 'ROCK';

        // --- Priority 4: Peace (Index + Middle Up) ---
        // Ring + Pinky MUST be down. Thumb ignored.
        if (index && middle && !ring && !pinky) return 'PEACE';

        // --- Priority 5: OK Sign (Thumb+Index Touching) ---
        // At least one other finger UP to distinguish from Pinch/Fist
        if (isTouching && (middle || ring || pinky)) return 'OK';

        // --- Priority 6: Pinch / Zoom (Index Up, Thumb Up/Close) ---
        // If Index Up and others Down -> Pinch/Point
        if (index && !middle && !ring && !pinky) {
            return 'PINCH';
        }

        return 'UNKNOWN';
    }

    handleGesture(gesture, landmarks) {
        this.updateFeedback(gesture);

        switch (gesture) {
            case 'PALM':
                const palm = landmarks[9];
                if (this.lastSwipePos && this.cooldowns.swipe === 0) {
                    const dx = palm.x - this.lastSwipePos.x;
                    // Optimized Swipe: Lower threshold for easier triggering
                    if (dx > 0.04) {
                        if (this.callbacks.onSwipeRight) this.callbacks.onSwipeRight();
                        this.consoleLog('Swipe Right');
                        this.cooldowns.swipe = 15;
                    } else if (dx < -0.04) {
                        if (this.callbacks.onSwipeLeft) this.callbacks.onSwipeLeft();
                        this.consoleLog('Swipe Left');
                        this.cooldowns.swipe = 15;
                    }
                }

                // Reset logic removed as per user request

                this.lastSwipePos = palm;
                this.lastDragPos = null;
                break;

            case 'FIST':
                this.lastSwipePos = null;
                const currentDragPos = landmarks[9];
                if (this.lastDragPos) {
                    const dx = currentDragPos.x - this.lastDragPos.x;
                    const dy = currentDragPos.y - this.lastDragPos.y;
                    if (this.callbacks.onDrag) this.callbacks.onDrag(dx * 4, dy * 4);
                }
                this.lastDragPos = currentDragPos;
                break;

            case 'THUMBS_UP':
                if (this.callbacks.onSpeedUp) this.callbacks.onSpeedUp();
                break;

            case 'THUMBS_DOWN':
                if (this.callbacks.onRewind) this.callbacks.onRewind();
                break;

            case 'PEACE':
                if (this.cooldowns.toggle === 0) {
                    if (this.callbacks.onToggleHelp) this.callbacks.onToggleHelp();
                    this.cooldowns.toggle = 30;
                }
                break;

            case 'ROCK':
                if (this.cooldowns.toggle === 0) { // Use toggle cooldown for reset? or separate? Using general cooldown.
                    if (this.callbacks.onReset) this.callbacks.onReset();
                    this.consoleLog('Action: Reset');
                    this.cooldowns.toggle = 30; // 1s cooldown
                }
                break;

            case 'OK':
                if (this.cooldowns.toggle === 0) {
                    if (this.callbacks.onLock) this.callbacks.onLock();
                    this.cooldowns.toggle = 30;
                }
                break;

            case 'PINCH':
                const d = this.getDistance(landmarks[4], landmarks[8]);
                const norm = Math.max(0, Math.min(1, (d - 0.02) / (0.25 - 0.02)));
                const scale = 0.5 + (norm * 2.5);
                if (this.callbacks.onZoom) this.callbacks.onZoom(scale);
                break;

            default:
                this.lastDragPos = null;
                this.lastSwipePos = null;
        }
    }

    getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    isFingerFolded(landmarks, tipIdx) {
        const wrist = landmarks[0];
        const tip = landmarks[tipIdx];
        const mcp = landmarks[tipIdx - 2];

        const dTip = this.getDistance(tip, wrist);
        const dMcp = this.getDistance(mcp, wrist);
        return dTip < dMcp;
    }

    updateFeedback(gesture) { }

    consoleLog(msg) {
        // Debounce log
        // console.log(msg);
    }
}
