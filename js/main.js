/* ============================================================
   Muu Blanco — site logic (multi-page)
   ============================================================ */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const esc = (s) => (s || "").toString().replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let k = 0; k < text.length; k++) {
    const c = text[k], n = text[k + 1];
    if (q) {
      if (c === '"' && n === '"') { field += '"'; k++; }
      else if (c === '"') { q = false; }
      else field += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== "\r") field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/* ---------- Intro (home page only) ---------- */
(function initIntro() {
  const intro = $("#intro");
  if (!intro) return;
  let revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    intro.classList.add("is-revealed");
    const hint = $("#introHint");
    if (hint) hint.textContent = "";
  }
  function dismiss(e) {
    if (e) e.preventDefault();
    intro.classList.add("is-hidden");
    document.body.style.overflow = "";
    setTimeout(() => intro.remove(), 700);
  }

  document.body.style.overflow = "hidden";

  intro.addEventListener("click", (e) => {
    if (e.target.closest(".intro__actions")) return;
    reveal();
  });
  intro.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") reveal(); });

  $("#introEnter") && $("#introEnter").addEventListener("click", (e) => {
    if (!revealed) { reveal(); e.preventDefault(); return; }
    dismiss(e);
  });
  $("#introSkip") && $("#introSkip").addEventListener("click", dismiss);
})();

/* ---------- Mobile menu ---------- */
(function initNav() {
  const toggle = $("#navToggle");
  const nav = $("#siteNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
})();

/* ---------- Store / Galería (Store page only) ---------- */
// One Google Sheet published as CSV = the gallery catalog.
// Sheets → Archivo → Compartir → Publicar en la web → CSV, paste the sheet id below.
const STORE_SHEET_ID = ""; // paste the Google Sheet id here when ready

(function initStore() {
  const root = document.querySelector("#store");
  if (!root) return;

  const driveImg = (id, w = 1200) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;
  const driveView = (id) => `https://drive.google.com/file/d/${id}/view`;
  const driveIds = (s) => [...(s || "").matchAll(/(?:id=|\/d\/)([A-Za-z0-9_-]{20,})/g)].map((m) => m[1]);

  function indexColumns(header) {
    const n = (x) => (x || "").toString().toLowerCase();
    const find = (kws) => header.findIndex((h) => kws.some((k) => n(h).includes(k)));
    return {
      title: find(["título", "titulo", "title"]),
      images: find(["imagen", "image"]),
      price: find(["precio", "price"]),
      technique: find(["técnica", "tecnica", "medio", "medium"]),
      size: find(["tamaño", "tamano", "dimensiones", "size"]),
      available: find(["disponible", "available"]),
      description: find(["descripción", "descripcion", "description"]),
      date: find(["fecha", "date"]),
    };
  }

  function rowsToWorks(rows) {
    if (!rows.length) return [];
    const c = indexColumns(rows[0]);
    const get = (r, i) => (i >= 0 && i < r.length ? (r[i] || "").trim() : "");
    return rows.slice(1).map((r) => ({
      title: get(r, c.title),
      imageIds: driveIds(get(r, c.images)),
      price: get(r, c.price),
      technique: get(r, c.technique),
      size: get(r, c.size),
      available: get(r, c.available),
      description: get(r, c.description),
      date: get(r, c.date),
    })).filter((w) => w.title || w.imageIds.length);
  }

  function metaHtml(w) {
    const p = [];
    if (w.price) p.push(`<span class="badge">${esc(w.price)}</span>`);
    if (w.available) p.push(`<span>${/^(s[ií]|yes|true)/i.test(w.available) ? "Disponible" : esc(w.available)}</span>`);
    return p.join("");
  }

  function cardHtml(w, i) {
    const first = w.imageIds[0];
    const img = first
      ? `<img src="${driveImg(first, 800)}" alt="${esc(w.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove();this.closest('.art-card__img').classList.add('is-empty')">`
      : "";
    const count = w.imageIds.length > 1 ? `<span class="art-card__count">${w.imageIds.length} imágenes</span>` : "";
    return `<button class="art-card" data-i="${i}" aria-label="Ver ${esc(w.title)}">
      <span class="art-card__img${first ? "" : " is-empty"}">${img}<span class="art-card__ph">Imagen en Google Drive</span>${count}</span>
      <span class="art-card__body">
        <span class="art-card__name">${esc(w.title)}</span>
        <span class="art-card__meta">${metaHtml(w)}</span>
      </span>
    </button>`;
  }

  let WORKS = [];
  let cur = null, idx = 0;
  const detail = document.querySelector("#storeDetail");

  function showSlide(n) {
    const imgs = cur.imageIds;
    const total = imgs.length || 1;
    idx = ((n % total) + total) % total;
    const imgEl = document.querySelector("#sdImg");
    const ph = document.querySelector("#sdPh");
    if (imgs.length) {
      imgEl.style.display = ""; ph.style.display = "none";
      imgEl.onerror = () => { imgEl.style.display = "none"; ph.style.display = "grid"; };
      imgEl.src = driveImg(imgs[idx], 1600); imgEl.alt = cur.title;
    } else { imgEl.style.display = "none"; ph.style.display = "grid"; }
    document.querySelectorAll("#sdDots button").forEach((d, k) => d.setAttribute("aria-current", String(k === idx)));
    const multi = imgs.length > 1;
    document.querySelector("#sdPrev").style.display = multi ? "" : "none";
    document.querySelector("#sdNext").style.display = multi ? "" : "none";
    document.querySelector("#sdDots").style.display = multi ? "" : "none";
  }

  function openDetail(i) {
    if (!detail) return;
    cur = WORKS[i]; idx = 0;
    document.querySelector("#sdName").textContent = cur.title;
    document.querySelector("#sdMeta").innerHTML = metaHtml(cur);
    const bits = [];
    if (cur.technique || cur.size) bits.push(`<p class="biblio-entry__medium">${[esc(cur.technique), esc(cur.size)].filter(Boolean).join(" · ")}</p>`);
    if (cur.description) bits.push(`<p>${esc(cur.description)}</p>`);
    bits.push(`<p class="detail__link"><a href="mailto:drmuuuusica@gmail.com?subject=${encodeURIComponent("Consulta — " + cur.title)}">Consultar disponibilidad ↗</a></p>`);
    document.querySelector("#sdBody").innerHTML = bits.join("");
    document.querySelector("#sdDots").innerHTML = cur.imageIds.map((_, k) => `<button data-k="${k}" aria-label="Imagen ${k + 1}"></button>`).join("");
    document.querySelectorAll("#sdDots button").forEach((d) => d.addEventListener("click", () => showSlide(+d.dataset.k)));
    showSlide(0);
    detail.classList.add("is-open");
    detail.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDetail() {
    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (detail) {
    document.querySelector("#storeDetailClose").addEventListener("click", closeDetail);
    document.querySelector("#sdPrev").addEventListener("click", () => showSlide(idx - 1));
    document.querySelector("#sdNext").addEventListener("click", () => showSlide(idx + 1));
    detail.addEventListener("click", (e) => { if (e.target === detail) closeDetail(); });
    document.addEventListener("keydown", (e) => {
      if (!detail.classList.contains("is-open")) return;
      if (e.key === "Escape") closeDetail();
      else if (e.key === "ArrowLeft") showSlide(idx - 1);
      else if (e.key === "ArrowRight") showSlide(idx + 1);
    });
  }

  function render(works) {
    WORKS = works;
    root.innerHTML = works.length
      ? `<div class="artfair-grid">${works.map(cardHtml).join("")}</div>`
      : '<p class="muted">Aún no hay obras cargadas.</p>';
    root.querySelectorAll(".art-card").forEach((b) => b.addEventListener("click", () => openDetail(+b.dataset.i)));
  }

  const csvUrl = (id) => `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;

  if (!STORE_SHEET_ID) {
    root.innerHTML = `
      <div class="open-call">
        <p class="open-call__status">Galería en preparación</p>
        <p class="open-call__text">Crea una Google Sheet con estas columnas y pega su ID en <code>STORE_SHEET_ID</code> (js/main.js): <code>Título, Imagen(es), Precio, Técnica, Tamaño, Disponible, Descripción, Fecha</code>. Plantilla de ejemplo: <code>data/store-template.csv</code>.</p>
      </div>`;
    return;
  }

  fetch(csvUrl(STORE_SHEET_ID), { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then((text) => render(rowsToWorks(parseCSV(text))))
    .catch((err) => {
      console.warn("Store fetch failed:", err);
      root.innerHTML = '<p class="muted">No se pudo cargar la galería.</p>';
    });
})();
