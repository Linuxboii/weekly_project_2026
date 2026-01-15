const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }, 150);
});

// Mouse tracking with smooth interpolation
const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    targetX: canvas.width / 2,
    targetY: canvas.height / 2,
    radius: 200,
    isActive: false
};

// Cursor attachment state
let attachmentStartTime = null;
let isInCooldown = false;
let cooldownStartTime = null;
const ATTACHMENT_THRESHOLD = 5000; // 5 seconds to turn red
const COOLDOWN_DURATION = 20000;    // 20 seconds cooldown
const ATTACHED_RADIUS = 120;        // Nodes within this range are "attached"

// Cursor stillness tracking
let lastMouseMoveTime = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let isMouseStill = false;
const STILLNESS_THRESHOLD = 300; // 300ms without movement = still
const MOVEMENT_THRESHOLD = 5;    // 5px movement breaks stillness

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    const moved = Math.sqrt(dx * dx + dy * dy);

    // Only reset stillness if mouse actually moved significantly
    if (moved > MOVEMENT_THRESHOLD) {
        lastMouseMoveTime = Date.now();
        isMouseStill = false;
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isActive = true;
});

window.addEventListener('mouseout', () => {
    mouse.isActive = false;
    isMouseStill = false;
    attachmentStartTime = null;
});

// Touch event support for mobile
window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isActive = true;
    }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isActive = true;
    }
}, { passive: true });

window.addEventListener('touchend', () => {
    mouse.isActive = false;
    attachmentStartTime = null;
});

// Theme detection
let isLightMode = document.body.getAttribute('data-theme') === 'light';

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
            isLightMode = document.body.getAttribute('data-theme') === 'light';
        }
    });
});
observer.observe(document.body, { attributes: true });

// Helper function to interpolate colors
function lerpColor(r1, g1, b1, r2, g2, b2, t) {
    return {
        r: Math.round(r1 + (r2 - r1) * t),
        g: Math.round(g1 + (g2 - g1) * t),
        b: Math.round(b1 + (b2 - b1) * t)
    };
}

// Node class for DNA/Web structure
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = Math.random() * 2 + 1;

        // Organic floating motion
        this.floatSpeed = Math.random() * 0.002 + 0.001;
        this.floatRadius = Math.random() * 30 + 15;
        this.floatOffset = Math.random() * Math.PI * 2;

        // Mouse interaction
        this.displacement = { x: 0, y: 0 };

        // Attachment state
        this.isAttached = false;
        this.redIntensity = 0; // 0 to 1, how red it is
    }

    update(time, heatLevel, isRepelling) {
        // Smooth mouse tracking
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // Organic floating motion
        const floatX = Math.sin(time * this.floatSpeed + this.floatOffset) * this.floatRadius;
        const floatY = Math.cos(time * this.floatSpeed * 0.7 + this.floatOffset) * this.floatRadius;

        // Calculate distance to mouse
        const dx = mouse.x - this.baseX;
        const dy = mouse.y - this.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Check if attached (within attachment radius and cursor is still)
        this.isAttached = distance < ATTACHED_RADIUS && mouse.isActive && isMouseStill && !isRepelling;

        // Update red intensity based on heat level for attached nodes
        if (this.isAttached) {
            this.redIntensity = Math.min(1, this.redIntensity + (heatLevel - this.redIntensity) * 0.05);
        } else {
            this.redIntensity = Math.max(0, this.redIntensity - 0.02);
        }

        // Mouse interaction - push/pull effect
        if (isRepelling && distance < mouse.radius * 1.5) {
            // REPEL MODE: Push away from cursor
            const force = (mouse.radius * 1.5 - distance) / (mouse.radius * 1.5);
            const repelStrength = 80;

            this.displacement.x += (-Math.cos(angle) * force * repelStrength - this.displacement.x) * 0.08;
            this.displacement.y += (-Math.sin(angle) * force * repelStrength - this.displacement.y) * 0.08;
        } else if (distance < mouse.radius && mouse.isActive) {
            // NORMAL MODE: Attract to cursor (attach)
            const force = (mouse.radius - distance) / mouse.radius;

            // Attraction toward cursor - creates "attached strings" effect
            const attractStrength = this.isAttached ? 50 : 30;
            const waveOffset = Math.sin(distance * 0.02 - time * 0.003) * 15;

            this.displacement.x += (Math.cos(angle) * force * attractStrength + waveOffset * force * 0.2 - this.displacement.x) * 0.1;
            this.displacement.y += (Math.sin(angle) * force * attractStrength + waveOffset * force * 0.2 - this.displacement.y) * 0.1;
        } else {
            // Return to base
            this.displacement.x *= 0.95;
            this.displacement.y *= 0.95;
        }

        // Final position
        this.x = this.baseX + floatX + this.displacement.x;
        this.y = this.baseY + floatY + this.displacement.y;
    }

    // Burst away from cursor
    burst() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Strong outward force
        const burstForce = Math.max(50, 150 - distance * 0.5);
        this.displacement.x += Math.cos(angle) * burstForce;
        this.displacement.y += Math.sin(angle) * burstForce;
    }

    draw() {
        let r, g, b, alpha;

        if (this.redIntensity > 0) {
            // Transition from normal color to red
            if (isLightMode) {
                // Light mode: blue (59, 130, 246) -> red (239, 68, 68)
                const color = lerpColor(59, 130, 246, 239, 68, 68, this.redIntensity);
                r = color.r; g = color.g; b = color.b;
            } else {
                // Dark mode: white (255, 255, 255) -> red (239, 68, 68)
                const color = lerpColor(255, 255, 255, 239, 68, 68, this.redIntensity);
                r = color.r; g = color.g; b = color.b;
            }
            alpha = 0.6 + this.redIntensity * 0.4;

            // Add glow effect when turning red
            if (this.redIntensity > 0.3) {
                ctx.shadowBlur = 10 * this.redIntensity;
                ctx.shadowColor = `rgba(239, 68, 68, ${this.redIntensity * 0.8})`;
            }
        } else {
            alpha = isLightMode ? 0.6 : 0.8;
            if (isLightMode) {
                r = 59; g = 130; b = 246;
            } else {
                r = 255; g = 255; b = 255;
            }
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (1 + this.redIntensity * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// DNA Strand connection style
class WebConnection {
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.controlOffset = Math.random() * 30 - 15;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }

    draw(time, heatLevel, isRepelling) {
        const dx = this.nodeB.x - this.nodeA.x;
        const dy = this.nodeB.y - this.nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only draw if within connection range
        const maxDistance = 180;
        if (distance > maxDistance) return;

        // Calculate midpoint for curve
        const midX = (this.nodeA.x + this.nodeB.x) / 2;
        const midY = (this.nodeA.y + this.nodeB.y) / 2;

        // Perpendicular offset for DNA-like curve
        const perpX = -dy / distance;
        const perpY = dx / distance;

        // Animated wave in the connection (DNA strand effect)
        const wave = Math.sin(time * 0.002 + this.pulseOffset + distance * 0.01) * this.controlOffset;
        const ctrlX = midX + perpX * wave;
        const ctrlY = midY + perpY * wave;

        // Calculate opacity based on distance and mouse proximity
        let opacity = (1 - distance / maxDistance) * 0.5;

        // Enhance connections near mouse
        const mouseToMidDist = Math.sqrt(
            Math.pow(mouse.x - midX, 2) + Math.pow(mouse.y - midY, 2)
        );

        // Check if this connection is "attached" to cursor
        const bothAttached = this.nodeA.isAttached && this.nodeB.isAttached;
        const eitherAttached = this.nodeA.isAttached || this.nodeB.isAttached;
        const avgRedIntensity = (this.nodeA.redIntensity + this.nodeB.redIntensity) / 2;

        if (mouseToMidDist < mouse.radius && mouse.isActive && !isRepelling) {
            const mouseInfluence = (1 - mouseToMidDist / mouse.radius);
            opacity += mouseInfluence * 0.5;
        }

        // Subtle pulse
        const pulse = Math.sin(time * 0.003 + this.pulseOffset) * 0.1 + 0.9;
        opacity *= pulse;

        // Boost opacity for attached connections
        if (eitherAttached) {
            opacity = Math.min(1, opacity + 0.3);
        }

        // Draw curved connection
        ctx.beginPath();
        ctx.moveTo(this.nodeA.x, this.nodeA.y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, this.nodeB.x, this.nodeB.y);

        // Color based on red intensity
        let r, g, b;
        if (avgRedIntensity > 0) {
            if (isLightMode) {
                const color = lerpColor(59, 130, 246, 239, 68, 68, avgRedIntensity);
                r = color.r; g = color.g; b = color.b;
            } else {
                const color = lerpColor(255, 255, 255, 239, 68, 68, avgRedIntensity);
                r = color.r; g = color.g; b = color.b;
            }

            // Add glow to red connections
            if (avgRedIntensity > 0.5) {
                ctx.shadowBlur = 8 * avgRedIntensity;
                ctx.shadowColor = `rgba(239, 68, 68, ${avgRedIntensity * 0.6})`;
            }
        } else {
            if (isLightMode) {
                r = 59; g = 130; b = 246;
            } else {
                r = 255; g = 255; b = 255;
            }
        }

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = 0.8 + avgRedIntensity * 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// Nodes and connections arrays
let nodes = [];
let connections = [];

function init() {
    nodes = [];
    connections = [];

    // Detect mobile for optimized node density
    const isMobile = window.innerWidth < 768;

    // Create grid-based nodes with some randomness for organic feel
    // Use larger spacing on mobile for better performance
    const spacing = isMobile ? 80 : 60;
    const cols = Math.ceil(canvas.width / spacing) + 2;
    const rows = Math.ceil(canvas.height / spacing) + 2;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Add some randomness to positions
            const x = i * spacing + (Math.random() - 0.5) * spacing * 0.5;
            const y = j * spacing + (Math.random() - 0.5) * spacing * 0.5;
            nodes.push(new Node(x, y));
        }
    }

    // Create connections between nearby nodes
    const connectionDistance = 180;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].baseX - nodes[j].baseX;
            const dy = nodes[i].baseY - nodes[j].baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                connections.push(new WebConnection(nodes[i], nodes[j]));
            }
        }
    }

    // Reset states on init
    attachmentStartTime = null;
    isInCooldown = false;
    cooldownStartTime = null;
}

// Trigger burst effect
function triggerBurst() {
    nodes.forEach(node => {
        if (node.isAttached || node.redIntensity > 0.3) {
            node.burst();
        }
    });

    // Start cooldown
    isInCooldown = true;
    cooldownStartTime = Date.now();
    attachmentStartTime = null;
}

// Animation loop
let animationTime = 0;

function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    animationTime += 16; // Approximate frame time

    // Check cooldown status
    if (isInCooldown) {
        const cooldownElapsed = Date.now() - cooldownStartTime;
        if (cooldownElapsed >= COOLDOWN_DURATION) {
            isInCooldown = false;
            cooldownStartTime = null;
        }
    }

    // Check if mouse is still (hasn't moved for STILLNESS_THRESHOLD)
    if (mouse.isActive && Date.now() - lastMouseMoveTime > STILLNESS_THRESHOLD) {
        isMouseStill = true;
    }

    // Count attached nodes (only when cursor is still)
    let attachedCount = 0;
    nodes.forEach(node => {
        const dx = mouse.x - node.baseX;
        const dy = mouse.y - node.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < ATTACHED_RADIUS && mouse.isActive && isMouseStill && !isInCooldown) {
            attachedCount++;
        }
    });

    // Track attachment time (only when mouse is still)
    let heatLevel = 0;
    if (attachedCount > 0 && mouse.isActive && isMouseStill && !isInCooldown) {
        if (attachmentStartTime === null) {
            attachmentStartTime = Date.now();
        }

        const attachedDuration = Date.now() - attachmentStartTime;
        heatLevel = Math.min(1, attachedDuration / ATTACHMENT_THRESHOLD);

        // Trigger burst when fully heated
        if (attachedDuration >= ATTACHMENT_THRESHOLD) {
            triggerBurst();
        }
    } else if (!mouse.isActive || isInCooldown || !isMouseStill) {
        // Reset timer if mouse moves, leaves, or in cooldown
        if (!isMouseStill && attachmentStartTime !== null) {
            attachmentStartTime = null;
        }
    }

    // Update nodes
    nodes.forEach(node => node.update(animationTime, heatLevel, isInCooldown));

    // Draw connections first (behind nodes)
    connections.forEach(conn => conn.draw(animationTime, heatLevel, isInCooldown));

    // Draw nodes
    nodes.forEach(node => node.draw());

    // Draw mouse influence area
    if (mouse.isActive) {
        const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, mouse.radius
        );

        let glowColor;
        if (isInCooldown) {
            // Red glow during cooldown (repel mode)
            const cooldownProgress = 1 - ((Date.now() - cooldownStartTime) / COOLDOWN_DURATION);
            glowColor = `rgba(239, 68, 68, ${0.05 * cooldownProgress})`;
        } else if (heatLevel > 0) {
            // Transition glow from normal to red based on heat
            const r = Math.round(59 + (239 - 59) * heatLevel);
            const g = Math.round(130 + (68 - 130) * heatLevel);
            const b = Math.round(246 + (68 - 246) * heatLevel);
            glowColor = `rgba(${r}, ${g}, ${b}, ${0.03 + heatLevel * 0.05})`;
        } else {
            glowColor = isLightMode
                ? 'rgba(59, 130, 246, 0.03)'
                : 'rgba(255, 255, 255, 0.02)';
        }

        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Export functions for script.js compatibility
window.disperse = function () {
    triggerBurst();
};

window.spawnParticlesFromRect = function (rect) {
    // Create temporary highlight effect around rect
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    nodes.forEach(node => {
        const dx = node.baseX - centerX;
        const dy = node.baseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
            const angle = Math.atan2(dy, dx);
            node.displacement.x += Math.cos(angle) * 30;
            node.displacement.y += Math.sin(angle) * 30;
        }
    });
};

init();
animate();
