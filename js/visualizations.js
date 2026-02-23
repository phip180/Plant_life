// --- VISUALIZATIONS.JS ---

class VanishingSlider {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.imgBefore = document.getElementById('img-before');
        this.imgAfter = document.getElementById('img-after');
        this.slider = document.getElementById('vanish-slider');
        this.handle = document.getElementById('vanish-handle');

        this.splitX = this.width * 0.5;
        this.particles = []; // Embers

        // Ensure images are loaded before starting
        if (this.imgBefore.complete && this.imgAfter.complete) {
            this.init();
        } else {
            this.imgBefore.onload = () => { if (this.imgAfter.complete) this.init(); };
            this.imgAfter.onload = () => { if (this.imgBefore.complete) this.init(); };
        }
    }

    init() {
        this.bindEvents();
        this.animate();
    }

    bindEvents() {
        this.slider.addEventListener('input', (e) => {
            const val = e.target.value; // 0 - 100
            this.splitX = (val / 100) * this.width;

            // Move handle Visuals
            if (this.handle) this.handle.style.left = `${val}%`;

            // Spawn embers on movement
            this.spawnEmbers(5);
        });
    }

    spawnEmbers(count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.splitX + (Math.random() - 0.5) * 20, // Near the split
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2, // Slight drift
                vy: -(Math.random() * 3 + 1), // Upward float
                size: Math.random() * 3 + 1,
                alpha: 1,
                color: Math.random() > 0.6 ? '#FF4500' : '#FFD700', // Orange/Gold
                life: Math.random() * 0.03 + 0.01 // Decay rate
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.life; // fade out

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Passive spawn (burning effect always on)
        if (Math.random() < 0.2) this.spawnEmbers(1);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Logic:
        // Left Side (0 to splitX): DESTRUCTION (After Image)
        // Right Side (splitX to width): LIFE (Before Image)
        // "Witness the deforestation" -> Sliding Right reveals more destruction.

        // 1. Draw "Before" Image (Full, behind) -> Represents the remaining life on the right
        this.ctx.drawImage(this.imgBefore, 0, 0, this.width, this.height);

        // 2. Draw "After" Image (Clipped) -> Represents the encroaching destruction from the left
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.splitX, this.height);
        this.ctx.clip();
        this.ctx.drawImage(this.imgAfter, 0, 0, this.width, this.height);

        // 3. Draw Burning Edge
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#FF4500";
        this.ctx.strokeStyle = "rgba(255, 69, 0, 0.9)";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.splitX, 0);
        this.ctx.lineTo(this.splitX, this.height);
        this.ctx.stroke();
        this.ctx.restore();

        // 4. Draw Particles
        this.particles.forEach(p => {
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = `rgba(255, 100, 0, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// --- Background Transition Logic ---
const hopeSection = document.getElementById('hope-section');
if (hopeSection) {
    window.addEventListener('scroll', () => {
        const rect = hopeSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // When Hope Section enters view
        if (rect.top < windowHeight * 0.8) {
            // Light Mode
            document.body.style.backgroundColor = '#f4f9f4'; // Light green-white
            document.body.style.transition = 'background-color 1.5s ease';
            hopeSection.style.opacity = '1';
            hopeSection.style.transform = 'translateY(0)';

            // Invert Nav if needed (optional, keeping simple for now)
        } else {
            // Dark Mode
            document.body.style.backgroundColor = ''; // Revert to CSS default (dark)
            hopeSection.style.opacity = '0';
            hopeSection.style.transform = 'translateY(50px)';
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new VanishingSlider('vanishing-canvas');
    new ImpactMap('impact-map');
    new ImpactSimulator('reforest-canvas');
});

// --- Reforestation Logic ---
class ImpactSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.slider = document.getElementById('impact-slider');
        this.amountDisplay = document.getElementById('donate-amount');
        this.impactDisplay = document.getElementById('impact-text');
        this.tierDisplay = document.getElementById('impact-tier');
        this.feedbackDisplay = document.getElementById('plant-feedback');
        this.btn = document.getElementById('plant-btn');

        this.trees = [];
        this.targetTrees = 5;
        this.skyColor = [20, 30, 40]; // Dark start

        this.slider.addEventListener('input', (e) => this.handleInput(e.target.value));
        this.btn.addEventListener('click', () => this.plantFuture());

        // Initial Draw
        this.animate();
        this.handleInput(25);
    }

    handleInput(val) {
        this.amountDisplay.innerText = `$${val}`;

        // Also update static display if it exists (for layout balance)
        const staticDisplay = document.getElementById('donate-amount-static');
        if (staticDisplay) staticDisplay.innerText = `$${val}`;

        // Floating Label Position
        if (this.slider) {
            const min = parseInt(this.slider.min);
            const max = parseInt(this.slider.max);
            const percent = (val - min) / (max - min);

            const floatingLabel = document.getElementById('floating-price');
            if (floatingLabel) {
                // Dynamic calculation:
                floatingLabel.style.left = `${percent * 100}%`;

                // Add a little offset to center better over the thumb
                const thumbWidth = 24;
                const offset = (thumbWidth / 2) - (thumbWidth * percent);
                floatingLabel.style.transform = `translateX(-50%) translateX(${offset}px)`;
            }
        }

        // Impact Logic
        let impact = "";
        let tier = "Seed Tier";
        let treeCount = 0;

        if (val < 50) {
            impact = `Plants ${Math.floor(val / 2)} Trees`;
            tier = "Seed Tier";
            treeCount = Math.floor(val / 5);
            this.setSky(0); // Dark
        } else if (val < 150) {
            impact = `Restores ${Math.floor(val / 20)} Acres`;
            tier = "Grove Tier";
            treeCount = 10 + Math.floor(val / 3);
            this.setSky(0.5); // Dawn
        } else {
            impact = "Funds Systemic Change";
            tier = "Ecosystem Tier";
            treeCount = 60 + Math.floor(val / 2);
            this.setSky(1); // Day
        }

        this.impactDisplay.innerText = impact;
        if (this.tierDisplay) this.tierDisplay.innerText = tier;
        // Smoothly update target trees
        this.targetTrees = Math.min(treeCount, 150);
    }

    setSky(progress) {
        // Interpolate between Dark (10, 20, 30) and Blue (135, 206, 235)
        const dark = [10, 20, 30];
        const day = [135, 206, 235];

        this.skyColor = dark.map((c, i) => c + (day[i] - c) * progress);
    }

    plantTree() {
        // Procedural Tree
        const type = Math.random() > 0.7 ? 'pine' : 'oak';
        const x = Math.random() * this.width;
        const groundY = this.height - 50;
        // Perspective: Higher Y is closer, Lower Y is further
        const y = groundY - (Math.random() * 50);
        const scale = 0.5 + (y / this.height);

        this.trees.push({
            x, y, scale,
            type,
            growth: 0,
            maxSize: 20 + Math.random() * 40,
            color: type === 'pine' ? '#2d4c3b' : '#4a6b4a'
        });
    }

    animate() {
        // Sky
        this.ctx.fillStyle = `rgb(${this.skyColor[0]}, ${this.skyColor[1]}, ${this.skyColor[2]})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawGround();

        // Manage Tree Count
        if (this.trees.length < this.targetTrees) {
            if (Math.random() < 0.2) this.plantTree();
        } else if (this.trees.length > this.targetTrees) {
            this.trees.splice(0, 1);
        }

        // Draw Trees (Sorted by Y for depth)
        this.trees.sort((a, b) => a.y - b.y);

        this.trees.forEach(t => {
            if (t.growth < 1) t.growth += 0.05;
            this.drawTree(t);
        });

        requestAnimationFrame(() => this.animate());
    }

    drawGround() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, this.height - 60, this.width, 60);
    }

    drawTree(t) {
        this.ctx.save();
        this.ctx.translate(t.x, t.y);
        this.ctx.scale(t.growth * t.scale, t.growth * t.scale);

        // Trunk
        this.ctx.fillStyle = '#5d4037';
        this.ctx.fillRect(-2, 0, 4, -t.maxSize / 2);

        // Foliage
        this.ctx.fillStyle = t.color;
        this.ctx.beginPath();
        if (t.type === 'pine') {
            this.ctx.moveTo(0, -t.maxSize);
            this.ctx.lineTo(-15, -t.maxSize / 3);
            this.ctx.lineTo(15, -t.maxSize / 3);
        } else {
            this.ctx.arc(0, -t.maxSize / 1.5, 15, 0, Math.PI * 2);
        }
        this.ctx.fill();

        this.ctx.restore();
    }

    plantFuture() {
        // Fun effect on click
        this.slider.value = 250;
        this.handleInput(250);
        this.btn.innerText = "Thank You for Growing With Us!";
        this.btn.style.background = "#fff";
        this.btn.style.color = "#1b4d2e";
        if (this.feedbackDisplay) {
            this.feedbackDisplay.innerText = "Future planted. Slider maxed to show ecosystem-scale impact.";
        }

        // Spawn Roots
        this.spawnRoots();
    }

    spawnRoots() {
        const rootCount = 6;
        for (let i = 0; i < rootCount; i++) {
            const root = document.createElement('div');
            root.classList.add('root-sprout');

            // Random positioning around button
            const angle = Math.random() * 360;
            const width = 50 + Math.random() * 100;

            root.style.width = '0px'; // Start invisible
            root.style.top = '50%';
            root.style.left = '50%';
            root.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateX(${width / 2}px)`; // Move out

            this.btn.appendChild(root);

            // Animate growth
            setTimeout(() => {
                root.style.width = `${width}px`;
            }, 50);
        }
    }
}

class ImpactMap {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.counter = document.getElementById('loss-counter');

        this.hotspots = [
            { x: this.width * 0.28, y: this.height * 0.55, name: 'Amazon', r: 0 }, // S. America
            { x: this.width * 0.52, y: this.height * 0.50, name: 'Congo', r: 0 },  // Africa
            { x: this.width * 0.75, y: this.height * 0.55, name: 'Borneo', r: 0 }  // SE Asia
        ];

        this.mapPoints = [];
        this.lossCount = 0;

        this.generateMapPoints();
        this.animate();
    }

    generateMapPoints() {
        // Create a rough "world map" using point grid
        // This is a procedural fake map for aesthetic purposes
        // We'll just scatter points in vague continent shapes
        const clusters = [
            { cx: 0.2, cy: 0.3, rx: 0.15, ry: 0.1 }, // N. America
            { cx: 0.25, cy: 0.6, rx: 0.1, ry: 0.2 }, // S. America
            { cx: 0.45, cy: 0.3, rx: 0.1, ry: 0.1 }, // Europe
            { cx: 0.5, cy: 0.5, rx: 0.12, ry: 0.15 }, // Africa
            { cx: 0.7, cy: 0.35, rx: 0.2, ry: 0.15 }, // Asia
            { cx: 0.8, cy: 0.7, rx: 0.1, ry: 0.1 }   // Australia
        ];

        clusters.forEach(c => {
            const count = 100;
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random();
                const x = (c.cx * this.width) + Math.cos(angle) * (c.rx * this.width * r);
                const y = (c.cy * this.height) + Math.sin(angle) * (c.ry * this.height * r);
                this.mapPoints.push({ x, y });
            }
        });
    }

    animate() {
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.5)'; // Trail effect
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Map Points (Static-ish)
        this.ctx.fillStyle = '#444';
        this.mapPoints.forEach(p => {
            this.ctx.fillRect(p.x, p.y, 2, 2);
        });

        // Pulse Hotspots
        this.hotspots.forEach(h => {
            // Random pulses
            if (Math.random() < 0.05) {
                h.r = 20;
                // Increment counter on pulse
                this.lossCount += Math.floor(Math.random() * 5);
                if (this.counter) this.counter.innerText = `-${this.lossCount} hectares`;
            }

            if (h.r > 0) {
                this.ctx.beginPath();
                this.ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 69, 69, ${h.r / 20})`; // Fade out
                this.ctx.fill();
                h.r -= 0.5;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}
