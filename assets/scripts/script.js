// assets/scripts/script.js

const cfg = window.SITE_CONFIG || {};

function getCurrentPageKey() {
  const path = window.location.pathname;
  return path.split("/").pop() || "index.html";
}

function applySeo() {
  const pageKey = getCurrentPageKey();
  const page = (cfg.pages && cfg.pages[pageKey]) || {};

  if (page.title) document.title = page.title;

  const desc = page.description || "";
  if (desc) {
    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", desc);
  }
}

function renderTemplate(html) {
  return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = cfg[key];
    return typeof val === "string" || typeof val === "number" ? String(val) : "";
  });
}

async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");

  for (const node of nodes) {
    const url = node.getAttribute("data-include");
    if (!url) continue;

    try {
      const res = await fetch(url, { cache: "no-cache" });

      if (!res.ok) {
        node.innerHTML = `<!-- include failed: ${url} -->`;
        continue;
      }

      const html = await res.text();

      // Change this to html instead of renderTemplate(html) while testing.
      node.innerHTML = renderTemplate(html);
    } catch (error) {
      console.error(`Include failed: ${url}`, error);
      node.innerHTML = `<!-- include failed: ${url} -->`;
    }
  }
}

function applyYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year], #year").forEach((el) => {
    el.textContent = year;
  });
}

function wireNav() {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".nav-panel");
  if (!toggle || !panel) return;

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }
  toggle.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  panel.addEventListener("click", event => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", event => {
    if (!panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  window.matchMedia("(max-width: 860px)").addEventListener("change", () => setOpen(false));
}

function wireHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function updateHeaderScrollState() {
    if (window.scrollY > 10) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeaderScrollState();
  window.addEventListener("scroll", updateHeaderScrollState, { passive: true });
}

function wireTestimonials() {
  const slider = document.querySelector(".testimonial-slider");
  if (!slider) return;

  const track = slider.querySelector(".testimonial-track");
  const testimonials = Array.from(slider.querySelectorAll(".testimonial"));
  const prevBtn = slider.querySelector(".testimonial-btn--prev");
  const nextBtn = slider.querySelector(".testimonial-btn--next");
  const dots = Array.from(slider.querySelectorAll(".testimonial-dot"));
  let currentIndex = 0;
  let slideWidth = slider.clientWidth;

  function updateDimensions() {
    slideWidth = slider.clientWidth;
    track.style.width = `${slideWidth * testimonials.length}px`;
    testimonials.forEach((testimonial) => {
      testimonial.style.width = `${slideWidth}px`;
      testimonial.style.minWidth = `${slideWidth}px`;
      testimonial.style.maxWidth = `${slideWidth}px`;
    });
    updateSlider(currentIndex, false);
  }

  function updateSlider(index, animate = true) {
    const clamped = (index + testimonials.length) % testimonials.length;
    currentIndex = clamped;
    if (!animate) {
      track.style.transition = "none";
    }
    track.style.transform = `translateX(${-clamped * slideWidth}px)`;
    if (!animate) {
      requestAnimationFrame(() => {
        track.style.transition = "transform 280ms ease";
      });
    }
    testimonials.forEach((testimonial, idx) => {
      testimonial.classList.toggle("is-active", idx === clamped);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === clamped);
    });
  }

  prevBtn?.addEventListener("click", () => updateSlider(currentIndex - 1));
  nextBtn?.addEventListener("click", () => updateSlider(currentIndex + 1));
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      updateSlider(Number(dot.dataset.slide || 0));
    });
  });

  window.addEventListener("resize", updateDimensions);
  updateDimensions();
}

(async function init() {
  applySeo();
  await includePartials();
  applyYear();
  document.querySelectorAll("[data-service-area]").forEach(el => {
    el.textContent = cfg.serviceArea || "";
    el.hidden = !cfg.serviceArea;
  });
  document.querySelectorAll(".nav__link, .nav-panel__link").forEach(link => {
    if (link.getAttribute("href") === getCurrentPageKey()) link.setAttribute("aria-current", "page");
  });
  wireNav();
  wireHeaderScroll();
  wireTestimonials();
})();