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

(async function init() {
  applySeo();
  await includePartials();
  applyYear();
  wireNav();
  wireHeaderScroll();
})();