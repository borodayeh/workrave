/* Workrave — app behaviour.
   Each subsystem is isolated: a failure in one never disables the rest. */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ================= Navigation (essential) ================= */

  const TITLES = {
    today: "Today",
    exercises: "Exercises",
    pause: "Pause",
    statistics: "Statistics",
    settings: "Settings"
  };

  function setAllThumbs() {
    try {
      $$(".seg").forEach((seg) => {
        const thumb = $(".seg-thumb", seg);
        const active = $("button.on", seg) || $("button", seg);
        if (!thumb || !active) return;
        thumb.style.width = active.offsetWidth + "px";
        thumb.style.transform = "translateX(" + active.offsetLeft + "px)";
      });
    } catch (e) { console.error("thumbs", e); }
  }

  function showPage(id) {
    try {
      if (!TITLES[id]) id = "today";
      $$(".nav-item").forEach((btn) => {
        const on = btn.dataset.page === id;
        if (on) btn.setAttribute("aria-current", "page");
        else btn.removeAttribute("aria-current");
      });
      $$(".pages > .page").forEach((page) => {
        const on = page.dataset.page === id;
        page.hidden = !on;
        if (on) {
          page.classList.remove("page-fade");
          void page.offsetWidth;
          page.classList.add("page-fade");
        }
      });
      const t = $("#toolbar-title");
      if (t) t.textContent = TITLES[id];
      requestAnimationFrame(setAllThumbs);
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    } catch (e) { console.error("showPage", e); }
  }

  $$(".nav-item").forEach((btn) =>
    btn.addEventListener("click", () => showPage(btn.dataset.page))
  );

  /* ================= Segmented controls ================= */

  try {
    $$(".seg").forEach((seg) => {
      $$("button", seg).forEach((btn) =>
        btn.addEventListener("click", () => {
          $$("button", seg).forEach((b) => b.classList.toggle("on", b === btn));
          setThumb(seg);
        })
      );
    });
    function setThumb(seg) {
      const thumb = $(".seg-thumb", seg);
      const active = $("button.on", seg) || $("button", seg);
      if (!thumb || !active) return;
      thumb.style.width = active.offsetWidth + "px";
      thumb.style.transform = "translateX(" + active.offsetLeft + "px)";
    }
  } catch (e) { console.error("seg", e); }

  /* ================= Switches ================= */

  try {
    $$(".switch").forEach((sw) =>
      sw.addEventListener("click", () => {
        const on = sw.classList.toggle("on");
        sw.setAttribute("aria-checked", on ? "true" : "false");
      })
    );
  } catch (e) { console.error("switches", e); }

  /* ================= Theme ================= */

  try {
    function applyTheme(mode) {
      const root = document.documentElement;
      if (mode === "dark" || mode === "light" || mode === "auto") {
        root.setAttribute("data-theme", mode);
        try { localStorage.setItem("workrave-theme", mode); } catch (e) {}
      }
      requestAnimationFrame(setAllThumbs);
    }
    let mode = "light";
    try { mode = localStorage.getItem("workrave-theme") || "light"; } catch (e) {}
    applyTheme(mode);
    const seg = $("#seg-theme");
    if (seg) {
      $$("button", seg).forEach((b) => b.classList.toggle("on", b.dataset.v === mode));
      $$("button", seg).forEach((b) =>
        b.addEventListener("click", () => applyTheme(b.dataset.v))
      );
    }
  } catch (e) { console.error("theme", e); }

  /* ================= Hero countdown (live) ================= */

  try {
    const heroTime = $(".hero-time");
    const heroSub = $(".hero-sub");
    let heroSec = 3 * 60 + 42;
    function tickHero() {
      heroSec = heroSec <= 0 ? 5 * 60 : heroSec - 1;
      if (heroTime) {
        const m = String(Math.floor(heroSec / 60)).padStart(2, "0");
        const s = String(heroSec % 60).padStart(2, "0");
        heroTime.textContent = m + ":" + s;
      }
      if (heroSub) {
        const m = Math.floor(heroSec / 60);
        const s = heroSec % 60;
        heroSub.textContent = "in " + m + " minute" + (m === 1 ? "" : "s") + " " + s + " second" + (s === 1 ? "" : "s");
      }
      const ringVal = $(".ring .value");
      if (ringVal) {
        const total = 45 * 60;
        const frac = Math.min(1, Math.max(0, 1 - heroSec / total));
        const C = 2 * Math.PI * 54;
        ringVal.setAttribute("stroke-dasharray", (C * frac).toFixed(1) + " " + (C * (1 - frac)).toFixed(1));
      }
      const stSub = $(".sidebar-status .st-sub");
      if (stSub) {
        const m = String(Math.floor(heroSec / 60)).padStart(2, "0");
        const s = String(heroSec % 60).padStart(2, "0");
        stSub.textContent = "Next break in " + m + ":" + s;
      }
    }
    setInterval(tickHero, 1000);
    tickHero();
  } catch (e) { console.error("hero", e); }

  /* ================= Break overlay + exercise carousel ================= */

  try {
    const overlay = $("#break-overlay");
    const dots = $$("#break-dots .dot");
    let exIndex = 0;

    function renderExercise() {
      const ex = (typeof EXERCISES !== "undefined" ? EXERCISES : [])[exIndex];
      if (!ex) return;
      $("#break-ex-name").textContent = ex.name;
      $("#break-ex-sub").textContent = ex.description;
      $("#break-ex-img").src = ex.images[0];
      dots.forEach((d, i) => {
        d.classList.toggle("on", i === exIndex);
        d.setAttribute("aria-selected", i === exIndex ? "true" : "false");
      });
    }

    let breakTimer = null;
    let breakLeft = 5 * 60;

    function openBreak() {
      if (!overlay) return;
      exIndex = 0;
      breakLeft = 5 * 60;
      renderExercise();
      overlay.setAttribute("aria-hidden", "false");
      if (breakTimer) clearInterval(breakTimer);
      breakTimer = setInterval(() => {
        breakLeft = Math.max(0, breakLeft - 1);
        const el = $("#break-count");
        if (el) {
          const m = String(Math.floor(breakLeft / 60)).padStart(2, "0");
          const s = String(breakLeft % 60).padStart(2, "0");
          el.textContent = m + ":" + s;
        }
        const fill = $("#break-progress-fill");
        if (fill) fill.style.width = ((1 - breakLeft / 300) * 100).toFixed(1) + "%";
      }, 1000);
    }

    function closeBreak() {
      if (!overlay) return;
      overlay.setAttribute("aria-hidden", "true");
      if (breakTimer) { clearInterval(breakTimer); breakTimer = null; }
    }

    $$('[data-action="take-break"]').forEach((el) => el.addEventListener("click", openBreak));
    $$('[data-action="open-exercises"]').forEach((el) =>
      el.addEventListener("click", () => showPage("exercises"))
    );
    const pauseNow = $("#btn-pause-now");
    if (pauseNow) pauseNow.addEventListener("click", openBreak);
    const doneBtn = $("#break-done");
    if (doneBtn) doneBtn.addEventListener("click", closeBreak);
    const skipBtn = $("#break-skip");
    if (skipBtn) skipBtn.addEventListener("click", () => {
      exIndex = (exIndex + 1) % Math.max(1, (typeof EXERCISES !== "undefined" ? EXERCISES.length : 1));
      renderExercise();
    });
    dots.forEach((d, i) => d.addEventListener("click", () => { exIndex = i; renderExercise(); }));

    document.addEventListener("keydown", (e) => {
      try {
        if (e.key === "Escape") closeBreak();
        if (overlay && overlay.getAttribute("aria-hidden") === "false") {
          const n = Math.max(1, (typeof EXERCISES !== "undefined" ? EXERCISES.length : 1));
          if (e.key === "ArrowRight") { exIndex = (exIndex + 1) % n; renderExercise(); }
          if (e.key === "ArrowLeft") { exIndex = (exIndex - 1 + n) % n; renderExercise(); }
        }
      } catch (err) { console.error("keys", err); }
    });
  } catch (e) { console.error("overlay", e); }

  /* ================= Pause demo button ================= */

  try {
    const btnPause = $("#btn-pause");
    if (btnPause) {
      btnPause.addEventListener("click", () => {
        const paused = btnPause.dataset.paused === "1";
        btnPause.dataset.paused = paused ? "0" : "1";
        btnPause.textContent = paused ? "Pause" : "Resume";
      });
    }
  } catch (e) { console.error("pause", e); }

  /* ================= Boot ================= */

  try {
    const start = (location.hash || "").replace("#", "");
    showPage(TITLES[start] ? start : "today");
    setAllThumbs();
    window.addEventListener("resize", setAllThumbs);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setAllThumbs);
  } catch (e) { console.error("boot", e); }
})();
