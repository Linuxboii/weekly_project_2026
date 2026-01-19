import * as THREE from 'three';
import { PLANET_DEFS } from './planetData.js';

export class SolarSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Scene Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.PointLight(0xffaa00, 3, 300);
        this.sunLight.position.set(0, 0, 0);
        this.scene.add(this.sunLight);

        // State
        this.planets = [];
        this.activePlanetName = null;
        this.activePlanetIndex = -1;
        this.isPaused = false;

        // New Advanced State
        this.timeScale = 1.0;
        this.isLocked = false;
        this.lockedPlanet = null;
        this.comets = [];
        this.lastDragPosition = null;

        // Camera Control State
        this.targetRotationY = 0;
        this.targetRotationX = 0;
        this.currentRotationY = 0;
        this.currentRotationX = 0;
        this.targetZoom = 40;
        this.currentZoom = 40;

        // Group to hold everything
        this.solarSystemGroup = new THREE.Group();
        this.scene.add(this.solarSystemGroup);

        // Popup Container
        this.popupContainer = document.createElement('div');
        this.popupContainer.id = 'solar-system-popups';
        this.popupContainer.style.position = 'absolute';
        this.popupContainer.style.top = '0';
        this.popupContainer.style.left = '0';
        this.popupContainer.style.width = '100%';
        this.popupContainer.style.height = '100%';
        this.popupContainer.style.pointerEvents = 'none';
        this.container.appendChild(this.popupContainer);

        this.init();
        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    init() {
        this.createStars();
        this.createSun();
        this.createPlanets();

        this.camera.position.z = this.currentZoom;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0);
    }

    // --- Advanced Interaction Methods ---

    selectNextPlanet() {
        if (this.planets.length === 0) return;
        this.isLocked = false;
        this.activePlanetIndex = (this.activePlanetIndex + 1) % this.planets.length;
        this._selectPlanetByIndex(this.activePlanetIndex);
    }

    selectPreviousPlanet() {
        if (this.planets.length === 0) return;
        this.isLocked = false;
        this.activePlanetIndex = (this.activePlanetIndex - 1 + this.planets.length) % this.planets.length;
        this._selectPlanetByIndex(this.activePlanetIndex);
    }

    _selectPlanetByIndex(index) {
        const planet = this.planets[index];
        this.isPaused = true;
        this.showPopup(planet);
    }

    setTimeScale(scale) {
        this.timeScale = scale;
        // Visual feedback?
    }

    setZoom(scaleFactor) {
        // scale=0.5 -> Zoom IN (smaller distance)
        // scale=2.0 -> Zoom OUT (larger distance)
        // But the gesture sends 0.5 (far) to >1 (close). 
        // Let's invert logic: 
        // If gesture > 1 (spread) -> Zoom IN (decrease distance)
        const baseDistance = 40;
        const newDist = baseDistance / scaleFactor;
        this.targetZoom = Math.max(10, Math.min(120, newDist));
    }

    toggleLock() {
        if (this.isLocked) {
            this.isLocked = false;
            this.lockedPlanet = null;
            // Reset planet rotation targets
            this.targetPlanetRotationY = 0;
            this.targetPlanetRotationX = 0;
            this.currentPlanetRotationY = 0;
            this.currentPlanetRotationX = 0;
        } else {
            // Lock to current active or default to Earth
            if (this.activePlanetIndex !== -1) {
                this.lockedPlanet = this.planets[this.activePlanetIndex];
                this.isLocked = true;
            } else {
                if (this.planets.length > 2) {
                    this.activePlanetIndex = 2; // Earth
                    this.lockedPlanet = this.planets[2];
                    this.isLocked = true;
                    this._selectPlanetByIndex(2);
                }
            }
        }
    }

    handleDrag(deltaX, deltaY) {
        if (this.isLocked && this.lockedPlanet) {
            // When locked to a planet, rotate that planet (and its moons via the pivot)
            if (!this.targetPlanetRotationY) this.targetPlanetRotationY = 0;
            if (!this.targetPlanetRotationX) this.targetPlanetRotationX = 0;

            // Inverted left/right: -= for Y (left/right), += for X (up/down)
            this.targetPlanetRotationY -= deltaX * 0.08;
            this.targetPlanetRotationX += deltaY * 0.08;
            // Clamp X rotation
            this.targetPlanetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetPlanetRotationX));
        } else {
            // When unlocked, rotate the entire solar system
            // Inverted left/right: -= for Y rotation
            this.targetRotationY -= deltaX * 0.08;
            this.targetRotationX += deltaY * 0.08;
            // Clamp X rotation to prevent flipping
            this.targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotationX));
        }
    }

    spawnComet() {
        const cometGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const cometMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const comet = new THREE.Mesh(cometGeo, cometMat);

        // Random start pos
        const startX = (Math.random() - 0.5) * 100;
        const startY = (Math.random() - 0.5) * 50;
        const startZ = -100;

        comet.position.set(startX, startY, startZ);

        // Trail
        const trailGeo = new THREE.BufferGeometry();
        const trailMat = new THREE.LineBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 });
        const trail = new THREE.Line(trailGeo, trailMat);

        const velocity = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), 1 + Math.random());

        this.scene.add(comet);
        this.scene.add(trail);

        this.comets.push({ mesh: comet, trail: trail, velocity: velocity, life: 200, positions: [] });
    }

    resumeOrbit() {
        this.isPaused = false;
        this.isLocked = false;
        this.lockedPlanet = null;
        this.timeScale = 1.0;
        this.hidePopups();
        this.activePlanetIndex = -1;
        // Reset planet rotation targets
        this.targetPlanetRotationY = 0;
        this.targetPlanetRotationX = 0;
        this.currentPlanetRotationY = 0;
        this.currentPlanetRotationX = 0;
        this.reset();
    }

    reset() {
        this.targetRotationY = 0;
        this.targetRotationX = 0;
        this.targetZoom = 40;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // 0. Update Star Twinkling/Shimmer
        if (this.starMaterial) {
            this.starMaterial.uniforms.time.value += 0.016; // ~60fps
            this.starMaterial.uniforms.cameraPos.value.copy(this.camera.position);
        }

        // 1. Planet Orbits
        if (!this.isPaused) {
            this.planets.forEach(p => {
                p.pivot.rotation.y += p.pivot.userData.speed * this.timeScale;
                p.moons.forEach(m => {
                    m.rotation.y += m.userData.speed * this.timeScale;
                });
            });
        }

        // 2. Comets
        for (let i = this.comets.length - 1; i >= 0; i--) {
            const c = this.comets[i];
            c.mesh.position.add(c.velocity);
            c.life--;

            c.positions.push(c.mesh.position.clone());
            if (c.positions.length > 20) c.positions.shift();

            if (c.positions.length > 1) {
                const points = c.positions;
                c.trail.geometry.setFromPoints(points);
            }

            if (c.life <= 0) {
                this.scene.remove(c.mesh);
                this.scene.remove(c.trail);
                this.comets.splice(i, 1);
            }
        }

        // 3. Camera Logic
        let targetLookAt = new THREE.Vector3(0, 0, 0);
        let targetPos = null;

        if (this.isLocked && this.lockedPlanet) {
            const vector = new THREE.Vector3();
            this.lockedPlanet.mesh.getWorldPosition(vector);
            targetLookAt.copy(vector);

            const offset = 10 + this.lockedPlanet.data.size * 5;
            targetPos = new THREE.Vector3(vector.x, vector.y + 5, vector.z + offset);

            // Smooth planet rotation when dragging while locked
            if (this.targetPlanetRotationY !== undefined) {
                if (!this.currentPlanetRotationY) this.currentPlanetRotationY = 0;
                if (!this.currentPlanetRotationX) this.currentPlanetRotationX = 0;

                // Smooth interpolation for fluid feel
                this.currentPlanetRotationY += (this.targetPlanetRotationY - this.currentPlanetRotationY) * 0.08;
                this.currentPlanetRotationX += (this.targetPlanetRotationX - this.currentPlanetRotationX) * 0.08;

                // Apply to the planet group (affects planet + moons)
                this.lockedPlanet.group.rotation.y = this.currentPlanetRotationY;
                this.lockedPlanet.group.rotation.x = this.currentPlanetRotationX;
            }

            this.updatePopupPosition(this.lockedPlanet);

        } else if (this.isPaused && this.activePlanetIndex !== -1) {
            const planet = this.planets[this.activePlanetIndex];
            const vector = new THREE.Vector3();
            planet.mesh.getWorldPosition(vector);
            targetLookAt.copy(vector);

            const offset = 8 + planet.data.size * 5;
            targetPos = new THREE.Vector3(vector.x, vector.y + 2, vector.z + offset);
            this.updatePopupPosition(planet);
        }

        if (targetPos) {
            this.camera.position.lerp(targetPos, 0.05);
            this.camera.lookAt(targetLookAt);
        } else {
            // Normal Orbit
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
            this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;

            this.solarSystemGroup.rotation.y = this.currentRotationY;
            this.solarSystemGroup.rotation.x = this.currentRotationX;

            this.currentZoom += (this.targetZoom - this.currentZoom) * 0.05;
            this.camera.position.z = this.currentZoom;
            this.camera.lookAt(0, 0, 0);

            this.updatePopups();
        }

        this.renderer.render(this.scene, this.camera);
    }

    // --- Creations ---

    createStars() {
        // Create circular star texture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Draw a soft circular glow
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const starTexture = new THREE.CanvasTexture(canvas);

        // Create star geometry with positions and custom attributes
        const starCount = 4000;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const sizes = [];
        const twinkleSpeeds = [];
        const baseOpacities = [];

        for (let i = 0; i < starCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 500,
                (Math.random() - 0.5) * 500,
                (Math.random() - 0.5) * 500
            );
            // Varying sizes for depth
            sizes.push(0.3 + Math.random() * 1.2);
            // Random twinkle speed
            twinkleSpeeds.push(0.5 + Math.random() * 2);
            // Base opacity
            baseOpacities.push(0.4 + Math.random() * 0.6);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('twinkleSpeed', new THREE.Float32BufferAttribute(twinkleSpeeds, 1));
        geometry.setAttribute('baseOpacity', new THREE.Float32BufferAttribute(baseOpacities, 1));

        // Custom shader for twinkling and shimmer
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                starTexture: { value: starTexture },
                cameraPos: { value: new THREE.Vector3() }
            },
            vertexShader: `
                attribute float size;
                attribute float twinkleSpeed;
                attribute float baseOpacity;
                varying float vOpacity;
                varying float vTwinkle;
                uniform float time;
                uniform vec3 cameraPos;
                
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Distance to camera for shimmer effect
                    float dist = length(position - cameraPos);
                    float shimmer = smoothstep(50.0, 10.0, dist) * 0.5;
                    
                    // Twinkling based on time and position
                    float twinkle = sin(time * twinkleSpeed + position.x * 0.1 + position.y * 0.1) * 0.5 + 0.5;
                    vTwinkle = twinkle;
                    vOpacity = baseOpacity * (0.5 + twinkle * 0.5) + shimmer;
                    
                    // Size variation with distance
                    gl_PointSize = size * (200.0 / -mvPosition.z) * (0.8 + twinkle * 0.4);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D starTexture;
                varying float vOpacity;
                varying float vTwinkle;
                
                void main() {
                    vec4 texColor = texture2D(starTexture, gl_PointCoord);
                    
                    // Add slight color variation based on twinkle
                    vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 1.0, 0.9), vTwinkle);
                    
                    gl_FragColor = vec4(color, texColor.a * vOpacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.stars = new THREE.Points(geometry, material);
        this.starMaterial = material;
        this.scene.add(this.stars);
    }

    createSun() {
        const geometry = new THREE.SphereGeometry(1.5, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffddaa,
            emissive: 0xffaa00,
            emissiveIntensity: 2
        });
        const sun = new THREE.Mesh(geometry, material);

        // Glow
        const glowGeo = new THREE.SphereGeometry(2.5, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        sun.add(glow);

        // Add Sun directly to SCENE, not the group, so it doesn't rotate with the planets
        this.scene.add(sun);
    }

    createPlanets() {
        PLANET_DEFS.forEach((def, index) => {
            // Orbit Ring (Visual)
            const orbitGeo = new THREE.RingGeometry(def.orbit - 0.05, def.orbit + 0.05, 128);
            const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.08 });
            const orbit = new THREE.Mesh(orbitGeo, orbitMat);
            orbit.rotation.x = Math.PI / 2;
            this.solarSystemGroup.add(orbit);

            // Pivot for Orbit Animation
            const pivot = new THREE.Group();
            // Stagger start angles
            pivot.rotation.y = index * 0.8;
            pivot.userData = { speed: def.speed * 0.005 };
            this.solarSystemGroup.add(pivot);

            // Planet Group (holds mesh + satellites)
            const planetGroup = new THREE.Group();
            planetGroup.position.x = def.orbit;
            pivot.add(planetGroup);

            // Colors
            const color = new THREE.Color().setHSL(def.hue, def.sat, def.lum);

            // Planet Mesh
            const geometry = new THREE.SphereGeometry(def.size, 64, 64);
            const material = new THREE.MeshPhysicalMaterial({
                color: color,
                roughness: def.roughness,
                metalness: def.metalness,
                clearcoat: def.name === 'earth' ? 0.2 : 0,
                clearcoatRoughness: 0.1
            });
            const planetMesh = new THREE.Mesh(geometry, material);
            planetGroup.add(planetMesh);

            // Atmosphere
            if (def.atmosphere) {
                const atmoGeo = new THREE.SphereGeometry(def.size * 1.2, 32, 32);
                const atmoMat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0.2, 0.4, 0.8),
                    transparent: true,
                    opacity: 0.1,
                    side: THREE.BackSide,
                    depthWrite: false
                });
                planetGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
            }

            // Saturn Ring
            if (def.name === 'saturn') {
                const ringGeo = new THREE.RingGeometry(def.size * 1.4, def.size * 2.4, 64);
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0xcfa,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.4,
                    roughness: 0.8
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI * 0.35;
                planetGroup.add(ring);
            }

            // Moons
            const moons = [];
            if (def.moons) {
                def.moons.forEach(mDef => {
                    const moonColor = new THREE.Color().setHSL(mDef.hue, mDef.sat, mDef.lum);
                    const mGeo = new THREE.SphereGeometry(mDef.size, 16, 16);
                    const mMat = new THREE.MeshStandardMaterial({ color: moonColor, roughness: 0.8 });
                    const moon = new THREE.Mesh(mGeo, mMat);

                    // Moon Pivot for orbit
                    const mPivot = new THREE.Group();
                    mPivot.userData = { speed: mDef.speed * 0.01 };
                    mPivot.add(moon);
                    moon.position.x = mDef.orbit;
                    if (mDef.orbitY) moon.position.y = mDef.orbitY;

                    planetGroup.add(mPivot);
                    moons.push(mPivot);
                });
            }

            // Store Reference
            this.planets.push({
                name: def.name,
                displayName: def.displayName,
                description: def.description,
                data: def,
                mesh: planetMesh,
                group: planetGroup, // Absolute world position comes from this's parent? No, tricky with transforms.
                pivot: pivot,
                moons: moons,
                popup: null // Will create DOM element on demand
            });
        });
    }

    updatePopups() {
        // Find closest planet to camera
        // Note: Camera positions are relative to world. Planets are in rotating groups.
        // We need world positions.

        let minDist = Infinity;
        let closestPlanet = null;

        this.planets.forEach(p => {
            // Get world position
            const worldPos = new THREE.Vector3();
            p.mesh.getWorldPosition(worldPos);

            const dist = this.camera.position.distanceTo(worldPos);

            if (dist < minDist) {
                minDist = dist;
                closestPlanet = p;
            }
        });

        // Threshold for popup: When zoomed in (distance < 25)
        // Original logic was "camera close to planet". 
        // Logic: if dist < 15 + planetSize*5

        const THRESHOLD = 15;

        if (minDist < THRESHOLD && closestPlanet) {
            this.showPopup(closestPlanet);
        } else {
            this.hidePopups();
        }
    }

    showPopup(planet) {
        if (this.activePlanetName === planet.name) {
            // Update position
            this.updatePopupPosition(planet);
            return;
        }

        // Hide old
        this.hidePopups();

        // Create new
        this.activePlanetName = planet.name;

        const popup = document.createElement('div');
        popup.className = 'planet-popup';
        popup.innerHTML = `
            <h3>${planet.displayName}</h3>
            <p>${planet.description}</p>
            <div class="stats">
                <span>Orbit: ${planet.data.orbit.toFixed(1)}</span>
                <span>Moons: ${planet.data.moons ? planet.data.moons.length : 0}</span>
            </div>
        `;

        this.popupContainer.appendChild(popup);
        planet.popup = popup;

        this.updatePopupPosition(planet);
    }

    hidePopups() {
        if (!this.activePlanetName) return;
        this.popupContainer.innerHTML = '';
        this.activePlanetName = null;
    }

    updatePopupPosition(planet) {
        if (!planet.popup) return;

        const worldPos = new THREE.Vector3();
        planet.mesh.getWorldPosition(worldPos);

        // Offset slightly above/right
        worldPos.y += planet.data.size + 1;

        // Project to 2D
        worldPos.project(this.camera);

        const x = (worldPos.x * .5 + .5) * this.container.clientWidth;
        const y = (worldPos.y * -.5 + .5) * this.container.clientHeight;

        planet.popup.style.transform = `translate(${x}px, ${y}px)`;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
