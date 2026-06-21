(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-menu");
  const cursor = document.querySelector(".cursor-dot");

  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
  }, { passive: true });

  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menu?.classList.toggle("open", !open);
  });

  menu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  if (!coarse && cursor) {
    let mouseX = innerWidth / 2;
    let mouseY = innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;

    window.addEventListener("mousemove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }, { passive: true });

    const follow = () => {
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      cursor.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    };
    follow();

    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });

    document.querySelectorAll(".magnetic").forEach(el => {
      el.addEventListener("mousemove", event => {
        const box = el.getBoundingClientRect();
        const x = event.clientX - box.left - box.width / 2;
        const y = event.clientY - box.top - box.height / 2;
        el.style.transform = `translate(${x * .13}px, ${y * .13}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  const canvas = document.querySelector("#binary-field");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let characters = [];
    let frame = 0;

    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(120, Math.floor((width * height) / 13000));
      characters = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: .15 + Math.random() * .45,
        value: Math.random() > .5 ? "1" : "0",
        size: 9 + Math.random() * 9,
        alpha: .25 + Math.random() * .75
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#1f37ff";
      characters.forEach(char => {
        ctx.globalAlpha = char.alpha;
        ctx.font = `${char.size}px "DM Mono", monospace`;
        ctx.fillText(char.value, char.x, char.y);
        char.y += char.speed;
        if (char.y > height + 20) {
          char.y = -20;
          char.x = Math.random() * width;
          char.value = Math.random() > .5 ? "1" : "0";
        }
        if (frame % 180 === 0 && Math.random() > .7) {
          char.value = char.value === "1" ? "0" : "1";
        }
      });
      ctx.globalAlpha = 1;
      frame += 1;
      requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
  }

  const updateTime = () => {
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kathmandu",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
    const timeEl = document.querySelector(".footer-time");
    if (timeEl) timeEl.textContent = `${time} NPT`;
  };
  updateTime();
  setInterval(updateTime, 60000);
  document.querySelector("#year").textContent = new Date().getFullYear();
})();
