// assets/scripts/script.js

const cfg = window.SITE_CONFIG || {};

function getCurrentPageKey() {
  const path = window.location.pathname;
  return path.split("/").pop() || "index.html";
}

function applySeo() {
  const pageKey = getCurrentPageKey();
  const page = (cfg.pages && cfg.pages[pageKey]) || {};

  document.title = page.title || cfg.businessName || "Website";

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

  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });

  panel.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.matches("a")) {
      panel.classList.remove("is-open");
    }
  });
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
  wireNav();
  wireHeaderScroll();
  wireTestimonials();
})();