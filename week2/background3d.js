/**
 * Premium Solar System Background - v2.2 (Cursor Orbit + Enhanced Stars)
 * Planets orbit the cursor when idle, with enhanced starry background
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // === GLOBAL VIEW ===
    viewSize: 24, // Increased to fit all planets including Neptune
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

// ============================================
// API CONFIGURATION
// ============================================
// Note: Using different name to avoid conflict with auth.js
const SOLAR_API_URL = 'https://api.avlokai.com';

// Planet definitions - populated from API (empty by default)
let PLANET_DEFS = [];

// Planet color palette (dynamic generation fallback)
const PLANET_PALETTE = [
    { hue: 0.08, sat: 0.15, lum: 0.60 }, // Mercury-ish
    { hue: 0.12, sat: 0.8, lum: 0.6 },   // Venus-ish
    { hue: 0.58, sat: 0.6, lum: 0.5 },   // Earth-ish
    { hue: 0.02, sat: 0.7, lum: 0.55 },  // Mars-ish
    { hue: 0.08, sat: 0.6, lum: 0.45 },  // Jupiter-ish
    { hue: 0.14, sat: 0.5, lum: 0.7 },   // Saturn-ish
    { hue: 0.48, sat: 0.5, lum: 0.6 },   // Uranus-ish
    { hue: 0.62, sat: 0.6, lum: 0.4 },   // Neptune-ish
];

// Moon color palette
const MOON_COLORS = [
    { hue: 0.0, sat: 0.0, lum: 0.8 },
    { hue: 0.05, sat: 0.2, lum: 0.6 },
    { hue: 0.55, sat: 0.2, lum: 0.9 },
    { hue: 0.15, sat: 0.8, lum: 0.7 },
];

const MOON_NAMES = {
    'earth': ['Moon'],
    'mars': ['Phobos', 'Deimos'],
    'jupiter': ['Io', 'Europa', 'Ganymede', 'Callisto'],
    'saturn': ['Titan', 'Enceladus', 'Mimas', 'Dione', 'Rhea', 'Iapetus'],
    'uranus': ['Titania', 'Oberon', 'Umbriel', 'Ariel', 'Miranda'],
    'neptune': ['Triton', 'Proteus', 'Nereid']
};

const PLANET_NAMES = [
    'mercury', 'venus', 'earth', 'mars',
    'jupiter', 'saturn', 'uranus', 'neptune'
];

const ASTEROID_NAMES = [
    "Ceres", "Pallas", "Juno", "Vesta", "Astraea", "Hebe", "Iris", "Flora", "Metis", "Hygiea",
    "Parthenope", "Victoria", "Egeria", "Irene", "Eunomia", "Psyche", "Thetis", "Melpomene", "Fortuna", "Massalia",
    "Lutetia", "Calliope", "Thalia", "Themis", "Phocaea", "Proserpina", "Euterpe", "Bellona", "Amphitrite", "Urania",
    "Euphrosyne", "Pomona", "Polyhymnia", "Circe", "Leucothea", "Atalante", "Fides", "Leda", "Laetitia", "Harmonia",
    "Daphne", "Isis", "Ariadne", "Nysa", "Eugenia", "Hestia", "Aglaia", "Doris", "Pales", "Virginia"
];

// ============================================
// API DATA FETCHING
// ============================================
async function fetchControlProjects() {
    try {
        console.log('[SolarSystem] Fetching projects from API...');
        const res = await fetch(`${SOLAR_API_URL}/control/projects`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const projects = await res.json();
        console.log('[SolarSystem] Fetched', projects.length, 'projects');
        return projects;
    } catch (err) {
        console.error('[SolarSystem] Failed to fetch projects:', err);
        return null;
    }
}

// ============================================
// DATA TRANSFORMATION
// ============================================
function buildPlanetDefsFromProjects(projects) {
    const projectList = projects || [];
    const planetsData = projectList.filter(p => p.moon_index === null);
    const moonsData = projectList.filter(p => p.moon_index !== null);

    return STATIC_PLANET_DEFS.map((staticDef, index) => {
        // Find project data for this planet (case-insensitive match)
        // Adjust matching logic as needed (e.g. if backend returns 'earth-app' key on 'planet' field)
        const proj = planetsData.find(p => p.planet && p.planet.toLowerCase() === staticDef.name.toLowerCase());

        if (proj) {
            console.log(`[SolarSystem] Mapped project "${proj.name}" to planet ${staticDef.displayName}`);
        }

        const hasData = !!proj;
        const color = PLANET_COLORS[index % PLANET_COLORS.length]; // Fallback to standard colors

        // Use static def properties, override speed if active
        // If inactive (no data), use a 'ghost' style

        let hue = staticDef.hue;
        let sat = staticDef.sat;
        let lum = staticDef.lum;
        let description = staticDef.description;
        let displayName = staticDef.displayName;
        let moons = staticDef.moons; // Default mocked moons

        if (hasData) {
            // Apply project specific data
            displayName = proj.name || staticDef.displayName;
            description = `${proj.status} • ${proj.deployment_type}`;
            // Adjust visualization based on status
            lum = proj.status === 'archived' ? staticDef.lum * 0.5 : staticDef.lum;

            // Map moons if any
            const planetMoons = moonsData.filter(m => m.planet.toLowerCase() === staticDef.name.toLowerCase())
                .sort((a, b) => a.moon_index - b.moon_index)
                .map((moonProj, moonIdx) => {
                    const moonColor = MOON_COLORS[moonIdx % MOON_COLORS.length];
                    return {
                        name: moonProj.slug, displayName: moonProj.name,
                        description: `${moonProj.status} • ${moonProj.deployment_type}`,
                        size: 0.08 + (moonIdx * 0.02), orbit: 0.4 + (moonIdx * 0.25),
                        speed: 1.5 - (moonIdx * 0.3), hue: moonColor.hue, sat: moonColor.sat, lum: moonColor.lum,
                        projectData: moonProj,
                        isMoon: true
                    };
                });
            if (planetMoons.length > 0) moons = planetMoons;
        } else {
            // GREYED OUT STATE for empty planets
            sat = 0; // Desaturate
            lum = 0.2; // Dim
            description = "No data available";

            // Grey out static moons too
            if (moons && moons.length > 0) {
                moons = moons.map(m => ({
                    ...m,
                    sat: 0,
                    lum: 0.2
                }));
            }
        }

        return {
            ...staticDef,
            displayName,
            description,
            hue, sat, lum,
            moons,
            projectData: proj || null,
            hasData: hasData, // Flag for interaction
            isArchived: proj?.status === 'archived',
            isPaused: proj?.status === 'paused',
            isDashed: proj?.auto_deploy === false,
            isThickOrbit: proj?.deployment_type === 'self_hosted'
        };
    });
}

function getStatusSpeedMultiplier(status) {
    if (status === 'paused') return 0.2;
    if (status === 'archived') return 0.05; // Almost stopped
    return 1.0;
}

function getDeploymentMotion(type) {
    if (type === 'static') return 0;
    if (type === 'self_hosted') return 0.8;
    return 1.0;
}

// Fallback removed - we do not assume any planets exist
// function getFallbackPlanets() { ... }

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

    // Data
    projects: [], // Raw project list from API
    asteroids: [], // Asteroid belt objects
};

const ASTEROID_COUNT = 50;
const ASTEROID_BELT_RADIUS_MIN = 13; // Between Mars (11.5) and Jupiter (14)
const ASTEROID_BELT_RADIUS_MAX = 15;


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

function createOrbitRing(radius, index, total, def) {
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
    // Even fainter if no data
    let baseOpacity = CONFIG.theme.current === 'dark' ? 0.08 : 0.05;
    if (def && !def.hasData) {
        baseOpacity *= 0.3; // Very dim for empty planets
    }

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
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
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

        // Orbit rings - styled based on backend state
        const ring = createOrbitRing(def.orbit, i, PLANET_DEFS.length, def);
        state.orbitRings.push(ring);
        state.scene.add(ring);
    });

    // Add Asteroid Belt
    const asteroidBelt = createAsteroidBelt();
    state.scene.add(asteroidBelt);

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

    // Populate with ALL projects (Index Mode)
    const projectsContainer = modal.querySelector('.modal-projects');

    // Show all projects sorted by planet
    const projects = [...state.projects].sort((a, b) => {
        if (!a.planet) return 1;
        if (!b.planet) return -1;
        return a.planet.localeCompare(b.planet);
    });

    // Helper to add token to URL
    const getUrlWithToken = (url) => {
        const token = localStorage.getItem('auth_token'); // Matches key in login/auth.js
        if (!token) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}auth_token=${encodeURIComponent(token)}`;
    };

    projectsContainer.innerHTML = projects.map(p => {
        const hasPlanet = p.planet;
        const planetName = hasPlanet ? p.planet.charAt(0).toUpperCase() + p.planet.slice(1) : 'Unassigned';
        const moonInfo = p.moon_index !== null ? ` • Moon ${p.moon_index}` : '';
        const locationText = hasPlanet ? `${planetName}${moonInfo}` : 'Orbiting Star';
        const locationColor = hasPlanet ? '#a5b4fc' : '#9ca3af';

        return `
        <a class="modal-project-card" href="${getUrlWithToken(p.url || '#')}" data-project-id="${p.id}" style="display: flex; gap: 12px; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; text-decoration: none; color: white; transition: background 0.2s;">
            <div class="modal-project-icon" style="color: ${locationColor}; opacity: 0.8;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
            </div>
            <div class="modal-project-info" style="flex: 1;">
                <div class="modal-project-name" style="font-weight: 500; font-size: 15px;">${p.name}</div>
                <div class="modal-project-location" style="font-size: 11px; color: ${locationColor}; margin-top: 2px;">
                    ${locationText}
                </div>
            </div>
            <div style="opacity: 0.3;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </div>
        </a>
    `}).join('');

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
// ============================================
// HOVER-TO-FREEZE DETECTION
// ============================================
function checkPlanetHover() {
    // Skip hover updates if popup is locked
    if (state.isPopupLocked) {
        state.isSystemFrozen = true;
        document.body.style.cursor = 'default';
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

        // FIX: Check def.hasData instead of data.hasData 
        // UPDATE: Allow hover on empty planets for adding new projects
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

    // Check Asteroids
    if (state.asteroids) {
        state.asteroids.forEach(asteroid => {
            const dist = Math.sqrt(Math.pow(asteroid.position.x - cursor.world.x, 2) + Math.pow(asteroid.position.y - cursor.world.y, 2));
            if (dist < asteroid.userData.def.size + 0.3) {
                hoveredPlanet = asteroid;
            }
        });
    }

    // Update hover state
    state.hoveredPlanet = hoveredPlanet; // Store object instead of index
    state.isSystemFrozen = !!hoveredPlanet;

    // Update cursor style
    document.body.style.cursor = hoveredPlanet ? 'pointer' : 'default';

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
    // Update tooltip content
    tooltip.querySelector('.tooltip-title').textContent = def.displayName;

    if (!def.hasData) {
        tooltip.querySelector('.tooltip-desc').textContent = "Empty Region";
        tooltip.querySelector('.tooltip-hint').textContent = "Click to Deploy Project";
        tooltip.querySelector('.tooltip-hint').style.display = 'block';
    } else {
        tooltip.querySelector('.tooltip-desc').textContent = def.description;
        tooltip.querySelector('.tooltip-hint').textContent = "Click to explore"; // Reset to default
        tooltip.querySelector('.tooltip-hint').style.display = 'block';
    }

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
    const projectData = def.projectData;
    const tooltip = state.tooltipEl;

    state.isPopupLocked = true;
    state.lockedObject = targetObject;
    state.isSystemFrozen = true;

    // Update tooltip for locked state with backend metadata
    // Customize popup based on object type
    if (targetObject.userData.isMoon) {
        // MOON: Full details
        tooltip.querySelector('.tooltip-title').textContent = def.displayName;
        const statusEmoji = projectData?.status === 'live' ? '🟢' :
            projectData?.status === 'paused' ? '⏸️' :
                projectData?.status === 'archived' ? '📦' : '⚪';
        const deployType = projectData?.deployment_type || 'unknown';
        const autoDeploy = projectData?.auto_deploy ? '✓ Auto-deploy' : '✗ Manual deploy';

        tooltip.querySelector('.tooltip-desc').innerHTML = `
            <div style="margin-bottom: 8px;">${def.description}</div>
            <div style="font-size: 11px; opacity: 0.6; display: flex; flex-direction: column; gap: 4px;">
                <span>${statusEmoji} ${projectData?.status || 'Status unknown'}</span>
                <span>🚀 ${deployType}</span>
                <span>${autoDeploy}</span>
            </div>
        `;
        tooltip.querySelector('.tooltip-hint').style.display = 'none';
        tooltip.querySelector('.tooltip-close').style.display = 'block';

        // Show action buttons
        const actionsEl = tooltip.querySelector('.tooltip-actions');
        actionsEl.style.display = 'flex';
        actionsEl.innerHTML = getPlanetActions(def, projectData, true); // true = isMoon

    } else {
        // PLANET: Name Only + Click to Navigate
        // Emphasize the name, possibly minimal description
        tooltip.querySelector('.tooltip-title').innerHTML = `
            <a href="${getProjectUrlWithToken(projectData?.url || '#')}" 
               target="_blank" rel="noopener noreferrer"
               style="color: inherit; text-decoration: none; border-bottom: 1px dashed rgba(255,255,255,0.5); padding-bottom: 2px;">
               ${def.displayName} ↗
            </a>
        `;

        // Hide details for planet, only keep the name which is now a link
        // We might want to keep the description if it's the planet's description,
        // but user asked for "show the project name only".
        // Let's keep it minimal.
        tooltip.querySelector('.tooltip-desc').innerHTML = ''; // Clear description
        tooltip.querySelector('.tooltip-hint').style.display = 'block';
        tooltip.querySelector('.tooltip-hint').textContent = 'Click name to open';
        tooltip.querySelector('.tooltip-close').style.display = 'block';

        // No extra actions for planet, the name is the action
        const actionsEl = tooltip.querySelector('.tooltip-actions');
        actionsEl.style.display = 'none';
        actionsEl.innerHTML = '';
    }
    tooltip.querySelector('.tooltip-close').style.display = 'block';

    // Show action buttons based on backend data
    const actionsEl = tooltip.querySelector('.tooltip-actions');
    actionsEl.style.display = 'flex';
    actionsEl.innerHTML = getPlanetActions(def, projectData);

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

function getPlanetActions(def, projectData) {
    // Define action buttons based on backend project data
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
        text-decoration: none;
        display: block;
    `;

    // If we have a URL from backend, create a redirect button
    if (projectData?.url) {
        const token = localStorage.getItem('auth_token');
        let url = projectData.url;
        if (token) {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}auth_token=${encodeURIComponent(token)}`;
        }

        return `
            <a href="${url}" style="${btnStyle}" target="_blank" rel="noopener noreferrer">
                🚀 Open Project
            </a>
        `;
    }

    // Fallback for projects without URL
    return `<button style="${btnStyle}">ℹ️ Learn More</button>`;
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

    // Animate Asteroids
    if (state.asteroids) {
        state.asteroids.forEach(asteroid => {
            // Orbit around Sun (Simple rotation for now, could be improved)
            const data = asteroid.userData;

            // Only update orbit angle if system is not frozen
            if (!state.isSystemFrozen) {
                data.angle += data.orbitSpeed * 0.01;
            }

            // Update position
            const r = data.def.orbit;
            asteroid.position.x = Math.cos(data.angle) * r;
            asteroid.position.y = Math.sin(data.angle) * r;

            // Self rotation
            if (!state.isSystemFrozen) {
                asteroid.rotation.x += data.rotSpeed.x;
                asteroid.rotation.y += data.rotSpeed.y;
            }

            // Visual feedback on hover/active
            const isActive = (asteroid === state.hoveredPlanet || asteroid === state.lockedObject);
            const targetIntensity = isActive ? 0.5 : (data.def.hasData ? 0.3 : 0);
            asteroid.material.emissiveIntensity = lerp(asteroid.material.emissiveIntensity, targetIntensity, 0.1);
        });
    }

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
// DATA TRANSFORMATION & RESOLUTION
// ============================================

function getProjectUrlWithToken(baseUrl) {
    const token = localStorage.getItem('auth_token');
    if (token && baseUrl !== '#') {
        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}auth_token=${encodeURIComponent(token)}`;
    }
    return baseUrl;
}

function resolveSolarSystem(projects) {
    // 1. Initialize all planets as skeletons (greyed out)
    const planetMap = {};
    const planetOrder = [];

    PLANET_NAMES.forEach((name, index) => {
        const planet = createLogicalPlanet(name, index);
        planetMap[name] = planet;
        planetOrder.push(planet);
    });

    if (!projects || projects.length === 0) return planetOrder;

    // 2. Hydrate with project data
    projects.forEach(project => {
        const planetName = project.planet ? project.planet.toLowerCase() : null;
        if (!planetName || !planetMap[planetName]) return;

        const planetObj = planetMap[planetName];

        if (project.moon_index == null) {
            // It's the planet itself
            attachProjectToPlanet(planetObj, project);
        } else {
            // It's a moon
            // Shared Data Model: Attach to Planet (for redirect) AND Moon (for details)
            attachProjectToPlanet(planetObj, project);
            attachMoonToPlanet(planetObj, project, project.moon_index);
        }
    });

    // 3. Hydrate Asteroids
    hydrateAsteroids(projects);

    return planetOrder;
}

function createAsteroidBelt() {
    state.asteroids = [];
    const asteroidGroup = new THREE.Group();
    asteroidGroup.name = 'asteroidBelt';

    // Create base asteroids
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        // Random position in belt
        const angle = (i / ASTEROID_COUNT) * Math.PI * 2 + (Math.random() * 0.5);
        const radius = ASTEROID_BELT_RADIUS_MIN + Math.random() * (ASTEROID_BELT_RADIUS_MAX - ASTEROID_BELT_RADIUS_MIN);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = 0.15 + Math.random() * 0.2;

        // Irregular shape using Icosahedron
        const geometry = new THREE.IcosahedronGeometry(size, 0);

        const material = new THREE.MeshStandardMaterial({
            color: 0x888888, // Grey by default
            roughness: 0.9,
            metalness: 0.2,
            flatShading: true
        });

        const asteroid = new THREE.Mesh(geometry, material);
        asteroid.position.set(x, y, (Math.random() - 0.5) * 1.5);

        // Random rotation
        asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        asteroid.userData = {
            index: i,
            isAsteroid: true,
            def: {
                name: 'asteroid-belt', // Shared "planet" name
                displayName: ASTEROID_NAMES[i % ASTEROID_NAMES.length] || `Asteroid-${i + 1}`,
                description: 'Unchartered Rock',
                index: i + 100, // Offset index
                locationType: 'asteroid',
                orbit: radius,
                hasData: false, // Default inactive
                size: size
            },
            // Physics
            angle: angle,
            orbitSpeed: 0.05 + Math.random() * 0.02,
            rotSpeed: { x: (Math.random() - 0.5) * 0.05, y: (Math.random() - 0.5) * 0.05 }
        };

        state.asteroids.push(asteroid);
        asteroidGroup.add(asteroid);
    }

    return asteroidGroup;
}

function hydrateAsteroids(projects) {
    // Filter projects assigned to asteroid belt
    const asteroidProjects = projects.filter(p => p.planet && p.planet.toLowerCase() === 'asteroid-belt');

    // Map them to asteroids
    asteroidProjects.forEach((proj, i) => {
        // Use moon_index if provided, otherwise sequential
        const targetIndex = proj.moon_index !== null ? proj.moon_index : i;

        // Wrap around if we run out of asteroids (shouldn't happen with 50)
        const asteroid = state.asteroids[targetIndex % state.asteroids.length];

        if (asteroid) {
            const def = asteroid.userData.def;
            const originalName = def.displayName; // Save original name

            def.hasData = true;
            def.projectData = proj;
            def.displayName = proj.name; // Use project name
            def.description = `${proj.status} • On ${originalName}`;

            // Visual feedback for active asteroid
            asteroid.material.color.setHex(0xa5b4fc); // Light blueish
            asteroid.material.emissive.setHex(0x4f46e5);
            asteroid.material.emissiveIntensity = 0.3;

            console.log(`[SolarSystem] Mapped project ${proj.name} to Asteroid-${targetIndex}`);
        }
    });
}

function createLogicalPlanet(name, index) {
    // Generate consistent color from name
    const colorIdx = Math.abs(stringHash(name)) % PLANET_PALETTE.length;
    const baseColor = PLANET_PALETTE[colorIdx];

    const planet = {
        name: name,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        index: index,

        // Base Color (Stored for later hydration)
        baseHue: baseColor.hue,
        baseSat: baseColor.sat,
        baseLum: baseColor.lum,

        // Visual props (Greyed Out Default)
        hue: baseColor.hue,
        sat: 0,   // Desaturated
        lum: 0.2, // Dim

        // Orbit Rules: baseRadius + index * spacing
        orbit: 4.0 + (index * 2.5),
        size: 0.35 + (index % 3 * 0.05), // Slight variation
        speed: 1.0 / (1 + index * 0.2),  // Farther = slower

        projectData: null, // Populated if moon_index === null project exists
        moons: [],         // Populated dynamically

        // State flags
        hasData: false, // Default: No data -> No interaction
        // New flags for logic
        isArchived: false,
        isPaused: false,
        isDashed: false,
        isThickOrbit: true // Default distinct orbit line even if empty
    };

    // Pre-populate Moons (Placeholder Skeletons)
    const planetNameKey = name.toLowerCase();
    const moonNames = MOON_NAMES[planetNameKey] || [];

    moonNames.forEach((moonName, moonIdx) => {
        // Default "Greyed Out" Moon
        const moonColor = MOON_COLORS[moonIdx % MOON_COLORS.length];

        planet.moons.push({
            name: `moon-${moonIdx}`, // Placeholder ID
            displayName: moonName,
            index: moonIdx,

            // Base Visuals (Stored for hydration)
            baseHue: moonColor.hue,
            baseSat: moonColor.sat,
            baseLum: moonColor.lum,

            // Active Visuals (Greyed Out)
            hue: moonColor.hue,
            sat: 0.0, // Fully grey
            lum: 0.4, // Visible but dimmed

            // Physics
            size: 0.08 + (moonIdx * 0.02),
            orbit: 0.6 + (moonIdx * 0.35),
            speed: 1.5 - (moonIdx * 0.1),

            projectData: null,
            isMoon: true,
            hasData: false // Non-interactive
        });
    });

    return planet;
}

function attachProjectToPlanet(planet, project) {
    planet.projectData = project;
    planet.displayName = project.name; // Use project name for display
    planet.hasData = true;

    // Restore Base Color (Hydration)
    planet.hue = planet.baseHue;
    planet.sat = planet.baseSat;
    planet.lum = planet.baseLum;

    // Dynamic Visual state mapping
    if (project.status === 'archived') {
        planet.lum *= 0.5;
        planet.sat *= 0.2;
        planet.isArchived = true;
    }

    if (project.status === 'paused') {
        planet.isPaused = true;
    }

    if (project.auto_deploy === false) {
        planet.isDashed = true;
    }

    if (project.deployment_type === 'self_hosted') {
        planet.isThickOrbit = true;
    }

    if (project.deployment_type === 'static') {
        planet.speed = 0;
    }

    console.log(`[SolarSystem] Dynamic: Created/Updated planet ${planet.name} for project ${project.name}`);
}

function attachMoonToPlanet(planet, project, moonIndex) {
    // Determine moon color
    const color = MOON_COLORS[moonIndex % MOON_COLORS.length];

    // Logic for visuals
    let hue = color.hue;
    let sat = color.sat;
    let lum = color.lum;
    let speed = 1.5 - (moonIndex * 0.1);

    if (project && project.status === 'archived') {
        lum *= 0.5;
        sat *= 0.2;
    }
    if (project && project.deployment_type === 'static') {
        speed = 0;
    }

    // Find existing placeholder moon OR create new one (if index > placeholders)
    let moon = planet.moons.find(m => m.index === moonIndex);

    if (!moon) {
        // Create new if not found (unexpected with predefined names, but safe fallback)
        moon = {
            index: moonIndex,
            moons: [], // Moons don't have moons in this model, but keep structure consistent? No.
            isMoon: true
        };
        planet.moons.push(moon);
    }

    // HYDRATE with Project Data
    moon.name = project ? project.slug : `moon-${moonIndex}`;
    // keep displayName from placeholder (IRL name) unless explicitly overriding? 
    // Actually, we want IRL name. Placeholder already has it. 
    // IF we want to show project name in some cases, we could logic check. 
    // But requirement was IRL names.
    // Check if we need to set displayName if it wasn't pre-populated (e.g. index beyond known moons)
    if (!moon.displayName || moon.displayName.startsWith('Moon ')) {
        const planetNameKey = planet.name.toLowerCase();
        const irlNames = MOON_NAMES[planetNameKey] || [];
        moon.displayName = irlNames[moonIndex] || (project ? project.name : `Moon ${moonIndex}`);
    }

    // Restore Colors
    moon.hue = moon.baseHue || hue; // Use baseHue if available (from placeholder)
    moon.sat = moon.baseSat || sat;
    moon.lum = moon.baseLum || lum;

    // Update Stats
    moon.projectData = project;
    moon.hasData = !!project;
    moon.size = 0.08 + (moonIndex * 0.02); // Ensure consistent
    moon.orbit = 0.6 + (moonIndex * 0.35);
    moon.speed = speed;

    console.log(`[SolarSystem] Dynamic: Hydrated moon ${moon.displayName} on ${planet.name}`);
}

function stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

// ============================================
// LIFECYCLE
// ============================================
async function init() {
    if (state.isInitialized) return;

    // 1. Force Sun Mode immediately to hide Dashboard (Prevent "Double Page" visual)
    try {
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) dashboard.classList.add('sun-mode');
    } catch (e) {
        console.error('[SolarSystem] Failed to apply sun-mode:', e);
    }

    try {
        state.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        state.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Fetch projects from API before initializing scene
        const projects = await fetchControlProjects();
        state.projects = projects || [];
        PLANET_DEFS = resolveSolarSystem(state.projects);

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

        // (Redundant check, already done at start)
        // document.querySelector('.dashboard')?.classList.add('sun-mode');

        animate(0);
        state.isInitialized = true;
        console.log('[SolarSystem v3.0] Initialized', { theme: state.theme.current, reducedMotion: state.isReducedMotion, planets: PLANET_DEFS.length });
    } catch (err) {
        console.error('[SolarSystem] Init failed:', err);
    }
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
    // Check planets and their moons
    state.planets.forEach((planet) => {
        // Check planet
        const dist = Math.sqrt(Math.pow(planet.position.x - worldX, 2) + Math.pow(planet.position.y - worldY, 2));
        if (dist < planet.userData.def.size + 0.8) {
            // Hit detected - regardless of data
            // If already hit something (like a moon), maybe planet takes precedence if closer? 
            // But moon logic typically runs after and overrides if hit.
            // Let's stick to: if hit planet, set clickedObject. 
            clickedObject = planet;
        }

        // Check moons (Always check moons, they sit "above" planets or share space)
        if (planet.userData.moonPivots) {
            planet.userData.moonPivots.forEach(pivot => {
                const moon = pivot.children[0];
                const moonPos = new THREE.Vector3();
                moon.getWorldPosition(moonPos);
                const d = Math.sqrt(Math.pow(moonPos.x - worldX, 2) + Math.pow(moonPos.y - worldY, 2));
                if (d < moon.userData.def.size + 0.5) {
                    clickedObject = moon; // Moon takes priority (smaller target)
                }
            });
        }
    });

    // Check asteroids
    if (state.asteroids) {
        state.asteroids.forEach(asteroid => {
            const dist = Math.sqrt(Math.pow(asteroid.position.x - worldX, 2) + Math.pow(asteroid.position.y - worldY, 2));
            if (dist < asteroid.userData.def.size + 0.3) {
                clickedObject = asteroid;
            }
        });
    }

    if (clickedObject) {
        // Lock popup on this object (only if it has data)
        const def = clickedObject.userData.def;

        if (def && !def.hasData) {
            console.log('[SolarSystem] Opening add project modal for:', def.displayName);

            // Determine planet name and moon index
            let planetName = def.name;
            let moonIndex = null;

            if (clickedObject.userData.isMoon) {
                // Access parent planet from the mesh userData
                const parentPlanet = clickedObject.userData.parentPlanet;
                if (parentPlanet) {
                    planetName = parentPlanet.userData.def.name;
                    moonIndex = def.index;
                }
            } else if (clickedObject.userData.isAsteroid) {
                planetName = 'asteroid-belt';
                moonIndex = clickedObject.userData.index;
            }

            openAddProjectModal(planetName, moonIndex, def.displayName);
            return;
        }

        lockPopup(clickedObject);
        console.log('[SolarSystem] Object clicked:', def.displayName);
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

// ============================================
// ADD PROJECT MODAL
// ============================================
function createAddProjectModal() {
    if (document.getElementById('add-project-modal')) return;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'add-project-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(backdrop);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'add-project-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: #111;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 24px;
        width: 90%;
        max-width: 400px;
        z-index: 10001;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        font-family: 'Inter', sans-serif;
        color: #fff;
    `;

    modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="margin:0; font-size:18px; font-weight:600;">Deploy Project</h3>
            <button class="modal-close" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer;">&times;</button>
        </div>
        <form id="add-project-form" style="display:flex; flex-direction:column; gap:16px;">
            <div>
                <label style="display:block; font-size:12px; margin-bottom:6px; opacity:0.7;">Planet / Location</label>
                <input type="text" name="location_display" readonly style="width:100%; background:#222; border:1px solid #333; padding:10px; border-radius:6px; color:#aaa; font-family:inherit;">
            </div>
            
            <div>
                <label style="display:block; font-size:12px; margin-bottom:6px; opacity:0.7;">Project Name</label>
                <input type="text" name="name" required placeholder="e.g. Portfolio v2" style="width:100%; background:#000; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; font-family:inherit;">
            </div>

            <div>
                <label style="display:block; font-size:12px; margin-bottom:6px; opacity:0.7;">Project URL</label>
                <input type="url" name="url" required placeholder="https://..." style="width:100%; background:#000; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; font-family:inherit;">
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div>
                    <label style="display:block; font-size:12px; margin-bottom:6px; opacity:0.7;">Deployment</label>
                    <select name="deployment_type" style="width:100%; background:#000; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; font-family:inherit;">
                        <option value="static">Static</option>
                        <option value="vercel">Vercel</option>
                        <option value="cloudflare">Cloudflare</option>
                        <option value="self_hosted">Self Hosted</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:12px; margin-bottom:6px; opacity:0.7;">Status</label>
                    <select name="status" style="width:100%; background:#000; border:1px solid #333; padding:10px; border-radius:6px; color:#fff; font-family:inherit;">
                        <option value="live">Live</option>
                        <option value="paused">Paused</option>
                        <option value="archived">Archived</option>
                        <option value="building">Building</option>
                    </select>
                </div>
            </div>

            <input type="hidden" name="planet">
            <input type="hidden" name="moon_index">

            <button type="submit" style="margin-top:10px; background:#4f46e5; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:500; transition:background 0.2s;">
                Initialize Deployment
            </button>
        </form>
    `;
    document.body.appendChild(modal);

    const close = () => {
        modal.classList.remove('active');
        backdrop.classList.remove('active');
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
        backdrop.style.opacity = '0';
        backdrop.style.pointerEvents = 'none';
    };

    modal.querySelector('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);

    // Form submission
    const form = modal.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Deploying...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            url: formData.get('url'),
            planet: formData.get('planet'),
            moon_index: formData.get('moon_index') ? parseInt(formData.get('moon_index')) : null,
            deployment_type: formData.get('deployment_type'),
            status: formData.get('status')
        };

        try {
            const res = await fetch('https://api.avlokai.com/control/projects/add_new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to add project');

            const result = await res.json();
            console.log('Project added:', result);

            // Reload page to refresh system
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('Error adding project: ' + err.message);
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    state.addProjectModal = { modal, backdrop, close };
}

function openAddProjectModal(planetName, moonIndex, displayName) {
    if (!state.addProjectModal) createAddProjectModal();

    const { modal, backdrop } = state.addProjectModal;
    const form = modal.querySelector('form');

    // Reset form
    form.reset();

    // Fill hidden fields
    form.querySelector('[name="planet"]').value = planetName;
    if (moonIndex !== null) {
        form.querySelector('[name="moon_index"]').value = moonIndex;
    } else {
        form.querySelector('[name="moon_index"]').value = '';
    }

    form.querySelector('[name="location_display"]').value = displayName;

    // Show
    modal.classList.add('active');
    backdrop.classList.add('active');

    // Animate in
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.transform = 'translate(-50%, -50%) scale(1)';
        backdrop.style.opacity = '1';
        backdrop.style.pointerEvents = 'auto';
    });
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
