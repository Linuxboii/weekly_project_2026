/**
 * Minimalist Interactive Background - Floating Mesh
 * A subtle, elegant wireframe geometry that responds to cursor movement
 */

(function () {
    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        // Mesh settings
        mesh: {
            baseRadius: 8,
            detail: 2,           // Icosahedron detail level
            wireframeOpacity: 0.15,
            pointOpacity: 0.4,
            pointSize: 0.08,
        },

        // Motion
        motion: {
            rotationSpeed: 0.0003,
            breatheSpeed: 0.0008,
            breatheAmount: 0.15,
            morphSpeed: 0.001,
            morphAmount: 0.3,
        },

        // Cursor interaction
        cursor: {
            smoothing: 0.08,
            rotationInfluence: 0.3,
            morphInfluence: 0.5,
            parallaxStrength: 2,
        },

        // Particles (floating dust)
        particles: {
            count: 60,
            size: 0.04,
            speed: 0.0002,
            spread: 20,
            opacity: 0.3,
        },

        // Theme colors
        dark: {
            wireColor: 0x6366f1,     // Indigo
            pointColor: 0xa5b4fc,    // Light indigo
            particleColor: 0x818cf8,
            glowColor: 0x4f46e5,
        },
        light: {
            wireColor: 0x3730a3,
            pointColor: 0x4338ca,
            particleColor: 0x6366f1,
            glowColor: 0x4f46e5,
        }
    };

    // ============================================
    // STATE
    // ============================================
    const state = {
        scene: null,
        camera: null,
        renderer: null,
        animationId: null,

        mesh: null,
        wireframe: null,
        points: null,
        particles: null,

        cursor: {
            target: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
        },

        basePositions: null,

        theme: 'dark',
        time: 0,
    };

    // ============================================
    // UTILITIES
    // ============================================
    const lerp = (a, b, t) => a + (b - a) * t;

    function getThemeColors() {
        return state.theme === 'dark' ? CONFIG.dark : CONFIG.light;
    }

    function detectTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    // ============================================
    // GEOMETRY CREATION
    // ============================================
    function createMainMesh() {
        const colors = getThemeColors();
        const geometry = new THREE.IcosahedronGeometry(CONFIG.mesh.baseRadius, CONFIG.mesh.detail);

        // Store base positions for morphing
        const positions = geometry.attributes.position.array;
        state.basePositions = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i++) {
            state.basePositions[i] = positions[i];
        }

        // Create wireframe
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: colors.wireColor,
            wireframe: true,
            transparent: true,
            opacity: CONFIG.mesh.wireframeOpacity,
        });
        state.wireframe = new THREE.Mesh(geometry, wireMaterial);
        state.scene.add(state.wireframe);

        // Create vertex points
        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', geometry.attributes.position.clone());

        const pointsMaterial = new THREE.PointsMaterial({
            color: colors.pointColor,
            size: CONFIG.mesh.pointSize,
            transparent: true,
            opacity: CONFIG.mesh.pointOpacity,
            sizeAttenuation: true,
        });
        state.points = new THREE.Points(pointsGeometry, pointsMaterial);
        state.scene.add(state.points);

        // Create inner glow sphere
        const glowGeometry = new THREE.SphereGeometry(CONFIG.mesh.baseRadius * 0.7, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: colors.glowColor,
            transparent: true,
            opacity: 0.03,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        state.scene.add(glow);
    }

    function createParticles() {
        const colors = getThemeColors();
        const count = CONFIG.particles.count;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Random positions in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = CONFIG.particles.spread * (0.3 + Math.random() * 0.7);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi) - 15; // Push back

            // Random velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.01;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: colors.particleColor,
            size: CONFIG.particles.size,
            transparent: true,
            opacity: CONFIG.particles.opacity,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
        });

        state.particles = new THREE.Points(geometry, material);
        state.particles.userData.velocities = velocities;
        state.particles.userData.basePositions = positions.slice();
        state.scene.add(state.particles);
    }

    // ============================================
    // ANIMATION
    // ============================================
    function updateCursor() {
        const c = state.cursor;
        c.current.x = lerp(c.current.x, c.target.x, CONFIG.cursor.smoothing);
        c.current.y = lerp(c.current.y, c.target.y, CONFIG.cursor.smoothing);
    }

    function animateMesh(time) {
        if (!state.wireframe || !state.points) return;

        const cursor = state.cursor.current;

        // Breathing effect
        const breathe = 1 + Math.sin(time * CONFIG.motion.breatheSpeed) * CONFIG.motion.breatheAmount;

        // Morph vertices based on cursor + time
        const positions = state.wireframe.geometry.attributes.position.array;
        const pointPositions = state.points.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            const baseX = state.basePositions[i];
            const baseY = state.basePositions[i + 1];
            const baseZ = state.basePositions[i + 2];

            // Calculate vertex-specific noise offset
            const vertexIndex = i / 3;
            const noiseOffset = Math.sin(time * CONFIG.motion.morphSpeed + vertexIndex * 0.5) * CONFIG.motion.morphAmount;

            // Cursor influence
            const cursorInfluence = (cursor.x * baseX + cursor.y * baseY) * 0.05 * CONFIG.cursor.morphInfluence;

            // Apply transformations
            const scale = breathe + noiseOffset * 0.1 + cursorInfluence;

            positions[i] = baseX * scale;
            positions[i + 1] = baseY * scale;
            positions[i + 2] = baseZ * scale;

            // Sync points
            pointPositions[i] = positions[i];
            pointPositions[i + 1] = positions[i + 1];
            pointPositions[i + 2] = positions[i + 2];
        }

        state.wireframe.geometry.attributes.position.needsUpdate = true;
        state.points.geometry.attributes.position.needsUpdate = true;

        // Rotation influenced by cursor
        const rotX = time * CONFIG.motion.rotationSpeed + cursor.y * CONFIG.cursor.rotationInfluence;
        const rotY = time * CONFIG.motion.rotationSpeed * 0.7 + cursor.x * CONFIG.cursor.rotationInfluence;

        state.wireframe.rotation.x = rotX;
        state.wireframe.rotation.y = rotY;
        state.points.rotation.x = rotX;
        state.points.rotation.y = rotY;
    }

    function animateParticles(time) {
        if (!state.particles) return;

        const positions = state.particles.geometry.attributes.position.array;
        const velocities = state.particles.userData.velocities;
        const basePositions = state.particles.userData.basePositions;
        const cursor = state.cursor.current;

        for (let i = 0; i < positions.length; i += 3) {
            // Gentle floating motion
            const phase = i * 0.1;
            positions[i] = basePositions[i] + Math.sin(time * CONFIG.particles.speed + phase) * 2;
            positions[i + 1] = basePositions[i + 1] + Math.cos(time * CONFIG.particles.speed * 0.7 + phase) * 2;

            // Parallax from cursor
            positions[i] += cursor.x * CONFIG.cursor.parallaxStrength * 0.5;
            positions[i + 1] += cursor.y * CONFIG.cursor.parallaxStrength * 0.5;
        }

        state.particles.geometry.attributes.position.needsUpdate = true;
    }

    function animate(currentTime) {
        state.animationId = requestAnimationFrame(animate);

        state.time = currentTime;

        updateCursor();
        animateMesh(currentTime);
        animateParticles(currentTime);

        // Subtle camera parallax
        state.camera.position.x = state.cursor.current.x * CONFIG.cursor.parallaxStrength;
        state.camera.position.y = state.cursor.current.y * CONFIG.cursor.parallaxStrength;
        state.camera.lookAt(0, 0, 0);

        state.renderer.render(state.scene, state.camera);
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function initScene() {
        state.theme = detectTheme();

        // Scene
        state.scene = new THREE.Scene();

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        state.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        state.camera.position.z = 25;

        // Canvas
        let canvas = document.getElementById('bg3d-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'bg3d-canvas';
            canvas.className = 'bg3d-canvas';
            document.body.insertBefore(canvas, document.body.firstChild);
        }

        // Renderer
        state.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        state.renderer.setSize(window.innerWidth, window.innerHeight);
        state.renderer.setClearColor(0x000000, 0);

        // Create elements
        createMainMesh();
        createParticles();

        // Start animation
        animate(0);
    }

    function initEvents() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            state.cursor.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
            state.cursor.target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Touch support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                state.cursor.target.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
                state.cursor.target.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
            }
        });

        // Resize
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            state.camera.aspect = width / height;
            state.camera.updateProjectionMatrix();
            state.renderer.setSize(width, height);
        });

        // Theme change listener
        window.addEventListener('themeChanged', (e) => {
            state.theme = e.detail?.theme || detectTheme();
            updateThemeColors();
        });

        // Also listen for storage changes (theme toggle)
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                state.theme = e.newValue || 'dark';
                updateThemeColors();
            }
        });
    }

    function updateThemeColors() {
        const colors = getThemeColors();

        if (state.wireframe) {
            state.wireframe.material.color.setHex(colors.wireColor);
        }
        if (state.points) {
            state.points.material.color.setHex(colors.pointColor);
        }
        if (state.particles) {
            state.particles.material.color.setHex(colors.particleColor);
        }
    }

    // ============================================
    // CLEANUP
    // ============================================
    function cleanup() {
        if (state.animationId) {
            cancelAnimationFrame(state.animationId);
        }
        if (state.renderer) {
            state.renderer.dispose();
        }
    }

    // ============================================
    // START
    // ============================================
    function init() {
        // Wait for Three.js to load
        if (typeof THREE === 'undefined') {
            setTimeout(init, 50);
            return;
        }

        initScene();
        initEvents();

        // Cleanup on page unload
        window.addEventListener('beforeunload', cleanup);
    }

    // Auto-start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
