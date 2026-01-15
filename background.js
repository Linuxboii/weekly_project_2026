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
    radius: 250,
    isActive: false
};

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isActive = true;
});

window.addEventListener('mouseout', () => {
    mouse.isActive = false;
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
    }

    update(time) {
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

        // Mouse interaction - push/pull effect
        if (distance < mouse.radius && mouse.isActive) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);

            // Subtle attraction with wave-like ripple
            const waveOffset = Math.sin(distance * 0.02 - time * 0.003) * 20;
            this.displacement.x += (Math.cos(angle) * force * 40 + waveOffset * force * 0.3 - this.displacement.x) * 0.1;
            this.displacement.y += (Math.sin(angle) * force * 40 + waveOffset * force * 0.3 - this.displacement.y) * 0.1;
        } else {
            // Return to base
            this.displacement.x *= 0.95;
            this.displacement.y *= 0.95;
        }

        // Final position
        this.x = this.baseX + floatX + this.displacement.x;
        this.y = this.baseY + floatY + this.displacement.y;
    }

    draw() {
        const alpha = isLightMode ? 0.6 : 0.8;
        const color = isLightMode
            ? `rgba(59, 130, 246, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
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

    draw(time) {
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

        if (mouseToMidDist < mouse.radius && mouse.isActive) {
            const mouseInfluence = (1 - mouseToMidDist / mouse.radius);
            opacity += mouseInfluence * 0.4;
        }

        // Subtle pulse
        const pulse = Math.sin(time * 0.003 + this.pulseOffset) * 0.1 + 0.9;
        opacity *= pulse;

        // Draw curved connection
        ctx.beginPath();
        ctx.moveTo(this.nodeA.x, this.nodeA.y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, this.nodeB.x, this.nodeB.y);

        const color = isLightMode
            ? `rgba(59, 130, 246, ${opacity})`
            : `rgba(255, 255, 255, ${opacity})`;

        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }
}

// Nodes and connections arrays
let nodes = [];
let connections = [];

function init() {
    nodes = [];
    connections = [];

    // Create grid-based nodes with some randomness for organic feel
    const spacing = 60;
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
}

// Animation loop
let animationTime = 0;

function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    animationTime += 16; // Approximate frame time

    // Update nodes
    nodes.forEach(node => node.update(animationTime));

    // Draw connections first (behind nodes)
    connections.forEach(conn => conn.draw(animationTime));

    // Draw nodes
    nodes.forEach(node => node.draw());

    // Draw mouse influence area (subtle glow)
    if (mouse.isActive) {
        const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, mouse.radius
        );

        const glowColor = isLightMode
            ? 'rgba(59, 130, 246, 0.03)'
            : 'rgba(255, 255, 255, 0.02)';

        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Export functions for script.js compatibility
window.disperse = function () {
    // Ripple effect from center
    const centerX = mouse.x || canvas.width / 2;
    const centerY = mouse.y || canvas.height / 2;

    nodes.forEach(node => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const force = Math.max(0, 300 - dist) / 300 * 100;

        node.displacement.x += Math.cos(angle) * force;
        node.displacement.y += Math.sin(angle) * force;
    });
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
