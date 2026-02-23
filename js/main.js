document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GLOBAL UI ---
    // Parallax Effect
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollValue = window.scrollY;
            if (scrollValue < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrollValue * 0.4}px) scale(1.1)`;
            }
        });
    }

    // Navbar Scroll Effect
    const nav = document.querySelector('.main-nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (nav && navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.textContent = isOpen ? 'Close' : 'Menu';
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('nav-open')) {
                    nav.classList.remove('nav-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.textContent = 'Menu';
                }
            });
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(15, 47, 24, 0.95)';
            nav.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        } else {
            nav.style.background = 'rgba(15, 47, 24, 0.7)';
            nav.style.boxShadow = 'none';
        }
    });

    // Intersection Observer
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only trigger once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-card, .process-viz, .timeline-node').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Inject visible class style
    if (!document.getElementById('dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-styles';
        style.innerHTML = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
        document.head.appendChild(style);
    }


    // --- 2. PARTICLE SYSTEM (Index Page) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1; // 1 to 3px
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
            draw() {
                ctx.fillStyle = `rgba(242, 201, 76, ${this.opacity})`; // Gold color
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();
    }


    // --- 3. AUDIO CONTROL ---
    const audioBtn = document.getElementById('audio-toggle');
    const audio = document.getElementById('forest-audio');
    if (audioBtn && audio) {
        audioBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().catch(e => console.log("Audio play blocked by browser policy until interaction"));
                document.getElementById('icon-sound-off').style.display = 'none';
                document.getElementById('icon-sound-on').style.display = 'block';
            } else {
                audio.pause();
                document.getElementById('icon-sound-off').style.display = 'block';
                document.getElementById('icon-sound-on').style.display = 'none';
            }
        });
    }


    // --- 4. "WHAT DISAPPEARS" INTREACTIVE ---
    const toggleBtn = document.getElementById('btn-toggle-life');
    const lifeToggleStatus = document.getElementById('life-toggle-status');
    if (toggleBtn) {
        const startEffect = () => {
            document.body.classList.add('life-toggled');
            toggleBtn.innerText = "Release to Restore Life";
            if (lifeToggleStatus) lifeToggleStatus.innerText = "Life dimmed. Release to restore the ecosystem.";
        };
        const endEffect = () => {
            document.body.classList.remove('life-toggled');
            toggleBtn.innerText = "Hold to See a World Without Plants";
            if (lifeToggleStatus) lifeToggleStatus.innerText = "Press and hold to preview the impact of plant loss.";
        };

        // Mouse
        toggleBtn.addEventListener('mousedown', startEffect);
        toggleBtn.addEventListener('mouseup', endEffect);
        toggleBtn.addEventListener('mouseleave', endEffect);

        // Touch
        toggleBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startEffect(); });
        toggleBtn.addEventListener('touchend', endEffect);
    }


    // --- 5. PHOTOSYNTHESIS SCROLLYTELLING (LIVING LEAF VERSION) ---
    const photoSection = document.getElementById('photosynthesis');
    const leafCore = document.getElementById('living-leaf-core');
    const progressSpan = document.getElementById('synthesis-progress');
    const oxyBurst = document.getElementById('output-oxygen');
    const stage = document.querySelector('.living-leaf-stage');

    // Particle Spawner
    function spawnParticle(type, startX, startY, destX, destY) {
        if (!stage) return;

        const p = document.createElement('div');
        p.className = `particle ${type}`;

        // Randomize start slightly
        const randX = (Math.random() - 0.5) * 40;
        const randY = (Math.random() - 0.5) * 40;

        p.style.left = `calc(${startX} + ${randX}px)`;
        p.style.top = `calc(${startY} + ${randY}px)`;

        // Vector to center (approximate for demo)
        p.style.setProperty('--tx', `${destX}px`);
        p.style.setProperty('--ty', `${destY}px`);

        p.style.animation = `particleFlow ${1.5 + Math.random()}s ease-in forwards`;

        stage.appendChild(p);

        setTimeout(() => { p.remove(); }, 2500);
    }

    if (photoSection) {
        window.addEventListener('scroll', () => {
            const rect = photoSection.getBoundingClientRect();
            const center = window.innerHeight / 2;

            // Interaction zone
            if (rect.top < center + 200 && rect.bottom > center - 200) {
                // Calculate progress 0-100%
                let progress = 1 - (rect.top / center);
                progress = Math.min(Math.max(progress, 0), 1) * 100;

                if (progressSpan) progressSpan.innerText = Math.floor(progress) + '%';

                // Scale leaf
                if (leafCore) {
                    const scale = 1 + (progress / 200);
                    leafCore.style.transform = `translate(-50%, -50%) scale(${scale})`;
                }

                // Spawn Particles
                if (Math.random() < (progress / 200)) {
                    spawnParticle('sun', '20%', '20%', 150, 150);
                }
                if (Math.random() < (progress / 200)) {
                    spawnParticle('water', '50%', '80%', 0, -150);
                }
                if (Math.random() < (progress / 200)) {
                    spawnParticle('co2', '10%', '50%', 200, 0);
                }

                // Output Trigger
                if (progress > 85) {
                    if (oxyBurst) {
                        oxyBurst.style.opacity = '1';
                        oxyBurst.style.transform = 'translateY(-50%) scale(1.1)';
                    }
                } else {
                    if (oxyBurst) {
                        oxyBurst.style.opacity = '0';
                        oxyBurst.style.transform = 'translateY(-50%) scale(1)';
                    }
                }
            }
        });
    }


    // --- 6. PAGE 2: RELIANCE CALCULATOR ---
    const param = document.querySelectorAll('.calc-item input');
    const scoreDisplay = document.getElementById('plant-score');
    const scoreContainer = document.querySelector('.score-display');
    const calcReset = document.getElementById('calc-reset');

    if (param.length > 0 && scoreDisplay) {
        const updatePlantScore = () => {
            let total = 0;
            let checkedCount = 0;
            param.forEach(i => {
                if (i.checked) {
                    total += parseInt(i.value);
                    checkedCount++;
                }
            });

            scoreDisplay.innerText = Math.min(100, total + 20); // Base 20% for breathing ;)

            if (scoreContainer) {
                scoreContainer.style.opacity = checkedCount > 0 ? '1' : '0';
            }
        };

        param.forEach(input => {
            input.addEventListener('change', updatePlantScore);
        });

        if (calcReset) {
            calcReset.addEventListener('click', () => {
                param.forEach(input => { input.checked = false; });
                updatePlantScore();
            });
        }

        param.forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.checked = !input.checked;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    }

    // --- 7. PAGE 2: DEEP ZOOM CARDS ---
    const cards = document.querySelectorAll('.plant-card');
    const grid = document.getElementById('medicinal-grid');

    if (grid && cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('click', () => {
                // If already expanded, close it
                if (card.classList.contains('expanded')) {
                    card.classList.remove('expanded');
                    card.innerHTML = card.dataset.originalHtml; // Restore
                } else {
                    // Close others
                    cards.forEach(c => {
                        if (c.classList.contains('expanded')) {
                            c.classList.remove('expanded');
                            c.innerHTML = c.dataset.originalHtml;
                        }
                    });

                    // Save original state if not saved
                    if (!card.dataset.originalHtml) {
                        card.dataset.originalHtml = card.innerHTML;
                    }

                    // Expand this one
                    card.classList.add('expanded');

                    // Inject chemical info
                    const chem = card.dataset.chemical;
                    const desc = card.dataset.desc;

                    card.innerHTML = `
                        <div style="text-align: center; width: 100%;">
                            <h3 style="font-size: 2.5rem; color: var(--color-accent); margin-bottom: 0;">${chem}</h3>
                            <p style="font-family: var(--font-heading); font-style: italic; margin-bottom: 1rem;">Molecule of Life</p>
                            <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
                                <p style="font-size: 1.1rem; line-height: 1.6;">${desc}</p>
                            </div>
                            <button class="btn-donate" style="background: transparent; border: 1px solid var(--color-text-muted); font-size: 0.8rem; padding: 0.5rem 1rem;">Close Analysis</button>
                        </div>
                    `;

                    // Re-bind click to close (bubbling handles it, but verify target)
                }
            });
        });
    }

    // --- 8. PAGE 2: VERTICAL ROOT TIMELINE ---
    const rootLine = document.querySelector('.root-progress');
    const nodes = document.querySelectorAll('.timeline-node');

    if (rootLine && nodes.length > 0) {
        window.addEventListener('scroll', () => {
            const section = document.querySelector('.timeline-section');
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate progress through the section
            const start = windowHeight * 0.8;
            const end = -rect.height + windowHeight * 0.5;

            // Simplified logic: Map scroll to height %
            // When section top is at windowHeight, 0%. When section bottom is at windowHeight, 100%.

            let percentage = (windowHeight - rect.top) / (rect.height + windowHeight * 0.5) * 100;
            percentage = Math.max(0, Math.min(100, percentage));

            rootLine.style.height = `${percentage}%`;

            // Activate nodes as line passes them
            nodes.forEach(node => {
                const nodeRect = node.getBoundingClientRect();
                const nodeTop = nodeRect.top - rect.top; // Relative to section

                // If the root line (height %) has passed this node's relative top %
                const nodePercent = (nodeTop / rect.height) * 100;

                if (percentage > nodePercent) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
            });
        });
    }

});
