/* ==========================================================================
   MADE artes — Sanity wiring (progressive enhancement)
   Pages render their static/fallback content first; if a projectId is set
   below, content is fetched from Sanity's Content Lake and swapped in.
   No build step, no dependencies — plain GROQ over HTTP.
   ========================================================================== */

const SANITY = {
  projectId: "",            // ← paste your Sanity project ID here
  dataset: "production",
  apiVersion: "2024-01-01",
};

/* ---- Client ---- */
async function groq(query) {
  if (!SANITY.projectId) return null;
  const url = `https://${SANITY.projectId}.api.sanity.io/v${SANITY.apiVersion}/data/query/${SANITY.dataset}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn("[sanity] query failed:", res.status); return null; }
    return (await res.json()).result;
  } catch (err) {
    console.warn("[sanity] fetch error:", err);
    return null;
  }
}

/* ---- Helpers ---- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const money = (n) => "$" + Number(n).toLocaleString("en-US", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

const PRODUCT_CARD = `{ title, price, compareAt, badge, swatches, "slug": slug.current, "imageUrl": image.asset->url }`;

function mediaHTML(item, phClass, label) {
  return item.imageUrl
    ? `<div class="ph ${phClass} has-img" data-label="${label}"><img src="${item.imageUrl}?w=900&fit=max&auto=format" alt="${esc(item.title)}"></div>`
    : `<div class="ph ${phClass}" data-label="${label}"></div>`;
}

function cardHTML(p) {
  const badge = p.badge
    ? `<span class="card__badge ${p.badge === "SOLD OUT" ? "card__badge--soldout" : ""}">${esc(p.badge)}</span>`
    : "";
  const swatches = p.swatches
    ? `<div class="card__swatches">${'<span class="swatch"></span>'.repeat(p.swatches)}</div>`
    : "";
  const was = p.compareAt ? `<s>${money(p.compareAt)}</s>` : "";
  const href = p.slug === "panama-cloth-service-jacket" ? "product.html" : "#";
  return `
    <a class="card" href="${href}">
      <div class="card__media">${badge}${mediaHTML(p, "ph--square", "Product")}</div>
      ${swatches}
      <div class="card__info">
        <h3 class="card__title">${esc(p.title)}</h3>
        <span class="card__price">${was}${money(p.price)}</span>
      </div>
    </a>`;
}

/* ---- Homepage ---- */
async function hydrateHome() {
  const data = await groq(`*[_type=="homepage"][0]{
    heroHeading, heroCtaLabel,
    "newReleases": newReleases[]->${PRODUCT_CARD},
    features[]{ eyebrow, heading, body, ctaLabel },
    "posts": *[_type=="post"] | order(_createdAt asc) [0...3] { title, excerpt, "imageUrl": image.asset->url }
  }`);
  if (!data) return;

  if (data.heroHeading) {
    const h = document.querySelector(".hero__caption h2");
    if (h) h.textContent = data.heroHeading;
  }
  if (data.heroCtaLabel) {
    const b = document.querySelector(".hero__caption .btn");
    if (b) b.textContent = data.heroCtaLabel;
  }

  if (data.newReleases?.length) {
    const grid = document.querySelector(".grid--4");
    if (grid) grid.innerHTML = data.newReleases.map(cardHTML).join("");
  }

  if (data.features?.length) {
    const bodies = document.querySelectorAll(".feature__body");
    data.features.forEach((f, i) => {
      const el = bodies[i];
      if (!el) return;
      const set = (sel, val) => { const n = el.querySelector(sel); if (n && val) n.textContent = val; };
      set(".eyebrow", f.eyebrow);
      set("h2", f.heading);
      set("p", f.body);
      set(".btn", f.ctaLabel);
    });
  }

  if (data.posts?.length) {
    const grid = document.querySelector(".research .grid--3");
    if (grid) grid.innerHTML = data.posts.map((p) => `
      <article class="card">
        ${mediaHTML(p, "ph--wide", "Journal")}
        <div class="card__body">
          <h3 class="card__title">${esc(p.title)}</h3>
          <p class="card__excerpt">${esc(p.excerpt)}</p>
          <a class="ui link-underline" href="#">Discover more</a>
        </div>
      </article>`).join("");
  }
}

/* ---- Collection ---- */
async function hydrateCollection() {
  const list = await groq(`*[_type=="product" && collection=="made-in-usa"] | order(order asc) ${PRODUCT_CARD}`);
  if (!list?.length) return;
  const grid = document.getElementById("collection-grid");
  if (grid) grid.innerHTML = list.map(cardHTML).join("");
  const count = document.querySelector(".toolbar__count");
  if (count) count.textContent = `${list.length} products`;
}

/* ---- Product ---- */
async function hydrateProduct() {
  const slug = document.body.dataset.slug;
  if (!slug) return;
  const p = await groq(`*[_type=="product" && slug.current=="${slug}"][0]{
    title, price, description, sizes, care, origin,
    "imageUrl": image.asset->url,
    "related": related[]->${PRODUCT_CARD}
  }`);
  if (!p) return;

  const set = (sel, val) => { const n = document.querySelector(sel); if (n && val) n.textContent = val; };
  set(".buybox h1", p.title);
  set(".buybox__price", money(p.price));

  if (p.description) {
    const desc = document.querySelector(".buybox__desc");
    if (desc) desc.innerHTML = p.description.split(/\n\s*\n/).map((t) => `<p>${esc(t)}</p>`).join("");
  }

  if (p.imageUrl) {
    const main = document.querySelector(".product__gallery .ph--tall");
    if (main) {
      main.classList.add("has-img");
      main.innerHTML = `<img src="${p.imageUrl}?w=1400&fit=max&auto=format" alt="${esc(p.title)}">`;
    }
  }

  if (p.sizes?.length) {
    const row = document.querySelector(".sizes");
    if (row) {
      row.innerHTML = `<span class="sizes__label">Size:</span>` +
        p.sizes.map((s, i) => `<button class="size-pill ${i === 0 ? "is-active" : ""}">${esc(s)}</button>`).join("");
      row.querySelectorAll(".size-pill").forEach((btn) => btn.addEventListener("click", () => {
        row.querySelectorAll(".size-pill").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      }));
    }
  }

  document.querySelectorAll(".accordion").forEach((acc) => {
    const label = acc.querySelector("summary")?.textContent.trim();
    const body = acc.querySelector(".accordion__body");
    if (!body) return;
    if (label === "Care" && p.care) body.innerHTML = p.care.split(/\n\s*\n/).map((t) => `<p>${esc(t)}</p>`).join("");
    if (label === "Origin" && p.origin) body.innerHTML = `<p>${esc(p.origin)}</p>`;
  });

  if (p.related?.length) {
    const grid = document.querySelector(".grid--4");
    if (grid) grid.innerHTML = p.related.map(cardHTML).join("");
  }
}

/* ---- Init ---- */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "home") hydrateHome();
  if (page === "collection") hydrateCollection();
  if (page === "product") hydrateProduct();
});
