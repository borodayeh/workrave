/* Workrave — app behaviour */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ================= Clock & simulated time =================
     Demo speed: press D to cycle 1× / 30× / 120× (no UI chrome —
     this is a prototype). The break overlay fires when a timer expires. */

  let speed = 1;

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  function fmtMin(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function fmtClock(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  /* ================= Navigation ================= */

  const titles = {
    today: "Today",
    breaks: "Breaks",
    exercises: "Exercises",
    history: "History",
    settings: "Settings",
  };

  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".nav-item").forEach((b) => b.removeAttribute("aria-current"));
      btn.setAttribute("aria-current", "page");
      const page = btn.dataset.page;
      $$(".page").forEach((p) => p.classList.remove("is-active"));
      $("#page-" + page).classList.add("is-active");
      $("#toolbar-title").textContent = titles[page] || "";
      requestAnimationFrame(() => $$(".segmented").forEach(moveThumb));
      if (page === "history") animateHistory();
    });
  });

  /* ================= Segmented controls ================= */

  function moveThumb(seg) {
    const selected = $('button[aria-selected="true"]', seg);
    const thumb = $(".thumb", seg);
    if (!selected || !thumb) return;
    thumb.style.left = selected.offsetLeft + "px";
    thumb.style.width = selected.offsetWidth + "px";
  }

  $$(".segmented").forEach((seg) => {
    seg.addEventListener("click", (e) => {
      const btn = e.target.closest("button[role=tab]");
      if (!btn) return;
      $$("button[role=tab]", seg).forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      moveThumb(seg);
      if (seg.id === "mode-seg" && btn.dataset.mode) {
        const names = { normal: "Normal", quiet: "Quiet", suspended: "Suspended" };
        $("#mode-name").textContent = names[btn.dataset.mode];
        $("#status-mode").textContent =
          btn.dataset.mode === "normal" ? "Active" : names[btn.dataset.mode];
      }
    });
    requestAnimationFrame(() => moveThumb(seg));
  });
  window.addEventListener("resize", () => $$(".segmented").forEach(moveThumb));

  /* ================= Switches, sliders, steppers ================= */

  $$(".switch").forEach((sw) => {
    sw.addEventListener("click", () => {
      sw.setAttribute("aria-checked", String(sw.getAttribute("aria-checked") !== "true"));
    });
  });

  function paintSlider(slider) {
    const min = +slider.min || 0;
    const max = +slider.max || 100;
    const pct = ((+slider.value - min) / (max - min)) * 100;
    slider.style.setProperty("--fill-pct", pct + "%");
  }

  $$(".slider").forEach((sl) => {
    paintSlider(sl);
    sl.addEventListener("input", () => paintSlider(sl));
  });

  const volumeSlider = $("#volume-slider");
  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      $("#volume-val").textContent = volumeSlider.value;
    });
  }

  $$(".stepper").forEach((st) => {
    const min = +st.dataset.min;
    const max = +st.dataset.max;
    const step = +st.dataset.step;
    const unit = st.dataset.unit || "";
    let val = +st.dataset.value;

    const valEl = document.createElement("div");
    valEl.className = "val";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "–";
    minus.setAttribute("aria-label", "Decrease");
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase");

    const render = () => {
      valEl.textContent = val + unit;
    };
    minus.addEventListener("click", () => {
      val = Math.max(min, val - step);
      render();
    });
    plus.addEventListener("click", () => {
      val = Math.min(max, val + step);
      render();
    });

    st.append(minus, valEl, plus);
    render();
  });

  /* ================= Theme ================= */

  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    ["theme-seg", "theme-seg-2"].forEach((id) => {
      const seg = $("#" + id);
      if (!seg) return;
      $$("button", seg).forEach((b) =>
        b.setAttribute("aria-selected", String(b.dataset.theme === theme))
      );
      requestAnimationFrame(() => moveThumb(seg));
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-theme]");
    if (btn) applyTheme(btn.dataset.theme);
  });

  /* ================= Today: live timers ================= */

  const heroMin = $("#hero-min");
  const heroSec = $("#hero-sec");
  const heroFill = $("#hero-fill");
  const statusNext = $("#status-next");

  function renderTimers() {
    const t = WR.timers;

    // hero — rest break countdown
    const restRem = t.rest.limit - t.rest.elapsed;
    if (restRem > 0) {
      const m = Math.floor(restRem / 60);
      const s = Math.floor(restRem % 60);
      heroMin.textContent = String(m).padStart(2, "0");
      heroSec.textContent = String(s).padStart(2, "0");
    } else {
      heroMin.textContent = "00";
      heroSec.textContent = "00";
    }
    heroFill.style.width = Math.min(100, (t.rest.elapsed / t.rest.limit) * 100) + "%";
    statusNext.textContent = restRem > 0 ? fmt(restRem) : "now";

    // window text: "14:02 – 14:47"
    const now = new Date();
    const start = new Date(now.getTime() - t.rest.elapsed * 1000);
    const end = new Date(now.getTime() + Math.max(0, restRem) * 1000);
    $("#hero-window").textContent = `${fmtClock(start)} – ${fmtClock(end)}`;

    // rows
    const microRem = t.micro.limit - t.micro.elapsed;
    $("#micro-in").textContent = microRem > 0 ? fmt(microRem) : "now";
    $("#micro-fill").style.width = Math.min(100, (t.micro.elapsed / t.micro.limit) * 100) + "%";

    $("#rest-in").textContent = restRem > 0 ? fmt(restRem) : "now";
    $("#rest-fill").style.width = Math.min(100, (t.rest.elapsed / t.rest.limit) * 100) + "%";

    const dailyLeft = t.daily.limit - t.daily.elapsed;
    $("#daily-left").textContent = dailyLeft > 0 ? fmtMin(dailyLeft) : "0m";
    $("#daily-fill").style.width = Math.min(100, (t.daily.elapsed / t.daily.limit) * 100) + "%";
  }

  function renderDate() {
    const el = $("#today-date");
    if (el) {
      el.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  }

  /* ================= Break overlay — real exercise player ================= */

  const overlay = $("#break-overlay");
  let player = {
    exIndex: 0,
    seqPos: 0,
    seqElapsed: 0, // seconds shown for current image
    remaining: 0,
    running: false,
    timer: null,
  };

  function currentImage() {
    const ex = WR.exercises[player.exIndex];
    let pos = player.seqPos % ex.images.length;
    return ex.images[pos];
  }

  function renderPlayer() {
    const ex = WR.exercises[player.exIndex];
    const img = currentImage();
    const el = $("#brk-img");
    el.src = img.src;
    el.alt = ex.title;
    el.classList.toggle("mirrored", !!img.mirror);

    $("#brk-ex-title").textContent = ex.title;
    $("#brk-ex-desc").textContent = ex.desc;
    $("#brk-count").textContent = fmt(player.remaining);

    // step indicators for the image sequence
    const steps = $("#brk-steps");
    steps.innerHTML = "";
    ex.images.forEach((_, i) => {
      const s = document.createElement("div");
      s.className = "step";
      if (i < player.seqPos % ex.images.length) s.classList.add("done");
      if (i === player.seqPos % ex.images.length) {
        s.classList.add("active");
        s.style.setProperty("--step-dur", img.dur + "s");
      }
      steps.appendChild(s);
    });
  }

  function openBreak(kind) {
    const t = WR.timers[kind === "micro" ? "micro" : "rest"];
    player.remaining = t.breakLen || 60;
    player.exIndex = Math.floor(Math.random() * WR.exercises.length);
    player.seqPos = 0;
    player.seqElapsed = 0;
    player.running = true;

    $("#brk-kicker").textContent = kind === "micro" ? "Micro-break" : "Rest break";
    $("#brk-title").textContent =
      kind === "micro" ? "Time for a micro-break?" : "You need a rest break…";

    overlay.classList.add("is-open");
    renderPlayer();

    clearInterval(player.timer);
    player.timer = setInterval(tickPlayer, 1000);
  }

  function closeBreak() {
    overlay.classList.remove("is-open");
    player.running = false;
    clearInterval(player.timer);
    const t = WR.timers;
    t.micro.elapsed = 0;
    t.rest.elapsed = 0;
  }

  function tickPlayer() {
    player.remaining -= 1;
    const ex = WR.exercises[player.exIndex];
    player.seqElapsed += 1;
    const img = currentImage();
    if (player.seqElapsed >= img.dur) {
      player.seqElapsed = 0;
      player.seqPos += 1;
      if (player.seqPos >= ex.images.length) {
        player.seqPos = 0; // loop the sequence until the break ends
      }
      renderPlayer();
    } else {
      $("#brk-count").textContent = fmt(player.remaining);
    }
    if (player.remaining <= 0) closeBreak();
  }

  function nextExercise() {
    player.exIndex = (player.exIndex + 1) % WR.exercises.length;
    player.seqPos = 0;
    player.seqElapsed = 0;
    renderPlayer();
  }

  $("#btn-break-now").addEventListener("click", () => openBreak("rest"));
  $("#btn-preview-break").addEventListener("click", () => openBreak("rest"));
  $("#brk-next").addEventListener("click", nextExercise);
  $("#brk-postpone").addEventListener("click", closeBreak);
  $("#brk-skip").addEventListener("click", closeBreak);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeBreak();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBreak();
    if ((e.key === "d" || e.key === "D") && !e.metaKey && !e.ctrlKey) {
      speed = speed === 1 ? 30 : speed === 30 ? 120 : 1;
    }
  });

  /* ================= Simulation loop ================= */

  let last = performance.now();

  function frame(now) {
    const dt = ((now - last) / 1000) * speed;
    last = now;

    const t = WR.timers;
    if (!player.running) {
      t.micro.elapsed += dt;
      t.rest.elapsed += dt;
      t.daily.elapsed += dt;

      if (t.micro.elapsed >= t.micro.limit + t.micro.breakLen) t.micro.elapsed = 0;
      if (t.rest.elapsed >= t.rest.limit + t.rest.breakLen) t.rest.elapsed = 0;

      // fire a break when a timer expires
      if (t.micro.elapsed >= t.micro.limit && t.micro.breakLen > 0 && t.micro.elapsed - dt < t.micro.limit) {
        openBreak("micro");
      } else if (t.rest.elapsed >= t.rest.limit && t.rest.elapsed - dt < t.rest.limit) {
        openBreak("rest");
      }
    }

    renderTimers();
    requestAnimationFrame(frame);
  }

  /* ================= Today: hour chart ================= */

  function buildHourChart() {
    const chart = $("#hour-chart");
    if (!chart || chart.childElementCount) return;
    const max = Math.max(...WR.hours.map((h) => h.active + h.brk)) * 1.1;
    WR.hours.forEach((h, i) => {
      const col = document.createElement("div");
      col.className = "hour-col";
      col.title = `${h.active + h.brk} min`;
      col.innerHTML = `
        <div class="seg-a" style="--ha:${((h.active / max) * 100).toFixed(1)}%; --d:${i * 45}ms"></div>
        <div class="seg-b" style="--hb:${((h.brk / max) * 100).toFixed(1)}%; --d:${i * 45}ms"></div>`;
      chart.appendChild(col);
    });
  }

  /* ================= History ================= */

  function buildWeekChart() {
    const chart = $("#week-chart");
    if (!chart || chart.childElementCount) return;
    const max = Math.max(...WR.week.map((d) => d.active + d.brk)) * 1.12;
    WR.week.forEach((d, i) => {
      const col = document.createElement("div");
      col.className = "week-col";
      col.innerHTML = `
        <div class="w-break" style="--wb:${((d.brk / max) * 100).toFixed(1)}%; --d:${i * 60}ms"></div>
        <div class="w-active" style="--wa:${((d.active / max) * 100).toFixed(1)}%; --d:${i * 60}ms"></div>`;
      chart.appendChild(col);
    });
  }

  function buildDayRows() {
    const list = $("#day-rows");
    if (!list || list.childElementCount) return;
    const max = Math.max(...WR.week.map((d) => d.active + d.brk)) * 1.12;
    WR.week.forEach((d) => {
      const row = document.createElement("div");
      row.className = "day-row";
      const total = d.active + d.brk;
      row.innerHTML = `
        <div class="day-name">${d.day}</div>
        <div class="day-track" style="max-width:${((total / max) * 100).toFixed(1)}%">
          <div class="a" style="flex:${d.active}"></div>
          <div class="b" style="flex:${d.brk}"></div>
        </div>
        <div class="day-val">${Math.floor(d.active / 60)}h ${d.active % 60}m</div>`;
      list.appendChild(row);
    });
  }

  function animateHistory() {
    buildWeekChart();
    buildDayRows();
  }

  /* ================= Exercises ================= */

  function renderExercises(filter) {
    const list = $("#exercise-list");
    if (!list) return;
    const q = (filter || "").trim().toLowerCase();
    list.innerHTML = "";
    WR.exercises
      .filter((ex) => !q || ex.title.toLowerCase().includes(q) || ex.desc.toLowerCase().includes(q))
      .forEach((ex, i) => {
        const idx = WR.exercises.indexOf(ex);
        const card = document.createElement("article");
        card.className = "exercise-card";
        card.style.animation = `page-in var(--duration-nav) var(--ease-nav) both ${i * 35}ms`;
        card.innerHTML = `
          <img src="${ex.images[0].src}" alt="${ex.title}" loading="lazy">
          <div class="ex-body">
            <div class="ex-title">${ex.title}</div>
            <p class="ex-desc">${ex.desc}</p>
            <div class="ex-meta">
              <span class="pill">${Math.floor(ex.total / 60) > 0 ? Math.floor(ex.total / 60) + " min" : ex.total + " s"}</span>
              <span>${ex.images.length} step${ex.images.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <button class="btn btn-secondary ex-play" data-ex="${idx}">Preview</button>`;
        list.appendChild(card);
      });
  }

  const search = $("#ex-search");
  if (search) {
    search.addEventListener("input", () => renderExercises(search.value));
    renderExercises("");
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-ex]");
    if (!btn) return;
    openBreak("rest");
    player.exIndex = +btn.dataset.ex;
    player.seqPos = 0;
    player.seqElapsed = 0;
    renderPlayer();
  });

  /* ================= Init ================= */

  renderDate();
  applyTheme("light");
  buildHourChart();
  renderTimers();
  requestAnimationFrame(frame);
})();
