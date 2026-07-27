/* ============================================================
   Muu Blanco — i18n engine (ES / EN / KO / JA)
   ============================================================ */
(function () {
  const SUPPORTED = ["es", "en", "ko", "ja", "zh", "hi"];
  const DEFAULT_LANG = "es";
  const LABELS = { es: "ES", en: "EN", ko: "한국어", ja: "日本語", zh: "中文", hi: "हिन्दी" };

  function getLang() {
    const saved = localStorage.getItem("lang");
    return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
  }

  function getByPath(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  function applyDict(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = getByPath(dict, key);
      if (val !== undefined) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        const val = getByPath(dict, key);
        if (val !== undefined) el.setAttribute(attr, val);
      });
    });
  }

  function buildSwitcher(lang) {
    document.querySelectorAll(".lang-switch").forEach((el) => {
      el.innerHTML = SUPPORTED.map((l) =>
        `<button type="button" data-lang="${l}" aria-current="${l === lang}">${LABELS[l]}</button>`
      ).join("");
      el.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => setLang(b.dataset.lang));
      });
    });
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang === "es" ? "es" : lang;
    fetch(`data/i18n/${lang}.json`, { cache: "no-store" })
      .then((r) => r.json())
      .then((dict) => {
        window.__i18nDict = dict;
        applyDict(dict);
        buildSwitcher(lang);
        document.dispatchEvent(new CustomEvent("langchange", { detail: { lang, dict } }));
      })
      .catch(() => {});
  }

  window.i18n = { getLang, setLang, getByPath, SUPPORTED };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setLang(getLang()));
  } else {
    setLang(getLang());
  }
})();
