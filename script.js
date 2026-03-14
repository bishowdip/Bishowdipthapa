/* ═══════════════════════════════════════════
   Bishowdip Thapa — Portfolio Scripts
   Particles · Typing · Scroll Animations
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Particle Canvas ── */
  (function initParticles() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [], mouse = { x: -999, y: -999 };
    const COUNT = 70;
    const BLUE = '88, 166, 255';
    const PURPLE = '163, 113, 247';

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r  = Math.random() * 1.8 + 0.5;
        this.a  = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.6 ? PURPLE : BLUE;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        // Soft mouse repulsion
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.x += (dx / dist) * 0.8;
          this.y += (dy / dist) * 0.8;
        }
        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        if (this.y > H) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.a})`;
        ctx.fill();
      }
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${BLUE}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function init() {
      particles = [];
      for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    }

    resize();
    init();
    loop();

    window.addEventListener('resize', () => { resize(); init(); });
    window.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
  })();

  /* ── 2. Typing Animation ── */
  (function initTyping() {
    const el = document.getElementById('typeEl');
    if (!el) return;

    const lines = [
      'CS Student @ Softwarica / Coventry',
      'AI / Machine Learning Enthusiast',
      'Android Developer (Kotlin)',
      'Explainable AI (SHAP + LIME)',
      'NVIDIA Jetson AI Developer',
      'Building from 0 and 1... 🚀',
    ];

    let li = 0, ci = 0, deleting = false;
    const SPEED_TYPE = 55, SPEED_DEL = 28, PAUSE = 2200, PAUSE_EMPTY = 500;

    function tick() {
      const current = lines[li];
      if (!deleting) {
        el.textContent = current.slice(0, ci + 1);
        ci++;
        if (ci === current.length) {
          deleting = true;
          setTimeout(tick, PAUSE);
          return;
        }
      } else {
        el.textContent = current.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          li = (li + 1) % lines.length;
          setTimeout(tick, PAUSE_EMPTY);
          return;
        }
      }
      setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
    }

    setTimeout(tick, 800);
  })();

  /* ── 3. Scroll Progress Bar ── */
  (function initScrollBar() {
    const bar = document.getElementById('scrollBar');
    if (!bar) return;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  })();

  /* ── 4. Navbar: scrolled class + active links ── */
  (function initNav() {
    const nav = document.getElementById('nav');
    const links = document.querySelectorAll('.nl');
    if (!nav) return;

    function updateScrolled() {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }

    function updateActive() {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 100) current = s.id;
      });
      links.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    }

    window.addEventListener('scroll', () => { updateScrolled(); updateActive(); }, { passive: true });
    updateScrolled();
    updateActive();
  })();

  /* ── 5. Mobile Nav Toggle ── */
  (function initBurger() {
    const btn = document.getElementById('burger');
    const ul  = document.getElementById('navUl');
    if (!btn || !ul) return;

    btn.addEventListener('click', () => {
      const open = ul.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
    });

    // Close on link click
    ul.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        ul.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!btn.contains(e.target) && !ul.contains(e.target)) {
        ul.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
      }
    });
  })();

  /* ── 6. Scroll-reveal (IntersectionObserver) ── */
  (function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-r');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => obs.observe(el));
  })();

  /* ── 7. Smooth section scrolling for nav links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ── 8. Project card 3D tilt on hover ── */
  (function initTilt() {
    document.querySelectorAll('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width  / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        const rx = -(y / rect.height) * 6;
        const ry =  (x / rect.width)  * 6;
        card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        card.style.transition = 'transform 0.1s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease, border-color 0.25s, box-shadow 0.25s';
      });
    });
  })();

})();
