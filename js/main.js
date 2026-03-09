document.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
        document.body.classList.add('page-loaded');
    });

    // --- NAV ---
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

    // --- NAV SCROLL EFFECTS ---
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (!nav) return;
        const currentY = window.scrollY;

        // Background darken
        if (currentY > 50) {
            nav.style.background = 'rgba(6, 18, 10, 0.9)';
            nav.style.boxShadow = '0 14px 32px rgba(0,0,0,0.28)';
        } else {
            nav.style.background = 'rgba(6, 18, 10, 0.72)';
            nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.22)';
        }

        // Hide on scroll down, show on scroll up
        if (currentY > 100 && currentY > lastScrollY) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }

        lastScrollY = currentY;
    });

    // --- ACTIVE NAV LINK ON SCROLL ---
    const sections = document.querySelectorAll('section[id], header[id]');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        navItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // --- BACK TO TOP ---
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- SCROLL REVEAL ---
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.flow-reveal').forEach((el, index) => {
        el.style.setProperty('--flow-delay', `${(index % 5) * 60}ms`);
        observer.observe(el);
    });

    // --- TYPED TEXT EFFECT ---
    const heroP = document.querySelector('.hero-content > p');
    if (heroP) {
        const fullText = heroP.textContent;
        heroP.textContent = '';
        const cursor = document.createElement('span');
        cursor.className = 'typed-cursor';
        heroP.appendChild(cursor);

        let i = 0;
        setTimeout(() => {
            function typeChar() {
                if (i < fullText.length) {
                    heroP.insertBefore(document.createTextNode(fullText[i]), cursor);
                    i++;
                    setTimeout(typeChar, 35);
                } else {
                    // Remove cursor after typing finishes
                    setTimeout(() => cursor.remove(), 2000);
                }
            }
            typeChar();
        }, 2000);
    }

    // --- PARTICLE CANVAS WITH CONNECTIONS ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const CONNECTION_DISTANCE = 120;

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
                this.size = Math.random() * 2 + 1;
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
                ctx.fillStyle = `rgba(242, 201, 76, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                        ctx.strokeStyle = `rgba(242, 201, 76, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            requestAnimationFrame(animate);
        }
        animate();
    }
});
