/* ═══════════════════════════════════════════
   Bishowdip Thapa — Portfolio Scripts
   Crafted · Resilient · A11y-aware
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isTouch = 'ontouchstart' in window;

  /* ── Utility: throttle via rAF ── */
  function rafThrottle(fn) {
    let ticking = false;
    return function (...args) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn.apply(this, args);
        ticking = false;
      });
    };
  }

  /* ── 1. Particle Canvas (paused when hidden / off-screen / reduced-motion) ── */
  (function initParticles() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    if (prefersReduced) { canvas.remove(); return; }

    const ctx = canvas.getContext('2d', { alpha: true });
    let W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let mouse = { x: -9999, y: -9999 };
    let running = true;
    let heroInView = true;
    let rafId = null;

    const BLUE = '88, 166, 255';
    const PURPLE = '163, 113, 247';

    function countForViewport() {
      const area = window.innerWidth * window.innerHeight;
      if (isCoarsePointer || window.innerWidth < 700) return 34;
      if (area < 900000) return 54;
      return 74;
    }
    let COUNT = countForViewport();

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r  = Math.random() * 1.8 + 0.5;
        this.a  = Math.random() * 0.5 + 0.15;
        this.color = Math.random() > 0.6 ? PURPLE : BLUE;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          this.x += (dx / dist) * 0.9;
          this.y += (dy / dist) * 0.9;
        }
        if (this.x < 0) this.x = W;
        else if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        else if (this.y > H) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.a})`;
        ctx.fill();
      }
    }

    function drawConnections() {
      const maxDist = 130;
      const maxDistSq = maxDist * maxDist;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < maxDistSq) {
            const alpha = (1 - Math.sqrt(dSq) / maxDist) * 0.18;
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
      COUNT = countForViewport();
      particles = [];
      for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    }

    function loop() {
      if (!running || !heroInView) { rafId = null; return; }
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      for (const p of particles) { p.update(); p.draw(); }
      rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (rafId == null && running && heroInView) {
        rafId = requestAnimationFrame(loop);
      }
    }

    resize();
    init();
    startLoop();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); init(); }, 120);
    });

    if (!isTouch) {
      window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      }, { passive: true });
      window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    }

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) startLoop();
    });

    // Pause when hero out of viewport
    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        heroInView = entries[0].isIntersecting;
        if (heroInView) startLoop();
      }, { threshold: 0 });
      io.observe(hero);
    }
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

    // Respect reduced motion: show a static line, cycle slowly without typing effect
    if (prefersReduced) {
      let i = 0;
      el.textContent = lines[0];
      setInterval(() => { i = (i + 1) % lines.length; el.textContent = lines[i]; }, 4500);
      return;
    }

    let li = 0, ci = 0, deleting = false;
    const SPEED_TYPE = 55, SPEED_DEL = 28, PAUSE = 2200, PAUSE_EMPTY = 500;
    let timer = null;

    function tick() {
      const current = lines[li];
      if (!deleting) {
        el.textContent = current.slice(0, ci + 1);
        ci++;
        if (ci === current.length) {
          deleting = true;
          timer = setTimeout(tick, PAUSE);
          return;
        }
      } else {
        el.textContent = current.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          li = (li + 1) % lines.length;
          timer = setTimeout(tick, PAUSE_EMPTY);
          return;
        }
      }
      timer = setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
    }

    // Start after a brief pause so the pre-rendered text is visible momentarily (no CLS)
    setTimeout(() => { el.textContent = ''; ci = 0; tick(); }, 1200);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && timer) { clearTimeout(timer); timer = null; }
      else if (!timer) { timer = setTimeout(tick, 300); }
    });
  })();

  /* ── 3. Scroll Progress Bar ── */
  (function initScrollBar() {
    const bar = document.getElementById('scrollBar');
    if (!bar) return;
    const update = rafThrottle(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();

  /* ── 4. Navbar: scrolled class + active-section tracking via IO ── */
  (function initNav() {
    const nav = document.getElementById('nav');
    const links = document.querySelectorAll('.nl');
    if (!nav) return;

    const updateScrolled = rafThrottle(() => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
    window.addEventListener('scroll', updateScrolled, { passive: true });
    updateScrolled();

    // IO-based active section
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const setActive = (id) => {
      links.forEach(a => {
        const match = a.getAttribute('href') === '#' + id;
        a.classList.toggle('active', match);
        if (match) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };

    const io = new IntersectionObserver((entries) => {
      // Pick the top-most visible section
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.target.offsetTop - b.target.offsetTop);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => io.observe(s));
  })();

  /* ── 5. Mobile Nav Toggle (with Escape + focus trap basics) ── */
  (function initBurger() {
    const btn = document.getElementById('burger');
    const ul  = document.getElementById('navUl');
    if (!btn || !ul) return;

    function close() {
      ul.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function open() {
      ul.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }

    btn.addEventListener('click', () => {
      if (ul.classList.contains('open')) close(); else open();
    });

    ul.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

    document.addEventListener('click', e => {
      if (!btn.contains(e.target) && !ul.contains(e.target)) close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && ul.classList.contains('open')) {
        close();
        btn.focus();
      }
    });
  })();

  /* ── 6. Scroll-reveal (IntersectionObserver) ── */
  (function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-r');
    if (!els.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  })();

  /* ── 7. Smooth anchor scroll with navbar offset ── */
  (function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
        // Update URL hash without jump
        history.replaceState(null, '', href);
      });
    });
  })();

  /* ── 8. Project card 3D tilt (desktop only, no conflict with hover) ── */
  (function initTilt() {
    if (prefersReduced || isTouch || isCoarsePointer) return;

    document.querySelectorAll('.proj-card').forEach(card => {
      let rafPending = false;
      let tx = 0, ty = 0;

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width  / 2;
        const y = e.clientY - rect.top  - rect.height / 2;
        tx = -(y / rect.height) * 5;
        ty =  (x / rect.width)  * 5;
        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(() => {
            card.style.transform = `translateY(-4px) perspective(900px) rotateX(${tx}deg) rotateY(${ty}deg)`;
            rafPending = false;
          });
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  })();

  /* ── 9. Magnetic buttons (subtle pull) ── */
  (function initMagnetic() {
    if (prefersReduced || isTouch || isCoarsePointer) return;

    document.querySelectorAll('.magnetic').forEach(el => {
      const STRENGTH = 0.22;
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * STRENGTH;
        const y = (e.clientY - rect.top - rect.height / 2) * STRENGTH;
        el.style.transform = `translate(${x}px, ${y - 2}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  })();

  /* ── 10. Back-to-top button ── */
  (function initToTop() {
    const btn = document.getElementById('toTop');
    if (!btn) return;
    const toggle = rafThrottle(() => {
      btn.classList.toggle('show', window.scrollY > 480);
    });
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
    toggle();
  })();

  /* ── 11. Copy email to clipboard + toast ── */
  (function initCopy() {
    const btn = document.getElementById('copyEmail');
    const toast = document.getElementById('toast');
    if (!btn) return;

    function showToast(msg, ok = true) {
      if (!toast) return;
      toast.textContent = msg;
      toast.style.color = ok ? '' : 'var(--orange)';
      toast.style.borderColor = ok ? 'rgba(63,185,80,0.4)' : 'rgba(247,129,102,0.4)';
      toast.classList.add('show');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
    }

    btn.addEventListener('click', async () => {
      const email = btn.dataset.email || 'bishodip123@gmail.com';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        btn.classList.add('copied');
        btn.querySelector('.copy-label').textContent = 'Copied!';
        showToast('Email copied to clipboard ✓');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.querySelector('.copy-label').textContent = 'Copy';
        }, 2000);
      } catch {
        showToast('Could not copy — press Ctrl+C', false);
      }
    });
  })();

  /* ── 12. Animated stats counter ── */
  (function initStats() {
    const stats = document.querySelectorAll('.sn');
    if (!stats.length || prefersReduced || !('IntersectionObserver' in window)) return;

    const animate = (el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+)(.*)$/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      const suffix = match[2];
      if (target <= 0) return;
      const duration = 1100;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    stats.forEach(s => io.observe(s));
  })();

  /* ── 13. Year in footer ── */
  (function initYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  })();

  /* ═══════════════════════════════════════════
     ▓▓▓▓▓  LAYER 2 — CINEMATIC BEHAVIOR  ▓▓▓▓▓
     ═══════════════════════════════════════════ */

  /* ── L2.1 Cursor spotlight (lerped, butter-smooth) ── */
  (function initSpotlight() {
    if (prefersReduced || isTouch || isCoarsePointer) return;
    const sp = document.querySelector('.spotlight');
    if (!sp) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    let active = false;

    window.addEventListener('mousemove', e => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        document.body.classList.add('cursor-active');
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      active = false;
      document.body.classList.remove('cursor-active');
    });

    function tick() {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      sp.style.setProperty('--mx', cx + 'px');
      sp.style.setProperty('--my', cy + 'px');
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ── L2.2 Split hero name into letters for stagger drop ── */
  (function initSplitName() {
    const el = document.querySelector('[data-split]');
    if (!el) return;
    if (prefersReduced) return;

    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      if (ch === ' ') {
        s.className = 'chr sp';
        s.innerHTML = '&nbsp;';
      } else {
        s.className = 'chr';
        s.textContent = ch;
      }
      s.style.setProperty('--d', (0.3 + i * 0.035) + 's');
      s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });
  })();

  /* ── L2.3 Split section headings into words ── */
  (function initSplitHeadings() {
    const heads = document.querySelectorAll('[data-split-head] h2');
    heads.forEach(h2 => {
      const words = h2.textContent.trim().split(/\s+/);
      h2.setAttribute('aria-label', h2.textContent.trim());
      h2.innerHTML = words
        .map((w, i) => `<span class="word" style="--i:${i}" aria-hidden="true">${w}</span>`)
        .join(' ');
    });
  })();

  /* ── L2.4 Hero parallax (scroll + subtle mousemove tilt) ── */
  (function initHeroParallax() {
    if (prefersReduced) return;
    const pic = document.querySelector('.pic-wrap[data-parallax]');
    const hero = document.getElementById('hero');
    if (!pic || !hero) return;

    let py = 0;        // scroll offset
    let tx = 0, ty = 0; // target rotation
    let rx = 0, ry = 0; // current rotation (lerped)
    const canTilt = !(isTouch || isCoarsePointer);

    // Scroll parallax target
    const onScroll = rafThrottle(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      py = y * -0.08;
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mousemove tilt target (desktop only)
    if (canTilt) {
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 12;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 12;
      });
      hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    }

    function tick() {
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      pic.style.transform = canTilt
        ? `translate3d(0, ${py}px, 0) perspective(900px) rotateY(${rx * 0.5}deg) rotateX(${-ry * 0.5}deg)`
        : `translate3d(0, ${py}px, 0)`;
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ── L2.5 Project card shine (cursor position as CSS vars) ── */
  (function initCardShine() {
    if (isTouch || isCoarsePointer) return;
    document.querySelectorAll('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  })();

  /* ── L2.6 Skill chips: stagger index + visible class ── */
  (function initChipStagger() {
    document.querySelectorAll('.sg').forEach(sg => {
      sg.querySelectorAll('.chip').forEach((c, i) => c.style.setProperty('--chip-i', i));
    });
    if (prefersReduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.sg').forEach(sg => sg.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.sg').forEach(sg => io.observe(sg));
  })();

  /* ── L2.7 Timeline: draw the rail on reveal ── */
  (function initTimelineDraw() {
    const tl = document.querySelector('.timeline');
    if (!tl) return;
    if (prefersReduced || !('IntersectionObserver' in window)) { tl.classList.add('drawn'); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { tl.classList.add('drawn'); io.unobserve(tl); }
      });
    }, { threshold: 0.2 });
    io.observe(tl);
  })();

  /* ── L2.8 Marquee speed tweak: pause when off-screen to save paints ── */
  (function initMarqueePause() {
    const mq = document.querySelector('.marquee');
    if (!mq || !('IntersectionObserver' in window)) return;
    const track = mq.querySelector('.marquee-track');
    if (!track) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        track.style.animationPlayState = en.isIntersecting ? 'running' : 'paused';
      });
    }, { threshold: 0 });
    io.observe(mq);
  })();

  /* ── 14. Keyboard shortcut: G then H → top, G then P → projects ── */
  (function initShortcuts() {
    let lastKey = null;
    let lastKeyTime = 0;
    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea, [contenteditable]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const now = Date.now();
      const k = e.key.toLowerCase();
      if (lastKey === 'g' && now - lastKeyTime < 900) {
        const dest =
          k === 'h' ? '#hero' :
          k === 'a' ? '#about' :
          k === 's' ? '#skills' :
          k === 'p' ? '#projects' :
          k === 'e' ? '#education' :
          k === 'c' ? '#contact' : null;
        if (dest) {
          const el = document.querySelector(dest);
          if (el) {
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
            const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
            window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
          }
        }
        lastKey = null;
        return;
      }
      if (k === 'g') { lastKey = 'g'; lastKeyTime = now; }
      else lastKey = null;
    });
  })();

})();
