/* Workrave — app behaviour */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ================= Navigation ================= */

  const TITLES = {
    today: "Today",
    exercises: "Exercises",
    pause: "Pause",
    statistics: "Statistics",
    settings: "Settings"
  };

  function showPage(id) {
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
        void page.offsetWidth; /* restart animation */
        page.classList.add("page-fade");
      }
    });
    $("#toolbar-title").textContent = TITLES[id];
    /* segmented thumbs need a re-measure when their page becomes visible */
    requestAnimationFrame(setAllThumbs);
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }

  $$(".nav-item").forEach((btn) =>
    btn.addEventListener("click", () => showPage(btn.dataset.page))
  );

  /* ================= Segmented controls ================= */

  function setThumb(seg) {
    const thumb = $(".seg-thumb", seg);
    const active = $("button.on", seg) || $("button", seg);
    if (!thumb || !active) return;
    thumb.style.width = active.offsetWidth + "px";
    thumb.style.transform = "translateX(" + active.offsetLeft + "px)";
  }
  function setAllThumbs() {
    $$(".seg").forEach(setThumb);
  }

  $$(".seg").forEach((seg) => {
    $$("button", seg).forEach((btn) =>
      btn.addEventListener("click", () => {
        $$("button", seg).forEach((b) => b.classList.toggle("on", b === btn));
        setThumb(seg);
      })
    );
  });

  /* ================= Switches + sliders ================= */

  $$(".switch").forEach((sw) =>
    sw.addEventListener("click", () => {
      const on = sw.classList.toggle("on");
      sw.setAttribute("aria-checked", on ? "true" : "false");
    })
  );

  /* ================= Theme ================= */

  function applyTheme(mode) {
    const root = document.documentElement;
    if (mode === "dark" || mode === "light" || mode === "auto") {
      root.setAttribute("data-theme", mode);
      try { localStorage.setItem("workrave-theme", mode); } catch (e) {}
    }
    requestAnimationFrame(setAllThumbs);
  }

  (function initTheme() {
    let mode = "light";
    try { mode = localStorage.getItem("workrave-theme") || "light"; } catch (e) {}
    applyTheme(mode);
    const seg = $("#seg-theme");
    if (seg) {
      $$("button", seg).forEach((b) => b.classList.toggle("on", b.dataset.v === mode));
    }
  })();

  /* ================= Hero countdown (live demo clock) ================= */

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
  }
  setInterval(tickHero, 1000);
  tickHero();

  /* ================= Break overlay + exercise carousel ================= */

  const overlay = $("#break-overlay");
  const dots = $$("#break-dots .dot");
  let exIndex = 0;

  function renderExercise() {
    const ex = EXERCISES[exIndex];
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
    document.body.style.overflow = "hidden";
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
  const pauseNow = $("#btn-pause-now");
  if (pauseNow) pauseNow.addEventListener("click", openBreak);
  const doneBtn = $("#break-done");
  if (doneBtn) doneBtn.addEventListener("click", closeBreak);
  const skipBtn = $("#break-skip");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      exIndex = (exIndex + 1) % EXERCISES.length;
      renderExercise();
    });
  }
  dots.forEach((d, i) => d.addEventListener("click", () => { exIndex = i; renderExercise(); }));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBreak();
    if (overlay && overlay.getAttribute("aria-hidden") === "false") {
      if (e.key === "ArrowRight") { exIndex = (exIndex + 1) % EXERCISES.length; renderExercise(); }
      if (e.key === "ArrowLeft") { exIndex = (exIndex - 1 + EXERCISES.length) % EXERCISES.length; renderExercise(); }
    }
  });

  /* Open directly into an exercise preview from the grid */
  $$('[data-action="open-exercises"]').forEach((el) =>
    el.addEventListener("click", () => showPage("exercises"))
  );

  /* ================= Pause page demo buttons ================= */

  const btnPause = $("#btn-pause");
  if (btnPause) {
    btnPause.addEventListener("click", () => {
      const paused = btnPause.dataset.paused === "1";
      btnPause.dataset.paused = paused ? "0" : "1";
      btnPause.textContent = paused ? "Pause" : "Resume";
      btnPause.classList.toggle("ghost", !paused);
    });
  }

  /* ================= Boot ================= */

  const start = (location.hash || "").replace("#", "");
  showPage(TITLES[start] ? start : "today");
  setAllThumbs();
  window.addEventListener("resize", setAllThumbs);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setAllThumbs);
  }
})();
