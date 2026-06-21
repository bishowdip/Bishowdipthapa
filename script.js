(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-menu");

  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 20);
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

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

  const updateTime = () => {
    const value = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kathmandu",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
    const element = document.querySelector(".footer-time");
    if (element) element.textContent = `${value} NPT`;
  };

  updateTime();
  setInterval(updateTime, 60000);
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
