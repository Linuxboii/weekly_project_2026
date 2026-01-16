/**
 * Premium Solar System Background - v2.1 (Stable Orbits)
 * Physics-based orbital system with stable orbits, cursor interaction, and reset
 * 
 * Planets follow their predetermined orbital paths. Cursor collision causes
 * temporary displacement with spring-back to orbit. Gravity is suggestive only.
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // === ORBITAL MOTION ===
    motion: {
        baseOrbitSpeed: 0.25,
        microRotationSpeed: 0.002,
        verticalOscillation: 0.04,
        oscillationSpeed: 0.0003,
        starPulsePeriod: 12000,
        starPulseAmplitude: 0.06,
    },

    // === CURSOR INTERACTION ===
    cursor: {
        smoothingFactor: 0.05,
        cameraInfluence: 0.2,
        lightInfluence: 1.5,
        collisionRadius: 1.8,
        collisionForce: 0.12,
    },

    // === PHYSICS (Spring-back only) ===
    physics: {
        dampening: 0.94,
        restoreForce: 0.015,
        maxDisplacement: 3.0,
    },

    // === CURSOR ORBIT MODE ===
    cursorOrbit: {
        idleThreshold: 10000,
        idleMovementThreshold: 0.008,
        orbitPlanetCount: 4,
        cursorGravityStrength: 0.004,
        transitionDuration: 3000,
        flailDuration: 15000,
        flailImpulse: 0.18,
    },

    // === THEME ===
    theme: {
        transitionDuration: 800,
        current: 'dark',
    },

    // === DARK MODE ===
    dark: {
        starCore: 0xfff8eb,
        starGlow: 0xfffde8,
        starGlowIntensity: 0.3,
        orbitRing: 0x2a2a38,
        orbitOpacity: 0.28,
        ambientLight: 0.18,
        pointLight: 0.7,
        planetEmissive: 0.12,
    },

    // === LIGHT MODE ===
    light: {
        starCore: 0xd8d4cc,
        starGlow: 0xc8c4bc,
        starGlowIntensity: 0.06,
        orbitRing: 0xb8b8c0,
        orbitOpacity: 0.4,
        ambientLight: 0.55,
        pointLight: 0.25,
        planetEmissive: 0,
    },

    enabled: true,
};

// Planet definitions
const PLANET_DEFS = [
    { name: 'mercury', orbit: 3.0, size: 0.12, speed: 3.5, hue: 0.08, sat: 0.15, lum: 0.60 },
    { name: 'venus', orbit: 3.8, size: 0.16, speed: 1.4, hue: 0.12, sat: 0.35, lum: 0.70 },
    { name: 'earth', orbit: 4.8, size: 0.17, speed: 1.0, hue: 0.58, sat: 0.45, lum: 0.65 },
    { name: 'mars', orbit: 5.8, size: 0.13, speed: 0.5, hue: 0.02, sat: 0.55, lum: 0.55 },
    { name: 'jupiter', orbit: 7.5, size: 0.35, speed: 0.08, hue: 0.10, sat: 0.25, lum: 0.68 },
    { name: 'saturn', orbit: 9.5, size: 0.30, speed: 0.04, hue: 0.11, sat: 0.30, lum: 0.65 },
    { name: 'uranus', orbit: 11.5, size: 0.20, speed: 0.015, hue: 0.52, sat: 0.25, lum: 0.50 },
    { name: 'neptune', orbit: 13.5, size: 0.18, speed: 0.008, hue: 0.62, sat: 0.40, lum: 0.45 },
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
        affectedPlanets: [],
        disrupted: false,
    },

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
// OBJECT CREATION
// ============================================
function createStarField() {
    const count = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 4 + Math.random() * 14;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = -8 - Math.random() * 20;
        basePositions[i * 3] = positions[i * 3];
        basePositions[i * 3 + 1] = positions[i * 3 + 1];
        basePositions[i * 3 + 2] = positions[i * 3 + 2];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.06,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.userData.basePositions = basePositions;
    return points;
}

function createSun() {
    const group = new THREE.Group();

    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshBasicMaterial({ color: getTheme('starCore'), transparent: true, opacity: 0.95 })
    );
    core.name = 'core';
    group.add(core);

    const innerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 24, 24),
        new THREE.MeshBasicMaterial({
            color: getTheme('starGlow'),
            transparent: true,
            opacity: getTheme('starGlowIntensity') * 0.7,
            side: THREE.BackSide
        })
    );
    innerGlow.name = 'innerGlow';
    group.add(innerGlow);

    const outerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 20, 20),
        new THREE.MeshBasicMaterial({
            color: getTheme('starGlow'),
            transparent: true,
            opacity: getTheme('starGlowIntensity') * 0.25,
            side: THREE.BackSide
        })
    );
    outerGlow.name = 'outerGlow';
    group.add(outerGlow);

    return group;
}

function createOrbitRing(radius, index, total) {
    const segments = 128;
    const positions = new Float32Array(segments * 3);

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const depthFactor = 1 - (index / total);
    const baseOpacity = 0.12 + depthFactor * 0.18;

    const material = new THREE.LineBasicMaterial({
        color: getTheme('orbitRing'),
        transparent: true,
        opacity: baseOpacity * getTheme('orbitOpacity'),
    });

    const ring = new THREE.LineLoop(geometry, material);
    ring.userData = { baseOpacity, radius, depthFactor };
    return ring;
}

function createPlanet(def, index) {
    const isDark = state.theme.current === 'dark';
    const color = hslToHex(def.hue, isDark ? def.sat : def.sat * 0.6, isDark ? def.lum : def.lum * 0.8);

    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(def.size, 24, 24),
        new THREE.MeshStandardMaterial({
            color,
            metalness: 0.05,
            roughness: 0.8,
            emissive: isDark ? color : 0x000000,
            emissiveIntensity: isDark ? CONFIG.dark.planetEmissive : 0,
            transparent: true,
            opacity: 0.94,
        })
    );

    // Glow halo
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(def.size * 1.6, 16, 16),
        new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: isDark ? 0.15 : 0,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        })
    );
    glow.name = 'glow';
    planet.add(glow);

    // Planet state - angle-based orbit (stable)
    const startAngle = Math.random() * Math.PI * 2;
    planet.userData = {
        def,
        index,
        color,
        // Stable orbital motion
        angle: startAngle,
        orbitRadius: def.orbit,
        orbitSpeed: def.speed * CONFIG.motion.baseOrbitSpeed,
        phaseOffset: Math.random() * Math.PI * 2,
        // Displacement from cursor (spring-back)
        offset: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        // Cursor orbit mode
        inCursorOrbit: false,
        orbitTransition: 0,
        flailing: false,
        flailStartTime: 0,
    };

    // Initial position on orbit
    planet.position.x = Math.cos(startAngle) * def.orbit;
    planet.position.y = Math.sin(startAngle) * def.orbit;

    // Saturn's ring
    if (def.name === 'saturn') {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(def.size * 1.5, def.size * 2.5, 48),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI * 0.35;
        ring.name = 'saturnRing';
        planet.add(ring);
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
    const viewSize = 16;
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

    // Build scene
    state.starField = createStarField();
    state.scene.add(state.starField);

    state.sun = createSun();
    state.scene.add(state.sun);

    PLANET_DEFS.forEach((def, i) => {
        const planet = createPlanet(def, i);
        state.planets.push(planet);
        state.scene.add(planet);

        const ring = createOrbitRing(def.orbit, i, PLANET_DEFS.length);
        state.orbitRings.push(ring);
        state.scene.add(ring);
    });

    state.ambientLight = new THREE.AmbientLight(0xffffff, getTheme('ambientLight'));
    state.scene.add(state.ambientLight);

    state.pointLight = new THREE.PointLight(0xfff5e6, getTheme('pointLight'), 40);
    state.pointLight.position.set(0, 0, 5);
    state.scene.add(state.pointLight);
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
        state.starField.material.opacity = lerp(0.2, 0.35, isDark ? t : 1 - t);
    }

    state.planets.forEach((planet) => {
        const def = planet.userData.def;
        const fromLum = isDark ? def.lum * 0.8 : def.lum;
        const toLum = isDark ? def.lum : def.lum * 0.8;
        const fromSat = isDark ? def.sat * 0.6 : def.sat;
        const toSat = isDark ? def.sat : def.sat * 0.6;

        const color = hslToHex(def.hue, lerp(fromSat, toSat, t), lerp(fromLum, toLum, t));
        planet.material.color.setHex(color);
        planet.material.emissive.setHex(isDark ? color : 0x000000);
        planet.material.emissiveIntensity = lerp(from.planetEmissive, to.planetEmissive, t);

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
// RESET FUNCTION
// ============================================
function resetSolarSystem() {
    state.planets.forEach((planet, index) => {
        const def = planet.userData.def;
        const newAngle = Math.random() * Math.PI * 2;

        // Reset orbital state
        planet.userData.angle = newAngle;
        planet.userData.offset = { x: 0, y: 0 };
        planet.userData.velocity = { x: 0, y: 0 };
        planet.userData.inCursorOrbit = false;
        planet.userData.orbitTransition = 0;
        planet.userData.flailing = false;

        // Reset position to orbit
        planet.position.x = Math.cos(newAngle) * def.orbit;
        planet.position.y = Math.sin(newAngle) * def.orbit;
        planet.position.z = 0;
    });

    // Reset orbit mode
    state.orbitMode.active = false;
    state.orbitMode.transitioning = false;
    state.orbitMode.affectedPlanets = [];
    state.orbitMode.disrupted = false;

    // Reset cursor idle
    state.cursor.isIdle = false;
    state.cursor.idleStartTime = performance.now();

    console.log('[SolarSystem] Reset complete');
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
    cursor.world.x = cursor.smoothed.x * 16 * aspect;
    cursor.world.y = cursor.smoothed.y * 16;
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

        if (time - cursor.idleStartTime > cfg.idleThreshold && !state.orbitMode.active && !state.orbitMode.disrupted) {
            enterOrbitMode(time);
        }
    }
}

function enterOrbitMode(time) {
    const cfg = CONFIG.cursorOrbit;
    const cursor = state.cursor;

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
    state.orbitMode.affectedPlanets = sorted.map(s => s.planet);

    state.orbitMode.affectedPlanets.forEach((p) => {
        p.userData.inCursorOrbit = true;
        p.userData.orbitTransition = 0;
    });
}

function disruptOrbitMode(time) {
    const cfg = CONFIG.cursorOrbit;
    const cursor = state.cursor;

    state.orbitMode.active = false;
    state.orbitMode.disrupted = true;

    state.orbitMode.affectedPlanets.forEach((planet) => {
        const data = planet.userData;
        const dx = planet.position.x - cursor.world.x;
        const dy = planet.position.y - cursor.world.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        data.velocity.x += (dx / dist) * cfg.flailImpulse + (Math.random() - 0.5) * 0.1;
        data.velocity.y += (dy / dist) * cfg.flailImpulse + (Math.random() - 0.5) * 0.1;
        data.inCursorOrbit = false;
        data.flailing = true;
        data.flailStartTime = time;
    });
}

function animatePlanets(time) {
    if (state.isReducedMotion) return;

    const cfg = CONFIG.cursorOrbit;
    const cursor = state.cursor;

    state.planets.forEach((planet) => {
        const data = planet.userData;
        const def = data.def;

        // STABLE ORBIT: Always advance angle
        data.angle += data.orbitSpeed * 0.01;

        // Calculate orbital position
        const orbitX = Math.cos(data.angle) * def.orbit;
        const orbitY = Math.sin(data.angle) * def.orbit;

        // Vertical oscillation
        const vertOsc = Math.sin(time * CONFIG.motion.oscillationSpeed + data.phaseOffset) * CONFIG.motion.verticalOscillation;

        // Cursor collision (displacement)
        if (!state.isMobile && !data.inCursorOrbit) {
            const dx = (orbitX + data.offset.x) - cursor.world.x;
            const dy = (orbitY + data.offset.y) - cursor.world.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = CONFIG.cursor.collisionRadius + def.size;

            if (dist < minDist && dist > 0) {
                const force = (1 - dist / minDist) * CONFIG.cursor.collisionForce;
                data.velocity.x += (dx / dist) * force;
                data.velocity.y += (dy / dist) * force;
            }
        }

        // Cursor orbit mode: attracted to cursor instead of sun
        if (data.inCursorOrbit && state.orbitMode.active) {
            // Transition progress
            const elapsed = time - state.orbitMode.transitionStart;
            data.orbitTransition = Math.min(elapsed / cfg.transitionDuration, 1);

            // Gentle pull toward cursor
            const dx = cursor.world.x - (orbitX + data.offset.x);
            const dy = cursor.world.y - (orbitY + data.offset.y);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            const pull = cfg.cursorGravityStrength * easeOutCubic(data.orbitTransition);
            data.velocity.x += (dx / dist) * pull;
            data.velocity.y += (dy / dist) * pull;
        }

        // Flailing: check if done
        if (data.flailing && time - data.flailStartTime > cfg.flailDuration) {
            data.flailing = false;
            // Clear disrupted if all done
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

        // Spring back to orbit (reduce offset)
        if (!data.inCursorOrbit) {
            data.offset.x *= (1 - CONFIG.physics.restoreForce);
            data.offset.y *= (1 - CONFIG.physics.restoreForce);
        }

        // Clamp displacement
        const maxD = CONFIG.physics.maxDisplacement;
        data.offset.x = clamp(data.offset.x, -maxD, maxD);
        data.offset.y = clamp(data.offset.y, -maxD, maxD);

        // Final position
        planet.position.x = orbitX + data.offset.x;
        planet.position.y = orbitY + data.offset.y + vertOsc;

        // Rotation
        planet.rotation.y += CONFIG.motion.microRotationSpeed;
        planet.rotation.x += CONFIG.motion.microRotationSpeed * 0.5;
    });
}

function animateSun(time) {
    if (!state.sun || state.isReducedMotion) return;
    const pulse = 1 + Math.sin(time / CONFIG.motion.starPulsePeriod * Math.PI * 2) * CONFIG.motion.starPulseAmplitude;
    state.sun.scale.set(pulse, pulse, pulse);
}

function animateStarField() {
    if (!state.starField || state.isReducedMotion) return;
    const positions = state.starField.geometry.attributes.position.array;
    const base = state.starField.userData.basePositions;

    for (let i = 0; i < positions.length / 3; i++) {
        const depth = Math.abs(base[i * 3 + 2]) / 28;
        positions[i * 3] = base[i * 3] + state.cursor.smoothed.x * depth * 0.6;
        positions[i * 3 + 1] = base[i * 3 + 1] + state.cursor.smoothed.y * depth * 0.6;
    }
    state.starField.geometry.attributes.position.needsUpdate = true;
}

function updateCamera() {
    if (state.isMobile || state.isReducedMotion) return;
    const target = {
        x: state.cursor.smoothed.x * CONFIG.cursor.cameraInfluence,
        y: state.cursor.smoothed.y * CONFIG.cursor.cameraInfluence
    };
    state.camera.position.x = lerp(state.camera.position.x, target.x, 0.02);
    state.camera.position.y = lerp(state.camera.position.y, target.y, 0.02);
}

function updateLighting() {
    if (state.isMobile) return;
    state.pointLight.position.x = state.cursor.smoothed.x * CONFIG.cursor.lightInfluence;
    state.pointLight.position.y = state.cursor.smoothed.y * CONFIG.cursor.lightInfluence;
}

function animate(time) {
    state.animationId = requestAnimationFrame(animate);
    if (!CONFIG.enabled) return;

    updateCursor();
    if (!state.isMobile) updateIdleDetection(time);

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
    animateStarField();
    updateCamera();
    updateLighting();

    state.renderer.render(state.scene, state.camera);
    state.lastTime = time;
}

// ============================================
// EVENT HANDLERS
// ============================================
function onMouseMove(e) {
    if (state.isMobile) return;
    state.cursor.raw.x = (e.clientX / window.innerWidth) * 2 - 1;
    state.cursor.raw.y = -((e.clientY / window.innerHeight) * 2 - 1);
    state.cursor.lastMoveTime = performance.now();
}

function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    const aspect = w / h;
    state.camera.left = -16 * aspect;
    state.camera.right = 16 * aspect;
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

    if (!state.isMobile) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
    }
    window.addEventListener('resize', onResize);

    // Theme observers
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

    animate(0);
    state.isInitialized = true;
    console.log('[SolarSystem v2.1] Initialized', { theme: state.theme.current, reducedMotion: state.isReducedMotion });
}

function destroy() {
    if (!state.isInitialized) return;
    if (state.animationId) cancelAnimationFrame(state.animationId);
    window.removeEventListener('mousemove', onMouseMove);
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
