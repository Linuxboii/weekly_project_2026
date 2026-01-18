/**
 * Premium Solar System Background - v2.2 (Cursor Orbit + Enhanced Stars)
 * Planets orbit the cursor when idle, with enhanced starry background
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // === GLOBAL VIEW ===
    viewSize: 19, // Slightly zoomed in for "bigger" feel
    zoomSpeed: 0.1,
    minViewSize: 10,
    maxViewSize: 30,

    // === STARS ===
    stars: {
        count: 150, // Less stars for minimalism
        twinkleSpeed: 0.003,
        twinkleAmount: 0.3,
        parallaxStrength: 0.5,
    },

    // === ORBITAL MOTION ===
    motion: {
        baseOrbitSpeed: 0.15, // Slower, smoother
        microRotationSpeed: 0.002,
        verticalOscillation: 0.0, // Flat 2D look (no wobble)
        oscillationSpeed: 0,
        starPulsePeriod: 12000,
        starPulseAmplitude: 0.02, // Subtle
    },

    // === CURSOR INTERACTION ===
    cursor: {
        smoothingFactor: 0.08, // Very smooth
        cameraInfluence: 0.1, // Subtle parallax
        lightInfluence: 0.8,
        collisionRadius: 0, // No collision
        collisionForce: 0,
    },

    // === PHYSICS ===
    physics: {
        dampening: 0.95,
        restoreForce: 0.05,
        maxDisplacement: 0.5,
    },

    // === CURSOR ORBIT MODE ===
    cursorOrbit: {
        idleThreshold: 99999999, // effectively disabled (always concentric)
        idleMovementThreshold: 0,
        orbitPlanetCount: 0,
        orbitRadiusMultiplier: 1,
        orbitSpeedMultiplier: 1,
        transitionDuration: 0,
        flailDuration: 0,
        flailImpulse: 0,
    },

    // === THEME ===
    theme: {
        transitionDuration: 800,
        current: 'dark',
    },

    // === DARK MODE ===
    dark: {
        starCore: 0xffddaa, // Warmer, softer sun
        starGlow: 0xffcc88,
        starGlowIntensity: 0.2,
        orbitRing: 0xffffff,
        orbitOpacity: 0.08, // Very faint
        ambientLight: 0.4, // Higher ambient for flat look
        pointLight: 0.6,
        planetEmissive: 0, // No self-glow
        starFieldColor: 0xddeeff,
        starFieldOpacity: 0.7,
    },

    // === LIGHT MODE ===
    light: {
        starCore: 0xffaa44,
        starGlow: 0xff8822,
        starGlowIntensity: 0.1,
        orbitRing: 0x000000,
        orbitOpacity: 0.05,
        ambientLight: 0.8,
        pointLight: 0.2,
        planetEmissive: 0,
        starFieldColor: 0x8899bb,
        starFieldOpacity: 0.5,
    },

    enabled: true,
};

// Planet definitions - Minimalist Flat Colors (Manual RGB approximation via HSL)
// Hues: 0=Red, 0.1=Orange, 0.15=Yellow, 0.3=Green, 0.6=Blue, 0.8=Purple
const PLANET_DEFS = [
    { name: 'mercury', displayName: 'Mercury', description: 'Swift messenger planet', orbit: 3.2, size: 0.30, speed: 3.5, hue: 0.08, sat: 0.15, lum: 0.60, moons: [] },
    { name: 'venus', displayName: 'Venus', description: 'Morning star', orbit: 4.5, size: 0.38, speed: 1.2, hue: 0.12, sat: 0.8, lum: 0.6, moons: [] },
    {
        name: 'earth', displayName: 'Earth', description: 'Blue marble', orbit: 6.0, size: 0.40, speed: 0.8, hue: 0.58, sat: 0.6, lum: 0.5, moons: [
            { name: 'moon', displayName: 'The Moon', description: 'Earth\'s satellite', size: 0.11, orbit: 0.5, speed: 1.5, hue: 0.0, sat: 0.0, lum: 0.8 }
        ]
    },
    {
        name: 'mars', displayName: 'Mars', description: 'Red planet', orbit: 7.5, size: 0.34, speed: 0.6, hue: 0.02, sat: 0.7, lum: 0.55, moons: [
            { name: 'phobos', displayName: 'Phobos', description: 'Mars Moon I', size: 0.07, orbit: 0.4, speed: 2.0, hue: 0.05, sat: 0.2, lum: 0.6 },
            { name: 'deimos', displayName: 'Deimos', description: 'Mars Moon II', size: 0.06, orbit: 0.6, speed: 1.2, hue: 0.05, sat: 0.2, lum: 0.6 }
        ]
    },
    {
        name: 'jupiter', displayName: 'Jupiter', description: 'Gas giant', orbit: 10.0, size: 0.90, speed: 0.15, hue: 0.08, sat: 0.6, lum: 0.45, moons: [
            { name: 'io', displayName: 'Io', description: 'Volcanic moon', size: 0.12, orbit: 0.95, speed: 2.5, hue: 0.15, sat: 0.8, lum: 0.7 },
            { name: 'europa', displayName: 'Europa', description: 'Icy moon', size: 0.11, orbit: 1.3, speed: 1.8, hue: 0.55, sat: 0.2, lum: 0.9 }
        ]
    },
    {
        name: 'saturn', displayName: 'Saturn', description: 'Ringed world', orbit: 12.5, size: 0.80, speed: 0.1, hue: 0.14, sat: 0.5, lum: 0.7, moons: [
            { name: 'titan', displayName: 'Titan', description: 'Largest moon', size: 0.15, orbit: 1.2, orbitY: 0.1, speed: 1.0, hue: 0.10, sat: 0.4, lum: 0.5 },
            { name: 'enceladus', displayName: 'Enceladus', description: 'Icy geysers', size: 0.08, orbit: 0.9, speed: 2.2, hue: 0.5, sat: 0.1, lum: 0.9 }
        ]
    },
    {
        name: 'uranus', displayName: 'Uranus', description: 'Ice giant', orbit: 14.5, size: 0.60, speed: 0.05, hue: 0.48, sat: 0.5, lum: 0.6, moons: [
            { name: 'titania', displayName: 'Titania', description: 'Uranus Moon I', size: 0.09, orbit: 0.7, speed: 1.5, hue: 0.6, sat: 0.1, lum: 0.7 },
            { name: 'oberon', displayName: 'Oberon', description: 'Uranus Moon II', size: 0.08, orbit: 0.9, speed: 1.2, hue: 0.6, sat: 0.1, lum: 0.6 }
        ]
    },
    {
        name: 'neptune', displayName: 'Neptune', description: 'Deep blue', orbit: 16.5, size: 0.55, speed: 0.03, hue: 0.62, sat: 0.6, lum: 0.4, moons: [
            { name: 'triton', displayName: 'Triton', description: 'Retrograde moon', size: 0.11, orbit: 0.7, speed: -1.0, hue: 0.5, sat: 0.2, lum: 0.8 },
            { name: 'proteus', displayName: 'Proteus', description: 'Neptune Moon II', size: 0.07, orbit: 0.9, speed: 1.5, hue: 0.5, sat: 0.1, lum: 0.5 }
        ]
    },
];

// ============================================
// STATE
// ============================================
const state = {
    scene: null,
    camera: null,
    renderer: null,
    animationId: null,

    sun: null,
    planets: [],
    orbitRings: [],
    starField: null,

    ambientLight: null,
    pointLight: null,

    cursor: {
        raw: { x: 0, y: 0 },
        smoothed: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        world: { x: 0, y: 0 },
        lastMoveTime: 0,
        isIdle: false,
        idleStartTime: 0,
    },

    orbitMode: {
        active: false,
        transitioning: false,
        transitionStart: 0,
        transitionProgress: 0,
        affectedPlanets: [],
        disrupted: false,
        cursorOrbitCenter: { x: 0, y: 0 },
    },

    // Hover-to-freeze state
    hoveredPlanet: null, // Object reference
    isSystemFrozen: false,
    tooltipEl: null,

    // Click-to-lock popup state
    isPopupLocked: false,
    lockedObject: null, // Object reference

    // Sun interaction state
    isSunHovered: false,
    isProjectsModalOpen: false,

    theme: {
        current: 'dark',
        target: 'dark',
        progress: 1,
        transitioning: false,
        transitionStart: 0,
    },

    isReducedMotion: false,
    isMobile: false,
    isInitialized: false,
    lastTime: 0,
};

// ============================================
// UTILITIES
// ============================================
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function hslToHex(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 1 / 6) { r = c; g = x; b = 0; }
    else if (h < 2 / 6) { r = x; g = c; b = 0; }
    else if (h < 3 / 6) { r = 0; g = c; b = x; }
    else if (h < 4 / 6) { r = 0; g = x; b = c; }
    else if (h < 5 / 6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return ((Math.round((r + m) * 255) << 16) |
        (Math.round((g + m) * 255) << 8) |
        Math.round((b + m) * 255));
}

function lerpColor(c1, c2, t) {
    const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
    const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
    return (Math.round(lerp(r1, r2, t)) << 16) |
        (Math.round(lerp(g1, g2, t)) << 8) |
        Math.round(lerp(b1, b2, t));
}

function getTheme(key) {
    return state.theme.current === 'dark' ? CONFIG.dark[key] : CONFIG.light[key];
}

// ============================================
// ENHANCED STAR FIELD (Interactive Galaxy)
// ============================================
function createStarField() {
    const count = 1200; // Dense spiral galaxy
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 2); // x, y velocity
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const brightnesses = new Float32Array(count);

    // Galaxy parameters
    const branches = 3;
    const maxRadius = CONFIG.viewSize * 2.5;
    const spin = 0.2; // Radians per unit radius
    const randomness = 0.8;
    const randomnessPower = 3;

    for (let i = 0; i < count; i++) {
        // Spiral formation
        const radius = Math.random() * maxRadius;
        const branchAngle = (i % branches) / branches * Math.PI * 2;
        const spinAngle = radius * spin;

        // Random scatter (more scatter further out)
        const mixedColor = Math.random();
        const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;
        const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;

        const angle = branchAngle + spinAngle;

        const x = Math.cos(angle) * radius + randomX;
        const y = Math.sin(angle) * radius + randomY;
        const z = -10 - Math.random() * 20; // Background layer

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        basePositions[i * 3] = x;
        basePositions[i * 3 + 1] = y;
        basePositions[i * 3 + 2] = z;

        // Init velocities
        velocities[i * 2] = 0;
        velocities[i * 2 + 1] = 0;

        // Varied star sizes - larger for more brightness
        sizes[i] = 0.08 + Math.random() * 0.14;

        // Core is brighter
        const distFromCenter = Math.sqrt(x * x + y * y);
        const coreBoost = Math.max(0, 1 - distFromCenter / 10);

        // Random phase for twinkling
        phases[i] = Math.random() * Math.PI * 2;

        // Base brightness
        brightnesses[i] = 0.3 + Math.random() * 0.7 + coreBoost * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        color: getTheme('starFieldColor'),
        size: 0.15, // Larger base size for brighter stars
        transparent: true,
        opacity: getTheme('starFieldOpacity'),
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    // Store data for animation
    points.userData = { basePositions, velocities, phases, brightnesses };
    return points;
}

function animateStarField(time) {
    if (!state.starField || state.isReducedMotion) return;

    const positions = state.starField.geometry.attributes.position.array;
    const base = state.starField.userData.basePositions;
    const vels = state.starField.userData.velocities;
    const phases = state.starField.userData.phases;
    const brightnesses = state.starField.userData.brightnesses;

    // Get cursor world info
    const aspect = window.innerWidth / window.innerHeight;
    const cursorX = state.cursor.smoothed.x * CONFIG.viewSize * aspect;
    const cursorY = state.cursor.smoothed.y * CONFIG.viewSize;
    const cursorVelX = (state.cursor.smoothed.x - state.cursor.world.x) * -0.5; // Approximate velocity from smoothing lag
    const cursorVelY = (state.cursor.smoothed.y - state.cursor.world.y) * -0.5;

    // Convert normalized velocity to useful force
    const forceX = state.cursor.velocity.x * 0.2; // Assuming velocity is tracked in state
    const forceY = state.cursor.velocity.y * 0.2;

    for (let i = 0; i < positions.length / 3; i++) {
        const px = positions[i * 3];
        const py = positions[i * 3 + 1];

        // --- 1. Physics: Drag/Wake Effect ---
        const dx = px - cursorX;
        const dy = py - cursorY;
        const distSq = dx * dx + dy * dy;
        const influenceRadius = 5.0; // Radius of influence

        if (distSq < influenceRadius * influenceRadius) {
            const dist = Math.sqrt(distSq);
            const factor = (1 - dist / influenceRadius); // 0..1

            // Apply drag force (using cursor velocity)
            if (state.cursor.lastMoveTime > performance.now() - 100) {
                // Calculate approximate cursor velocity from smoothing difference or raw tracking
                // Here using a simple push in direction of cursor movement
                vels[i * 2] += state.cursor.velocity.x * factor * 0.08;
                vels[i * 2 + 1] += state.cursor.velocity.y * factor * 0.08;
            }
        }

        // Spring back to base position
        const baseX = base[i * 3];
        const baseY = base[i * 3 + 1];

        // Apply Parallax to Base (so they still move with camera)
        const depth = Math.abs(base[i * 3 + 2]) / 30;
        const targetX = baseX + state.cursor.smoothed.x * depth * 2.0;
        const targetY = baseY + state.cursor.smoothed.y * depth * 2.0;

        const springK = 0.03;
        vels[i * 2] += (targetX - px) * springK;
        vels[i * 2 + 1] += (targetY - py) * springK;

        // Damping
        vels[i * 2] *= 0.92;
        vels[i * 2 + 1] *= 0.92;

        // Update position
        positions[i * 3] += vels[i * 2];
        positions[i * 3 + 1] += vels[i * 2 + 1];

        // --- 2. Twinkle ---
        const twinkle = 1 + Math.sin(time * CONFIG.stars.twinkleSpeed + phases[i]) * CONFIG.stars.twinkleAmount;
        // No per-star opacity attribute in standard PointsMaterial without custom shader.
        // We can simulate size/presence or just subtle float
        // But previously we didn't actually update opacity! 
        // PointsMaterial has global opacity. 
        // To twinkle, we can jitter Z slightly or just rely on the float?
        // Let's optimize: Twinkling via size is hard without shader.
        // We'll stick to movement as "twinkle" (subtle jitter)

        positions[i * 3 + 1] += Math.sin(time * 0.005 + phases[i]) * 0.01; // Vertical float
    }

    state.starField.geometry.attributes.position.needsUpdate = true;
}


// ============================================
// OBJECT CREATION
// ============================================
function createSun() {
    const group = new THREE.Group();

    // Main sun sphere - using MeshStandardMaterial for 3D look
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 64, 64),
        new THREE.MeshStandardMaterial({
            color: getTheme('starCore'),
            emissive: getTheme('starCore'),
            emissiveIntensity: 0.5,
            metalness: 0.1,
            roughness: 0.4,
            transparent: true,
            opacity: 1.0
        })
    );
    core.name = 'core';
    group.add(core);

    // Inner glow ring for depth
    const innerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 48, 48),
        new THREE.MeshBasicMaterial({
            color: getTheme('starGlow'),
            transparent: true,
            opacity: getTheme('starGlowIntensity') * 0.8,
            side: THREE.BackSide
        })
    );
    innerGlow.name = 'innerGlow';
    group.add(innerGlow);

    // Middle glow layer
    const midGlow = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 32, 32),
        new THREE.MeshBasicMaterial({
            color: getTheme('starGlow'),
            transparent: true,
            opacity: getTheme('starGlowIntensity') * 0.4,
            side: THREE.BackSide
        })
    );
    midGlow.name = 'midGlow';
    group.add(midGlow);

    // Outer glow for soft edge
    const outerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 24, 24),
        new THREE.MeshBasicMaterial({
            color: getTheme('starGlow'),
            transparent: true,
            opacity: getTheme('starGlowIntensity') * 0.15,
            side: THREE.BackSide
        })
    );
    outerGlow.name = 'outerGlow';
    group.add(outerGlow);

    return group;
}

function createOrbitRing(radius, index, total) {
    const segments = 256; // High res
    const positions = new Float32Array(segments * 3);

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Very faint, uniform opacity
    const baseOpacity = CONFIG.theme.current === 'dark' ? 0.08 : 0.05;

    const material = new THREE.LineBasicMaterial({
        color: getTheme('orbitRing'),
        transparent: true,
        opacity: baseOpacity,
    });

    const ring = new THREE.LineLoop(geometry, material);
    ring.userData.baseOpacity = baseOpacity; // Store base opacity for theme transitions
    return ring;
}

function createPlanet(def, index) {
    const isDark = state.theme.current === 'dark';
    const color = hslToHex(def.hue, def.sat, def.lum);

    // Matte, flat look
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(def.size, 64, 64),
        new THREE.MeshStandardMaterial({
            color,
            metalness: 0,
            roughness: 1, // Full matte
            emissive: 0x000000,
            transparent: false,
        })
    );

    // NO GLOWS for minimalist look

    // Planet state
    const startAngle = Math.random() * Math.PI * 2;
    planet.userData = {
        def,
        index,
        color,
        // Sun orbit
        sunOrbitAngle: startAngle,
        orbitRadius: def.orbit,
        orbitSpeed: def.speed * CONFIG.motion.baseOrbitSpeed,
        phaseOffset: Math.random() * Math.PI * 2,
        // Cursor orbit (disabled but kept structure)
        cursorOrbitAngle: Math.random() * Math.PI * 2,
        cursorOrbitRadius: 0,
        targetCursorOrbitRadius: def.orbit,
        // Displacement
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
    };

    planet.position.x = Math.cos(startAngle) * def.orbit;
    planet.position.y = Math.sin(startAngle) * def.orbit;

    // Saturn's ring - flat disk
    if (def.name === 'saturn') {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(def.size * 1.5, def.size * 2.5, 64),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI * 0.35;
        ring.name = 'saturnRing';
        planet.add(ring);
    }

    // Moons
    planet.userData.moonPivots = [];
    if (def.moons && def.moons.length > 0) {
        def.moons.forEach(moonDef => {
            const moonPivot = new THREE.Group();
            moonPivot.userData = { speed: moonDef.speed };

            const moonColor = hslToHex(moonDef.hue, moonDef.sat, moonDef.lum);
            const moon = new THREE.Mesh(
                new THREE.SphereGeometry(moonDef.size, 16, 16),
                new THREE.MeshStandardMaterial({
                    color: moonColor,
                    metalness: 0,
                    roughness: 1,
                    emissive: 0x000000
                })
            );
            moon.position.x = moonDef.orbit;
            moon.userData = { def: moonDef, isMoon: true, parentPlanet: planet };

            moonPivot.add(moon);
            planet.add(moonPivot);
            planet.userData.moonPivots.push(moonPivot);

            // Add simple orbit ring for moon
            const ringGeo = new THREE.BufferGeometry().setFromPoints(
                new THREE.Path().absarc(0, 0, moonDef.orbit, 0, Math.PI * 2).getPoints(32)
            );
            const ring = new THREE.LineLoop(
                ringGeo,
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 })
            );
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        });
    }

    return planet;
}

// ============================================
// SCENE SETUP
// ============================================
function initScene() {
    state.theme.current = detectTheme();
    state.theme.target = state.theme.current;
    CONFIG.theme.current = state.theme.current;

    state.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = CONFIG.viewSize;
    state.camera = new THREE.OrthographicCamera(
        -viewSize * aspect, viewSize * aspect,
        viewSize, -viewSize, 0.1, 100
    );
    state.camera.position.z = 30;

    let canvas = document.getElementById('bg3d-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'bg3d-canvas';
        canvas.className = 'bg3d-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    state.renderer.setSize(window.innerWidth, window.innerHeight);

    // Twinkling star field background
    state.starField = createStarField();
    state.scene.add(state.starField);

    // Sun
    state.sun = createSun();
    state.scene.add(state.sun);

    // Planets and orbit rings
    PLANET_DEFS.forEach((def, i) => {
        const planet = createPlanet(def, i);
        state.planets.push(planet);
        state.scene.add(planet);

        // Orbit rings - Minimalist Faint Lines
        const ring = createOrbitRing(def.orbit, i, PLANET_DEFS.length);
        state.orbitRings.push(ring);
        state.scene.add(ring);
    });

    // Lighting
    state.ambientLight = new THREE.AmbientLight(0xffffff, getTheme('ambientLight'));
    state.scene.add(state.ambientLight);

    state.pointLight = new THREE.PointLight(0xfff5e6, getTheme('pointLight'), 40);
    state.pointLight.position.set(0, 0, 5);
    state.scene.add(state.pointLight);

    // Create tooltip element for planet hover popups
    createTooltip();
}

function createTooltip() {
    if (document.getElementById('planet-tooltip')) return;

    const tooltip = document.createElement('div');
    tooltip.id = 'planet-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        background: rgba(15, 15, 25, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 18px 22px;
        min-width: 200px;
        max-width: 280px;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        font-family: 'Inter', -apple-system, sans-serif;
        color: #fff;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    `;
    tooltip.innerHTML = `
        <div class="tooltip-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="tooltip-title" style="font-size: 16px; font-weight: 600;"></div>
            <button class="tooltip-close" style="
                display: none;
                background: rgba(255,255,255,0.1);
                border: none;
                color: #fff;
                width: 24px;
                height: 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                line-height: 1;
            ">×</button>
        </div>
        <div class="tooltip-desc" style="font-size: 13px; opacity: 0.7; margin-bottom: 16px; line-height: 1.5;"></div>
        <div class="tooltip-hint" style="font-size: 11px; opacity: 0.4; margin-bottom: 12px;">Click to explore</div>
        <div class="tooltip-actions" style="display: none; flex-direction: column; gap: 8px;"></div>
    `;

    // Close button handler
    tooltip.querySelector('.tooltip-close').addEventListener('click', (e) => {
        e.stopPropagation();
        unlockPopup();
    });

    document.body.appendChild(tooltip);
    state.tooltipEl = tooltip;
}

function unlockPopup() {
    state.isPopupLocked = false;
    state.lockedObject = null;
    const tooltip = state.tooltipEl;
    if (tooltip) {
        tooltip.style.pointerEvents = 'none';
        tooltip.querySelector('.tooltip-close').style.display = 'none';
        tooltip.querySelector('.tooltip-actions').style.display = 'none';
        tooltip.querySelector('.tooltip-hint').style.display = 'block';
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(8px)';
    }
}

// ============================================
// SUN INTERACTION & PROJECTS MODAL
// ============================================
function createProjectsModal() {
    if (document.getElementById('sun-projects-modal')) return;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'sun-modal-backdrop';
    document.body.appendChild(backdrop);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'sun-projects-modal';
    modal.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">Your Projects</h2>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-projects"></div>
    `;
    document.body.appendChild(modal);

    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', closeProjectsModal);
    backdrop.addEventListener('click', closeProjectsModal);
}

function openProjectsModal() {
    const modal = document.getElementById('sun-projects-modal');
    const backdrop = document.getElementById('sun-modal-backdrop');

    if (!modal || !backdrop) {
        createProjectsModal();
        setTimeout(openProjectsModal, 10);
        return;
    }

    // Populate with projects (using window.projectsList if available from app.js)
    const projectsContainer = modal.querySelector('.modal-projects');
    const projects = window.projectsList || [
        { id: 'week1', name: 'Week 1', description: 'File uploader with interactive particle background', icon: '📁', url: 'https://week1.avlokai.com/' }
    ];

    // Helper to add token to URL
    const getUrlWithToken = (url) => {
        const token = localStorage.getItem('auth_token'); // Matches key in login/auth.js
        if (!token) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}auth_token=${encodeURIComponent(token)}`;
    };

    projectsContainer.innerHTML = projects.map(p => `
        <a class="modal-project-card" href="${getUrlWithToken(p.url || '#')}" data-project-id="${p.id}">
            <div class="modal-project-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
            <div class="modal-project-info">
                <div class="modal-project-name">${p.name}</div>
                <div class-="modal-project-desc">${p.description}</div>
            </div>
        </a>
    `).join('');

    state.isProjectsModalOpen = true;
    modal.classList.add('active');
    backdrop.classList.add('active');

    // Enable sun-mode on dashboard
    document.querySelector('.dashboard')?.classList.add('sun-mode');
}

function closeProjectsModal() {
    const modal = document.getElementById('sun-projects-modal');
    const backdrop = document.getElementById('sun-modal-backdrop');

    state.isProjectsModalOpen = false;
    modal?.classList.remove('active');
    backdrop?.classList.remove('active');
}

function checkSunHover() {
    const cursor = state.cursor;
    const sunRadius = 3.0;
    const distToSun = Math.sqrt(cursor.world.x * cursor.world.x + cursor.world.y * cursor.world.y);

    const wasHovered = state.isSunHovered;
    state.isSunHovered = distToSun < sunRadius;

    // Show/hide sun tooltip
    if (state.isSunHovered && !wasHovered && state.tooltipEl && !state.isPopupLocked) {
        showSunTooltip();
    } else if (!state.isSunHovered && wasHovered && !state.isPopupLocked && state.hoveredPlanet === null) {
        hideSunTooltip();
    }
}

function showSunTooltip() {
    const tooltip = state.tooltipEl;
    if (!tooltip) return;

    tooltip.querySelector('.tooltip-title').textContent = '☀️ Your Projects';
    tooltip.querySelector('.tooltip-desc').textContent = 'Click to view and manage your projects';
    tooltip.querySelector('.tooltip-hint').textContent = 'Click to open';
    tooltip.querySelector('.tooltip-hint').style.display = 'block';
    tooltip.querySelector('.tooltip-close').style.display = 'none';
    tooltip.querySelector('.tooltip-actions').style.display = 'none';

    // Position near center
    const screenPos = worldToScreen(0, 0);
    tooltip.style.left = `${screenPos.x + 50}px`;
    tooltip.style.top = `${screenPos.y - 30}px`;
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
    tooltip.style.pointerEvents = 'none';
}

function hideSunTooltip() {
    const tooltip = state.tooltipEl;
    if (!tooltip) return;
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(8px)';
}

// ============================================
// THEME
// ============================================
function detectTheme() {
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    if (htmlTheme) return htmlTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme, animated = true) {
    if (theme !== 'dark' && theme !== 'light') return;
    state.theme.target = theme;

    if (animated) {
        state.theme.transitioning = true;
        state.theme.transitionStart = performance.now();
        state.theme.progress = 0;
    } else {
        state.theme.current = theme;
        state.theme.transitioning = false;
        applyTheme(1);
    }
    CONFIG.theme.current = theme;
}

function applyTheme(t) {
    const isDark = state.theme.target === 'dark';
    const from = isDark ? CONFIG.light : CONFIG.dark;
    const to = isDark ? CONFIG.dark : CONFIG.light;

    if (state.sun) {
        const core = state.sun.getObjectByName('core');
        if (core) core.material.color.setHex(lerpColor(from.starCore, to.starCore, t));

        const innerGlow = state.sun.getObjectByName('innerGlow');
        if (innerGlow) {
            innerGlow.material.color.setHex(lerpColor(from.starGlow, to.starGlow, t));
            innerGlow.material.opacity = lerp(from.starGlowIntensity, to.starGlowIntensity, t) * 0.7;
        }

        const outerGlow = state.sun.getObjectByName('outerGlow');
        if (outerGlow) {
            outerGlow.material.color.setHex(lerpColor(from.starGlow, to.starGlow, t));
            outerGlow.material.opacity = lerp(from.starGlowIntensity, to.starGlowIntensity, t) * 0.25;
        }
    }

    state.orbitRings.forEach((ring) => {
        ring.material.color.setHex(lerpColor(from.orbitRing, to.orbitRing, t));
        ring.material.opacity = ring.userData.baseOpacity * lerp(from.orbitOpacity, to.orbitOpacity, t);
    });

    if (state.starField) {
        state.starField.material.color.setHex(lerpColor(from.starFieldColor, to.starFieldColor, t));
        state.starField.material.opacity = lerp(from.starFieldOpacity, to.starFieldOpacity, t);
    }

    state.planets.forEach((planet) => {
        const def = planet.userData.def;
        const fromLum = isDark ? def.lum * 0.8 : def.lum;
        const toLum = isDark ? def.lum : def.lum * 0.8;
        const fromSat = isDark ? def.sat * 0.6 : def.sat;
        const toSat = isDark ? def.sat : def.sat * 0.6;

        const color = hslToHex(def.hue, lerp(fromSat, toSat, t), lerp(fromLum, toLum, t));
        planet.material.color.setHex(color);
        // planet.material.emissive.setHex(isDark ? color : 0x000000); // This is now handled by visual feedback
        // planet.material.emissiveIntensity = lerp(from.planetEmissive, to.planetEmissive, t); // This is now handled by visual feedback

        const glow = planet.getObjectByName('glow');
        if (glow) {
            glow.material.color.setHex(color);
            glow.material.opacity = lerp(0, 0.15, isDark ? t : 1 - t);
        }
    });

    if (state.ambientLight) state.ambientLight.intensity = lerp(from.ambientLight, to.ambientLight, t);
    if (state.pointLight) state.pointLight.intensity = lerp(from.pointLight, to.pointLight, t);
}

// ============================================
// RESET
// ============================================
function resetSolarSystem() {
    state.planets.forEach((planet) => {
        const def = planet.userData.def;
        const newAngle = Math.random() * Math.PI * 2;

        planet.userData.sunOrbitAngle = newAngle;
        planet.userData.cursorOrbitAngle = Math.random() * Math.PI * 2;
        planet.userData.cursorOrbitRadius = 0;
        planet.userData.offset = { x: 0, y: 0 };
        planet.userData.velocity = { x: 0, y: 0 };
        planet.userData.inCursorOrbit = false;
        planet.userData.orbitTransition = 0;
        planet.userData.flailing = false;

        planet.position.x = Math.cos(newAngle) * def.orbit;
        planet.position.y = Math.sin(newAngle) * def.orbit;
        planet.position.z = 0;
    });

    state.orbitMode.active = false;
    state.orbitMode.transitioning = false;
    state.orbitMode.affectedPlanets = [];
    state.orbitMode.disrupted = false;
    state.cursor.isIdle = false;
    state.cursor.idleStartTime = performance.now();

    console.log('[SolarSystem] Reset complete');
}

// ============================================
// CURSOR ORBIT MODE
// ============================================
function enterOrbitMode(time) {
    const cfg = CONFIG.cursorOrbit;
    const cursor = state.cursor;

    // Store cursor position as orbit center
    state.orbitMode.cursorOrbitCenter = { x: cursor.world.x, y: cursor.world.y };

    // Find nearest planets
    const sorted = state.planets
        .map((p) => ({
            planet: p,
            dist: Math.sqrt(Math.pow(p.position.x - cursor.world.x, 2) + Math.pow(p.position.y - cursor.world.y, 2))
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, cfg.orbitPlanetCount);

    state.orbitMode.active = true;
    state.orbitMode.transitioning = true;
    state.orbitMode.transitionStart = time;
    state.orbitMode.transitionProgress = 0;
    state.orbitMode.affectedPlanets = sorted.map(s => s.planet);

    // Initialize cursor orbit for each planet
    state.orbitMode.affectedPlanets.forEach((planet, idx) => {
        const data = planet.userData;
        data.inCursorOrbit = true;
        data.orbitTransition = 0;

        // Calculate initial angle from cursor to planet
        const dx = planet.position.x - cursor.world.x;
        const dy = planet.position.y - cursor.world.y;
        data.cursorOrbitAngle = Math.atan2(dy, dx);

        // Stagger orbit radii
        data.targetCursorOrbitRadius = 1.5 + idx * 0.8;
        data.cursorOrbitRadius = Math.sqrt(dx * dx + dy * dy);
    });
}

function disruptOrbitMode(time) {
    const cfg = CONFIG.cursorOrbit;
    const cursor = state.cursor;

    state.orbitMode.active = false;
    state.orbitMode.disrupted = true;

    state.orbitMode.affectedPlanets.forEach((planet) => {
        const data = planet.userData;

        // Calculate impulse direction tangent to orbit + outward
        const angle = data.cursorOrbitAngle + Math.PI / 4;
        const impulseX = Math.cos(angle) * cfg.flailImpulse;
        const impulseY = Math.sin(angle) * cfg.flailImpulse;

        data.velocity.x += impulseX + (Math.random() - 0.5) * 0.08;
        data.velocity.y += impulseY + (Math.random() - 0.5) * 0.08;
        data.inCursorOrbit = false;
        data.flailing = true;
        data.flailStartTime = time;
        data.cursorOrbitRadius = 0;
    });
}

// ============================================
// ANIMATION
// ============================================
function updateCursor() {
    const cursor = state.cursor;
    const prev = { x: cursor.smoothed.x, y: cursor.smoothed.y };

    cursor.smoothed.x = lerp(cursor.smoothed.x, cursor.raw.x, CONFIG.cursor.smoothingFactor);
    cursor.smoothed.y = lerp(cursor.smoothed.y, cursor.raw.y, CONFIG.cursor.smoothingFactor);

    cursor.velocity.x = cursor.smoothed.x - prev.x;
    cursor.velocity.y = cursor.smoothed.y - prev.y;

    const aspect = window.innerWidth / window.innerHeight;
    cursor.world.x = cursor.smoothed.x * CONFIG.viewSize * aspect;
    cursor.world.y = cursor.smoothed.y * CONFIG.viewSize;
}

function updateIdleDetection(time) {
    const cursor = state.cursor;
    const cfg = CONFIG.cursorOrbit;
    const movement = Math.abs(cursor.velocity.x) + Math.abs(cursor.velocity.y);

    if (movement > cfg.idleMovementThreshold) {
        if (state.orbitMode.active) disruptOrbitMode(time);
        cursor.isIdle = false;
        cursor.idleStartTime = time;
    } else {
        if (!cursor.isIdle) {
            cursor.isIdle = true;
            cursor.idleStartTime = time;
        }

        // DISABLED: Idle cursor orbit mode removed per user request
        // Planets no longer orbit around cursor when mouse is idle
        // if (time - cursor.idleStartTime > cfg.idleThreshold && !state.orbitMode.active && !state.orbitMode.disrupted) {
        //     enterOrbitMode(time);
        // }
    }
}

// ============================================
// HOVER-TO-FREEZE DETECTION
// ============================================
function checkPlanetHover() {
    // Skip hover updates if popup is locked
    if (state.isPopupLocked) {
        state.isSystemFrozen = true;
        return;
    }

    const cursor = state.cursor;
    let hoveredPlanet = null;

    // Check each planet and moon for cursor proximity
    state.planets.forEach((planet, index) => {
        const data = planet.userData;
        const def = data.def;

        // Check Planet
        const dist = Math.sqrt(Math.pow(planet.position.x - cursor.world.x, 2) + Math.pow(planet.position.y - cursor.world.y, 2));
        const hitRadius = def.size + 0.8;

        if (dist < hitRadius) {
            hoveredPlanet = planet;
        }

        // Check Moons (if no planet hover yet, or override? Prefer moon if closer? )
        if (data.moonPivots) {
            data.moonPivots.forEach(pivot => {
                const moon = pivot.children[0];
                const moonPos = new THREE.Vector3();
                moon.getWorldPosition(moonPos);

                const d = Math.sqrt(Math.pow(moonPos.x - cursor.world.x, 2) + Math.pow(moonPos.y - cursor.world.y, 2));
                if (d < moon.userData.def.size + 0.5) {
                    hoveredPlanet = moon;
                }
            });
        }
    });

    // Update hover state
    state.hoveredPlanet = hoveredPlanet; // Store object instead of index
    state.isSystemFrozen = !!hoveredPlanet;

    // Show/hide tooltip
    if (hoveredPlanet && state.tooltipEl) {
        showHoverTooltip(hoveredPlanet);
    } else if (state.hoveredPlanet === null && state.tooltipEl) {
        // Hide tooltip when exiting planet (only if not locked)
        if (!state.isPopupLocked) {
            const tooltip = state.tooltipEl;
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(8px)';
        }
    }
}

function showHoverTooltip(planet) {
    const def = planet.userData.def;
    const tooltip = state.tooltipEl;

    // Update tooltip content
    tooltip.querySelector('.tooltip-title').textContent = def.displayName;
    tooltip.querySelector('.tooltip-desc').textContent = def.description;
    tooltip.querySelector('.tooltip-hint').style.display = 'block';
    tooltip.querySelector('.tooltip-close').style.display = 'none';
    tooltip.querySelector('.tooltip-actions').style.display = 'none';

    // Convert world position to screen position
    const pos = new THREE.Vector3();
    planet.getWorldPosition(pos);
    const screenPos = worldToScreen(pos.x, pos.y);

    // Position tooltip to the right of the planet
    tooltip.style.left = `${screenPos.x + 30}px`;
    tooltip.style.top = `${screenPos.y - 20}px`;
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
    tooltip.style.pointerEvents = 'none';
}

function lockPopup(targetObject) {
    if (!targetObject) return;

    const def = targetObject.userData.def;
    const tooltip = state.tooltipEl;

    state.isPopupLocked = true;
    state.lockedObject = targetObject;
    state.isSystemFrozen = true;

    // Update tooltip for locked state
    tooltip.querySelector('.tooltip-title').textContent = def.displayName;
    tooltip.querySelector('.tooltip-desc').textContent = def.description;
    tooltip.querySelector('.tooltip-hint').style.display = 'none';
    tooltip.querySelector('.tooltip-close').style.display = 'block';

    // Show action buttons
    const actionsEl = tooltip.querySelector('.tooltip-actions');
    actionsEl.style.display = 'flex';
    actionsEl.innerHTML = getPlanetActions(def.name);

    // Enable pointer events on tooltip
    tooltip.style.pointerEvents = 'auto';

    // Position tooltip
    const pos = new THREE.Vector3();
    targetObject.getWorldPosition(pos);
    const screenPos = worldToScreen(pos.x, pos.y);

    tooltip.style.left = `${screenPos.x + 30}px`;
    tooltip.style.top = `${screenPos.y - 20}px`;
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
}

function unlockPopup() {
    state.isPopupLocked = false;
    state.lockedObject = null;
    state.isSystemFrozen = false;

    if (state.tooltipEl) {
        state.tooltipEl.style.opacity = '0';
        state.tooltipEl.querySelector('.tooltip-close').style.display = 'none';
        state.tooltipEl.querySelector('.tooltip-actions').style.display = 'none';
        state.tooltipEl.style.pointerEvents = 'none';
    }
}

function getPlanetActions(planetName) {
    // Define action buttons for each planet
    const btnStyle = `
        padding: 10px 14px;
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 8px;
        color: #a5b4fc;
        font-size: 13px;
        font-family: inherit;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
    `;

    const actions = {
        mercury: `
            <button style="${btnStyle}" onclick="console.log('Explore Mercury')">🚀 Quick Tour</button>
            <button style="${btnStyle}" onclick="console.log('Mercury Info')">📊 View Stats</button>
        `,
        venus: `
            <button style="${btnStyle}" onclick="console.log('Venus Explore')">🌟 Explore Venus</button>
            <button style="${btnStyle}" onclick="console.log('Venus Atmosphere')">☁️ Atmosphere</button>
        `,
        earth: `
            <button style="${btnStyle}" onclick="console.log('Projects clicked')">📁 View Projects</button>
            <button style="${btnStyle}" onclick="console.log('Dashboard')">🏠 Dashboard</button>
            <button style="${btnStyle}" onclick="console.log('Settings')">⚙️ Settings</button>
        `,
        mars: `
            <button style="${btnStyle}" onclick="console.log('Mars Mission')">🔴 Mars Mission</button>
            <button style="${btnStyle}" onclick="console.log('Rovers')">🤖 Rovers</button>
        `,
        jupiter: `
            <button style="${btnStyle}" onclick="console.log('Jupiter')">🌊 Great Red Spot</button>
            <button style="${btnStyle}" onclick="console.log('Moons')">🌙 View Moons</button>
        `,
        saturn: `
            <button style="${btnStyle}" onclick="console.log('Rings')">💍 Ring System</button>
            <button style="${btnStyle}" onclick="console.log('Titan')">🌑 Explore Titan</button>
        `,
        uranus: `
            <button style="${btnStyle}" onclick="console.log('Uranus')">🔵 Ice Giant</button>
        `,
        neptune: `
            <button style="${btnStyle}" onclick="console.log('Neptune')">🌊 Deep Blue</button>
            <button style="${btnStyle}" onclick="console.log('Triton')">❄️ Triton</button>
        `
    };

    return actions[planetName] || `<button style="${btnStyle}">ℹ️ Learn More</button>`;
}

function worldToScreen(worldX, worldY) {
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = CONFIG.viewSize;

    // Convert from world coordinates to normalized device coordinates
    const ndcX = worldX / (viewSize * aspect);
    const ndcY = worldY / viewSize;

    // Convert to screen coordinates
    return {
        x: (ndcX + 1) * window.innerWidth / 2,
        y: (-ndcY + 1) * window.innerHeight / 2
    };
}

function animatePlanets(time) {
    if (state.isReducedMotion) return;

    const cfg = CONFIG.cursorOrbit;
    const cursor = state.cursor;

    // Update orbit mode transition
    if (state.orbitMode.transitioning) {
        const elapsed = time - state.orbitMode.transitionStart;
        state.orbitMode.transitionProgress = Math.min(elapsed / cfg.transitionDuration, 1);
        if (state.orbitMode.transitionProgress >= 1) {
            state.orbitMode.transitioning = false;
        }
    }

    state.planets.forEach((planet) => {
        const data = planet.userData;
        const def = data.def;

        let targetX, targetY;

        if (data.inCursorOrbit && state.orbitMode.active) {
            // CURSOR ORBIT MODE: Planet orbits around cursor position
            const transition = easeOutCubic(state.orbitMode.transitionProgress);
            data.orbitTransition = transition;

            // Smoothly transition orbit radius
            data.cursorOrbitRadius = lerp(data.cursorOrbitRadius, data.targetCursorOrbitRadius, 0.02);

            // Advance cursor orbit angle (faster than sun orbit)
            data.cursorOrbitAngle += data.orbitSpeed * cfg.orbitSpeedMultiplier * 0.01;

            // Calculate position around cursor
            const cursorOrbitX = state.orbitMode.cursorOrbitCenter.x + Math.cos(data.cursorOrbitAngle) * data.cursorOrbitRadius;
            const cursorOrbitY = state.orbitMode.cursorOrbitCenter.y + Math.sin(data.cursorOrbitAngle) * data.cursorOrbitRadius;

            // Also advance sun orbit (slower, in background)
            data.sunOrbitAngle += data.orbitSpeed * 0.003;
            const sunOrbitX = Math.cos(data.sunOrbitAngle) * def.orbit;
            const sunOrbitY = Math.sin(data.sunOrbitAngle) * def.orbit;

            // Blend between sun orbit and cursor orbit
            targetX = lerp(sunOrbitX, cursorOrbitX, transition);
            targetY = lerp(sunOrbitY, cursorOrbitY, transition);

        } else {
            // NORMAL MODE: Planet orbits around sun
            // Only advance orbit if system is NOT frozen (hover-to-freeze)
            if (!state.isSystemFrozen) {
                data.sunOrbitAngle += data.orbitSpeed * 0.01;
            }
            targetX = Math.cos(data.sunOrbitAngle) * def.orbit;
            targetY = Math.sin(data.sunOrbitAngle) * def.orbit;

            // Cursor collision REMOVED - planets no longer affected by cursor movement
        }

        // Flailing: check if done
        if (data.flailing && time - data.flailStartTime > cfg.flailDuration) {
            data.flailing = false;
            if (state.orbitMode.affectedPlanets.every(p => !p.userData.flailing)) {
                state.orbitMode.disrupted = false;
                state.orbitMode.affectedPlanets = [];
            }
        }

        // Apply velocity to offset
        data.offset.x += data.velocity.x;
        data.offset.y += data.velocity.y;

        // Damping
        data.velocity.x *= CONFIG.physics.dampening;
        data.velocity.y *= CONFIG.physics.dampening;

        // Spring back (when not in cursor orbit)
        if (!data.inCursorOrbit) {
            data.offset.x *= (1 - CONFIG.physics.restoreForce);
            data.offset.y *= (1 - CONFIG.physics.restoreForce);
        }

        // Clamp displacement
        const maxD = CONFIG.physics.maxDisplacement;
        data.offset.x = clamp(data.offset.x, -maxD, maxD);
        data.offset.y = clamp(data.offset.y, -maxD, maxD);

        // Vertical oscillation
        const vertOsc = Math.sin(time * CONFIG.motion.oscillationSpeed + data.phaseOffset) * CONFIG.motion.verticalOscillation;

        // Final position
        planet.position.x = targetX + data.offset.x;
        planet.position.y = targetY + data.offset.y + vertOsc;

        // Rotation (Only if not frozen, so moons stop orbiting too)
        if (!state.isSystemFrozen) {
            planet.rotation.y += CONFIG.motion.microRotationSpeed;
            planet.rotation.x += CONFIG.motion.microRotationSpeed * 0.5;
        }

        // Animate Moons
        if (data.moonPivots) {
            data.moonPivots.forEach(pivot => {
                const moonSpeed = pivot.userData.speed || 1;
                // Only animate if system is NOT frozen
                if (!state.isSystemFrozen) {
                    pivot.rotation.y += moonSpeed * 0.02;
                }

                // Moon Visual Feedback
                const moon = pivot.children[0]; // The mesh
                const isMoonActive = (moon === state.hoveredPlanet || moon === state.lockedObject);
                const targetMoonIntensity = isMoonActive ? 0.6 : 0;

                moon.material.emissive.setHex(moon.userData.def.hue ? hslToHex(moon.userData.def.hue, moon.userData.def.sat, moon.userData.def.lum) : 0xaaaaaa);
                moon.material.emissiveIntensity = lerp(moon.material.emissiveIntensity, targetMoonIntensity, 0.1);
            });
        }

        // Planet Visual Feedback
        const isActive = (planet === state.hoveredPlanet || planet === state.lockedObject);
        const targetIntensity = isActive ? 0.6 : 0;

        planet.material.emissive.setHex(data.color);
        planet.material.emissiveIntensity = lerp(planet.material.emissiveIntensity, targetIntensity, 0.1);

        // Orbit Ring Visual Feedback
        const ring = state.orbitRings[planet.userData.index];
        if (ring) {
            const targetOpacity = isActive ? 0.4 : ring.userData.baseOpacity; // Brighter when active
            ring.material.opacity = lerp(ring.material.opacity, targetOpacity, 0.1);
        }
    });
}

function animateSun(time) {
    if (!state.sun || state.isReducedMotion) return;
    const pulse = 1 + Math.sin(time / CONFIG.motion.starPulsePeriod * Math.PI * 2) * CONFIG.motion.starPulseAmplitude;
    state.sun.scale.set(pulse, pulse, pulse);
}

function updateCamera() {
    if (state.isReducedMotion) return;
    const target = {
        x: state.cursor.smoothed.x * CONFIG.cursor.cameraInfluence,
        y: state.cursor.smoothed.y * CONFIG.cursor.cameraInfluence
    };
    state.camera.position.x = lerp(state.camera.position.x, target.x, 0.02);
    state.camera.position.y = lerp(state.camera.position.y, target.y, 0.02);
}

function updateLighting() {
    state.pointLight.position.x = state.cursor.smoothed.x * CONFIG.cursor.lightInfluence;
    state.pointLight.position.y = state.cursor.smoothed.y * CONFIG.cursor.lightInfluence;
}

function animate(time) {
    state.animationId = requestAnimationFrame(animate);
    if (!CONFIG.enabled) return;

    updateCursor();

    checkPlanetHover();
    checkSunHover();
    updateIdleDetection(time);

    // Theme transition
    if (state.theme.transitioning) {
        const elapsed = time - state.theme.transitionStart;
        state.theme.progress = Math.min(elapsed / CONFIG.theme.transitionDuration, 1);
        applyTheme(easeInOutQuad(state.theme.progress));
        if (state.theme.progress >= 1) {
            state.theme.transitioning = false;
            state.theme.current = state.theme.target;
        }
    }

    animatePlanets(time);
    animateSun(time);
    animateStarField(time); // Twinkling stars enabled
    updateCamera();
    updateLighting();

    state.renderer.render(state.scene, state.camera);
    state.lastTime = time;
}

// ============================================
// EVENT HANDLERS
// ============================================
function onMouseMove(e) {
    state.cursor.raw.x = (e.clientX / window.innerWidth) * 2 - 1;
    state.cursor.raw.y = -((e.clientY / window.innerHeight) * 2 - 1);
    state.cursor.lastMoveTime = performance.now();
}

function onTouchMove(e) {
    if (e.touches.length > 0) {
        state.cursor.raw.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        state.cursor.raw.y = -((e.touches[0].clientY / window.innerHeight) * 2 - 1);
        state.cursor.lastMoveTime = performance.now();
    }
}

function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    const aspect = w / h;
    state.camera.left = -CONFIG.viewSize * aspect;
    state.camera.right = CONFIG.viewSize * aspect;
    state.camera.top = CONFIG.viewSize;
    state.camera.bottom = -CONFIG.viewSize;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(w, h);
}

function onThemeChange() {
    setTheme(detectTheme(), true);
}

// ============================================
// LIFECYCLE
// ============================================
function init() {
    if (state.isInitialized) return;

    state.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    initScene();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });
    window.addEventListener('resize', onResize);

    new MutationObserver(onThemeChange).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onThemeChange);
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        state.isReducedMotion = e.matches;
    });

    // Reset button listener
    document.addEventListener('click', (e) => {
        if (e.target.closest('#reset-solar-btn')) {
            resetSolarSystem();
        }
    });

    // Sun click interactions
    document.addEventListener('click', onSunClick, { passive: true });

    // Enable sun-mode by default (dashboard content starts hidden "in the sun")
    document.querySelector('.dashboard')?.classList.add('sun-mode');

    animate(0);
    state.isInitialized = true;
    console.log('[SolarSystem v2.3] Initialized', { theme: state.theme.current, reducedMotion: state.isReducedMotion });
}

function onSunClick(e) {
    // Skip if clicking on UI elements (buttons, forms, cards, etc.)
    if (e.target.closest('button, a, input, .login-card, .dashboard-header, .project-card, #planet-tooltip')) {
        return;
    }

    // If popup is locked and clicking outside, unlock it
    if (state.isPopupLocked) {
        unlockPopup();
        return;
    }

    // Convert click position to world coordinates
    const clickX = (e.clientX / window.innerWidth) * 2 - 1;
    const clickY = -((e.clientY / window.innerHeight) * 2 - 1);

    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = CONFIG.viewSize;
    const worldX = clickX * viewSize * aspect;
    const worldY = clickY * viewSize;

    // Check if click is on a planet OR moon
    let clickedObject = null;

    // Check planets and their moons
    state.planets.forEach((planet) => {
        // Check planet
        const dist = Math.sqrt(Math.pow(planet.position.x - worldX, 2) + Math.pow(planet.position.y - worldY, 2));
        if (dist < planet.userData.def.size + 0.8) {
            clickedObject = planet;
        }

        // Check moons
        if (!clickedObject && planet.userData.moonPivots) {
            planet.userData.moonPivots.forEach(pivot => {
                const moon = pivot.children[0];
                const moonPos = new THREE.Vector3();
                moon.getWorldPosition(moonPos);
                const d = Math.sqrt(Math.pow(moonPos.x - worldX, 2) + Math.pow(moonPos.y - worldY, 2));
                if (d < moon.userData.def.size + 0.5) {
                    clickedObject = moon;
                }
            });
        }
    });

    if (clickedObject) {
        // Lock popup on this object
        lockPopup(clickedObject);
        console.log('[SolarSystem] Object clicked:', clickedObject.userData.def.displayName);
        return;
    }

    // Check if click is on the sun (center of scene)
    const sunRadius = 3.0;
    const distToSun = Math.sqrt(worldX * worldX + worldY * worldY);

    if (distToSun < sunRadius) {
        // Open projects modal
        openProjectsModal();
        hideSunTooltip();
        console.log('[SolarSystem] Sun clicked - opening projects modal');
    }
}

function destroy() {
    if (!state.isInitialized) return;
    if (state.animationId) cancelAnimationFrame(state.animationId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchstart', onTouchMove);
    window.removeEventListener('resize', onResize);

    state.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose?.();
    });

    state.renderer.dispose();
    document.getElementById('bg3d-canvas')?.remove();
    state.planets = [];
    state.orbitRings = [];
    state.isInitialized = false;
}

function toggle(enabled) {
    CONFIG.enabled = enabled;
    const canvas = document.getElementById('bg3d-canvas');
    if (canvas) canvas.style.opacity = enabled ? '1' : '0';
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export API
window.Background3D = {
    init,
    destroy,
    toggle,
    reset: resetSolarSystem,
    setTheme: (theme) => setTheme(theme, true),
    config: CONFIG,
    state,
};
