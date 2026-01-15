const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// Mouse tracking with velocity for trail effects
let mouse = {
    x: undefined,
    y: undefined,
    prevX: undefined,
    prevY: undefined,
    radius: 200,
    velocity: 0
};

let lastMouseMove = Date.now();
let isIdle = false;
let pulsePhase = 0;
let ripples = [];

window.addEventListener('mousemove', (e) => {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.x;
    mouse.y = e.y;

    // Calculate velocity
    if (mouse.prevX !== undefined) {
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        mouse.velocity = Math.sqrt(dx * dx + dy * dy);
    }

    lastMouseMove = Date.now();
    isIdle = false;
});

// Create ripple on click
window.addEventListener('click', (e) => {
    ripples.push({
        x: e.x,
        y: e.y,
        radius: 0,
        maxRadius: 300,
        opacity: 1,
        speed: 8
    });
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Theme detection
let isLightMode = document.body.getAttribute('data-theme') === 'light';

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
            isLightMode = document.body.getAttribute('data-theme') === 'light';
            updateParticleColors();
        }
    });
});
observer.observe(document.body, { attributes: true });

// Vibrant color palettes
const lightModeColors = [
    { h: 250, s: 90, l: 60 },  // Electric violet
    { h: 280, s: 85, l: 55 },  // Bright purple
    { h: 320, s: 80, l: 55 },  // Hot pink
    { h: 200, s: 95, l: 50 },  // Cyan blue
    { h: 170, s: 80, l: 45 }   // Teal
];

const darkModeColors = [
    { h: 220, s: 100, l: 70 }, // Bright blue
    { h: 280, s: 100, l: 75 }, // Neon purple
    { h: 320, s: 100, l: 70 }, // Neon pink
    { h: 180, s: 100, l: 60 }, // Cyan
    { h: 60, s: 100, l: 70 }   // Golden
];

function hslToString(h, s, l, a = 1) {
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function getRandomColor() {
    const palette = isLightMode ? lightModeColors : darkModeColors;
    return palette[Math.floor(Math.random() * palette.length)];
}

// Particle class with enhanced effects
class Particle {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = size;
        this.baseSize = size;

        const colorData = getRandomColor();
        this.hue = colorData.h;
        this.saturation = colorData.s;
        this.lightness = colorData.l;
        this.baseHue = this.hue;

        // Slow organic drift
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;

        // For smooth animations
        this.glowIntensity = 0;
        this.scale = 1;
    }

    draw() {
        // Dynamic glow based on cursor proximity
        const glowSize = 15 + this.glowIntensity * 25;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.scale, 0, Math.PI * 2);

        // Pulsing glow effect
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = hslToString(this.hue, this.saturation, this.lightness + 10, 0.8);

        // Gradient fill for depth
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * this.scale
        );
        gradient.addColorStop(0, hslToString(this.hue, this.saturation, this.lightness + 20, 1));
        gradient.addColorStop(0.5, hslToString(this.hue, this.saturation, this.lightness, 0.9));
        gradient.addColorStop(1, hslToString(this.hue, this.saturation, this.lightness - 10, 0.7));

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    update() {
        // Gentle organic drift
        this.baseX += this.vx;
        this.baseY += this.vy;

        // Soft bounce
        if (this.baseX < 0 || this.baseX > canvas.width) this.vx *= -1;
        if (this.baseY < 0 || this.baseY > canvas.height) this.vy *= -1;

        this.baseX = Math.max(0, Math.min(canvas.width, this.baseX));
        this.baseY = Math.max(0, Math.min(canvas.height, this.baseY));

        let targetX = this.baseX;
        let targetY = this.baseY;
        let targetScale = 1;
        let targetGlow = 0;

        if (mouse.x !== undefined && mouse.y !== undefined) {
            const dx = mouse.x - this.baseX;
            const dy = mouse.y - this.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const proximity = 1 - (distance / mouse.radius);
                const angle = Math.atan2(dy, dx);

                // Shift hue based on proximity (color wave effect)
                this.hue = this.baseHue + (proximity * 30 * Math.sin(pulsePhase));

                // Scale up particles near cursor
                targetScale = 1 + (proximity * 0.8);

                // Increase glow near cursor
                targetGlow = proximity;

                if (isIdle) {
                    // When idle: gentle push away with wave motion
                    const idleTime = Date.now() - lastMouseMove;
                    const waveFactor = Math.sin(idleTime / 500 + distance / 50) * 0.5 + 0.5;
                    const pushDistance = proximity * 50 * waveFactor;

                    targetX = this.baseX - Math.cos(angle) * pushDistance;
                    targetY = this.baseY - Math.sin(angle) * pushDistance;
                } else {
                    // When moving: smooth attraction with orbit effect
                    const orbitOffset = Math.sin(Date.now() / 1000 + this.baseX) * 10;
                    const attractDistance = proximity * 40;

                    targetX = this.baseX + Math.cos(angle) * attractDistance + Math.cos(angle + Math.PI / 2) * orbitOffset * proximity;
                    targetY = this.baseY + Math.sin(angle) * attractDistance + Math.sin(angle + Math.PI / 2) * orbitOffset * proximity;
                }
            } else {
                // Reset hue when far from cursor
                this.hue = this.baseHue;
            }
        }

        // Smooth easing
        const ease = 0.1;
        this.x += (targetX - this.x) * ease;
        this.y += (targetY - this.y) * ease;
        this.scale += (targetScale - this.scale) * ease;
        this.glowIntensity += (targetGlow - this.glowIntensity) * ease;

        this.draw();
    }
}

function updateParticleColors() {
    if (!particlesArray) return;
    particlesArray.forEach(p => {
        const colorData = getRandomColor();
        p.hue = colorData.h;
        p.saturation = colorData.s;
        p.lightness = colorData.l;
        p.baseHue = p.hue;
    });
}

let particlesArray = [];

function init() {
    particlesArray = [];

    // Moderate particle count for visual impact without clutter
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);

    for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 3.5 + 2;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        particlesArray.push(new Particle(x, y, size));
    }
}

function connect() {
    const maxDistance = 140;

    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const opacity = (1 - (distance / maxDistance)) * 0.5;

                // Gradient line between particles based on their colors
                const gradient = ctx.createLinearGradient(
                    particlesArray[a].x, particlesArray[a].y,
                    particlesArray[b].x, particlesArray[b].y
                );

                gradient.addColorStop(0, hslToString(
                    particlesArray[a].hue,
                    particlesArray[a].saturation * 0.7,
                    particlesArray[a].lightness,
                    opacity * particlesArray[a].glowIntensity + opacity * 0.3
                ));
                gradient.addColorStop(1, hslToString(
                    particlesArray[b].hue,
                    particlesArray[b].saturation * 0.7,
                    particlesArray[b].lightness,
                    opacity * particlesArray[b].glowIntensity + opacity * 0.3
                ));

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1 + (particlesArray[a].glowIntensity + particlesArray[b].glowIntensity) * 0.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function updateRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        // Draw ripple ring
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isLightMode
            ? `hsla(250, 90%, 60%, ${ripple.opacity * 0.6})`
            : `hsla(220, 100%, 70%, ${ripple.opacity * 0.6})`;
        ctx.lineWidth = 3 * ripple.opacity;
        ctx.stroke();

        // Inner glow
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = isLightMode
            ? `hsla(280, 85%, 55%, ${ripple.opacity * 0.3})`
            : `hsla(280, 100%, 75%, ${ripple.opacity * 0.3})`;
        ctx.lineWidth = 2 * ripple.opacity;
        ctx.stroke();

        // Push particles away from ripple
        particlesArray.forEach(p => {
            const dx = p.x - ripple.x;
            const dy = p.y - ripple.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (Math.abs(dist - ripple.radius) < 50) {
                const angle = Math.atan2(dy, dx);
                const force = (1 - Math.abs(dist - ripple.radius) / 50) * 3;
                p.x += Math.cos(angle) * force;
                p.y += Math.sin(angle) * force;
            }
        });

        // Update ripple
        ripple.radius += ripple.speed;
        ripple.opacity = 1 - (ripple.radius / ripple.maxRadius);

        // Remove finished ripples
        if (ripple.radius >= ripple.maxRadius) {
            ripples.splice(i, 1);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update pulse phase for color wave
    pulsePhase += 0.03;

    // Check idle state
    if (Date.now() - lastMouseMove > 1500) {
        isIdle = true;
    }

    // Update and draw ripples
    updateRipples();

    // Update particles
    particlesArray.forEach(particle => particle.update());

    // Draw connections
    connect();
}

// Export for script.js
window.disperse = function () {
    ripples.push({
        x: mouse.x || canvas.width / 2,
        y: mouse.y || canvas.height / 2,
        radius: 0,
        maxRadius: 400,
        opacity: 1,
        speed: 10
    });
};

window.spawnParticlesFromRect = function (rect) {
    const particleCount = 15;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < particleCount; i++) {
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;
        const size = Math.random() * 3 + 1.5;

        const particle = new Particle(x, y, size);

        // Burst outward
        const angle = Math.atan2(y - centerY, x - centerX);
        particle.vx = Math.cos(angle) * 2 + (Math.random() - 0.5);
        particle.vy = Math.sin(angle) * 2 + (Math.random() - 0.5);

        particlesArray.push(particle);
    }
};

init();
animate();
