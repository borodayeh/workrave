/* Workrave “Aurora” — app behaviour */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ================= Clock & demo speed ================= */

  const clockEl = $("#clock");
  let speed = 1;

  function tickClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ================= Navigation ================= */

  const titles = {
    dashboard: "Dashboard",
    breaks: "Breaks",
    stats: "Statistics",
    exercises: "Exercises",
    settings: "Settings",
    system: "Design System",
  };

  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".nav-item").forEach((b) => b.removeAttribute("aria-current"));
      btn.setAttribute("aria-current", "page");
      const page = btn.dataset.page;
      $$(".page").forEach((p) => p.classList.remove("is-active"));
      $("#page-" + page).classList.add("is-active");
      $("#page-title").textContent = titles[page] || "";
      // segmented thumbs of a freshly shown page need a real layout pass
      requestAnimationFrame(() => $$(".segmented").forEach(moveThumb));
      if (page === "stats") animateStats();
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
    });
    // initial thumb once layout settles
    requestAnimationFrame(() => moveThumb(seg));
  });
  window.addEventListener("resize", () => $$(".segmented").forEach(moveThumb));

  /* ================= Switches ================= */

  $$(".switch").forEach((sw) => {
    sw.addEventListener("click", () => {
      const on = sw.getAttribute("aria-checked") === "true";
      sw.setAttribute("aria-checked", String(!on));
    });
  });

  /* ================= Sliders ================= */

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

  const postponeSlider = $("#postpone-slider");
  if (postponeSlider) {
    postponeSlider.addEventListener("input", () => {
      $("#postpone-val").textContent = postponeSlider.value;
    });
  }

  const volumeSlider = $("#volume-slider");
  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => {
      $("#volume-val").textContent = volumeSlider.value;
    });
  }

  /* ================= Steppers ================= */

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
    minus.textContent = "−";
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
    const seg = $("#theme-seg");
    if (seg) {
      $$("button", seg).forEach((b) =>
        b.setAttribute("aria-selected", String(b.dataset.theme === theme))
      );
      requestAnimationFrame(() => moveThumb(seg));
    }
  }

  const themeSeg = $("#theme-seg");
  if (themeSeg) {
    themeSeg.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-theme]");
      if (btn) applyTheme(btn.dataset.theme);
    });
  }

  const themeToggle = $("#theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme") || "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    });
  }

  /* ================= Accent swatches ================= */

  $$("#accent-swatches .swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      $$("#accent-swatches .swatch").forEach((s) => s.setAttribute("aria-pressed", "false"));
      sw.setAttribute("aria-pressed", "true");
      const c = sw.dataset.accent;
      root.style.setProperty("--accent", c);
      root.style.setProperty("--accent-soft", `color-mix(in srgb, ${c} 14%, transparent)`);
    });
  });

  /* ================= Mode ================= */

  const modeNames = { normal: "Normal", quiet: "Quiet", suspended: "Suspended" };
  const modeIcons = { normal: "i-bolt", quiet: "i-moon", suspended: "i-pause" };
  const modeSeg = $("#mode-seg");

  if (modeSeg) {
    modeSeg.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-mode]");
      if (!btn) return;
      const mode = btn.dataset.mode;
      $("#mode-name").textContent = modeNames[mode];
      const orb = $("#mode-orb");
      orb.dataset.mode = mode;
      $("use", orb).setAttribute("href", "#" + modeIcons[mode]);
    });
  }

  /* ================= Sparkline ================= */

  function drawSparkline() {
    const svg = $("#sparkline");
    if (!svg) return;
    const pts = [18, 24, 20, 34, 30, 44, 52, 40, 36, 48, 56, 50, 42, 46, 38, 44, 52, 60, 54, 48];
    const w = 280;
    const h = 72;
    const max = Math.max(...pts) * 1.25;
    const step = w / (pts.length - 1);
    let d = "";
    pts.forEach((p, i) => {
      const x = i * step;
      const y = h - (p / max) * (h - 8) - 4;
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    });
    $(".line", svg).setAttribute("d", d.trim());
    $(".area", svg).setAttribute("d", d.trim() + ` L ${w} ${h} L 0 ${h} Z`);
  }
  drawSparkline();

  /* ================= Timer cards ================= */

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  const cardsRoot = $("#timer-cards");
  const cardEls = {};

  WR.timers.forEach((t) => {
    const el = document.createElement("div");
    el.className = "card timer-card";
    el.style.setProperty("--tc", t.color);
    el.innerHTML = `
      <div class="timer-head">
        <div class="timer-icon"><svg><use href="#${t.icon}"/></svg></div>
        <div>
          <h3>${t.name}</h3>
          <div class="limit">${t.subtitle} · every ${fmt(t.limit)}</div>
        </div>
      </div>
      <div class="timer-figures">
        <div class="timer-countdown" data-fld="count">—</div>
        <div class="timer-elapsed" data-fld="elapsed">—</div>
      </div>
      <div class="timebar" data-fld="bar">
        <div class="seg seg-primary"></div>
        <div class="seg seg-secondary"></div>
      </div>
      <div class="timer-legend">
        <span class="chip" style="color:var(--label-2)"><span class="dot" style="background:${t.color}"></span>active</span>
        <span class="chip chip-green" data-fld="state">running</span>
      </div>`;
    cardsRoot.appendChild(el);
    cardEls[t.id] = el;
  });

  /* ================= Ring (next rest break) ================= */

  const ringBar = $("#ring-bar");
  const ringGlow = $("#ring-glow");
  const RING_R = 92;
  const RING_C = 2 * Math.PI * RING_R;

  [ringBar, ringGlow].forEach((c) => {
    if (!c) return;
    c.style.strokeDasharray = RING_C;
    c.style.strokeDashoffset = RING_C;
  });

  /* ================= Break overlay ================= */

  const overlay = $("#break-overlay");
  const overlayRingBar = $("#overlay-ring-bar");
  const OVERLAY_R = 70;
  const OVERLAY_C = 2 * Math.PI * OVERLAY_R;
  if (overlayRingBar) {
    overlayRingBar.style.strokeDasharray = OVERLAY_C;
    overlayRingBar.style.strokeDashoffset = OVERLAY_C;
  }

  let overlayRemaining = 0;
  let overlayTotal = 0;

  function openOverlay(seconds) {
    overlayRemaining = seconds;
    overlayTotal = seconds;
    overlay.classList.add("is-open");
    $("#overlay-done").focus();
    updateOverlay();
  }

  function closeOverlay() {
    overlay.classList.remove("is-open");
  }

  function updateOverlay() {
    $("#overlay-count").textContent = fmt(overlayRemaining);
    const frac = overlayTotal > 0 ? overlayRemaining / overlayTotal : 0;
    if (overlayRingBar) {
      overlayRingBar.style.strokeDashoffset = OVERLAY_C * (1 - frac);
    }
  }

  $("#overlay-done").addEventListener("click", closeOverlay);
  $("#overlay-postpone").addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
  });

  $("#btn-break-now").addEventListener("click", () => {
    const rest = WR.timers.find((t) => t.id === "rest-break");
    openOverlay(rest.breakLen);
    rest.elapsed = 0;
  });

  $("#btn-postpone").addEventListener("click", () => {
    const rest = WR.timers.find((t) => t.id === "rest-break");
    rest.elapsed = Math.max(0, rest.elapsed - 5 * 60);
    pulse($("#btn-postpone"));
  });

  function pulse(el) {
    el.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.94)" },
        { transform: "scale(1)" },
      ],
      { duration: 260, easing: "cubic-bezier(.04,.04,.12,.96)" }
    );
  }

  /* ================= Demo speed ================= */

  const speedSeg = $("#speed-seg");
  if (speedSeg) {
    speedSeg.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-speed]");
      if (btn) speed = +btn.dataset.speed;
    });
  }

  /* ================= Simulation loop ================= */

  let last = performance.now();

  function frame(now) {
    const dtReal = (now - last) / 1000;
    last = now;
    const dt = dtReal * speed;

    // timers
    WR.timers.forEach((t) => {
      if (!t.enabled) return;
      t.elapsed += dt;
      if (t.id !== "daily-limit" && t.elapsed >= t.limit + t.breakLen) {
        t.elapsed = 0;
      }

      const el = cardEls[t.id];
      if (!el) return;
      const remaining = t.limit - t.elapsed;

      // countdown
      const countEl = $('[data-fld="count"]', el);
      if (t.id === "daily-limit") {
        countEl.textContent = fmt(t.limit - t.elapsed);
        $('[data-fld="elapsed"]', el).textContent = `${fmt(t.elapsed)} used`;
      } else if (remaining > 0) {
        countEl.textContent = fmt(remaining);
        $('[data-fld="elapsed"]', el).textContent = `${fmt(t.elapsed)} active`;
      } else {
        countEl.textContent = fmt(-remaining) + " overdue";
        $('[data-fld="elapsed"]', el).textContent = "break due";
      }

      // bars (Workrave timebar semantics)
      const bar = $('[data-fld="bar"]', el);
      const primary = $(".seg-primary", bar);
      const secondary = $(".seg-secondary", bar);
      primary.style.width = Math.min(100, (t.elapsed / t.limit) * 100) + "%";
      secondary.style.width =
        remaining <= 0 && t.breakLen > 0
          ? Math.min(100, ((-remaining) / t.breakLen) * 100) + "%"
          : "0%";
      bar.classList.toggle("overdue", remaining <= 0);

      const stateChip = $('[data-fld="state"]', el);
      if (remaining <= 0) {
        stateChip.textContent = "overdue";
        stateChip.className = "chip chip-orange";
      } else if (remaining < t.limit * 0.2) {
        stateChip.textContent = "imminent";
        stateChip.className = "chip chip-blue";
      } else {
        stateChip.textContent = "running";
        stateChip.className = "chip chip-green";
      }
    });

    // hero ring driven by the rest-break timer
    const rest = WR.timers.find((t) => t.id === "rest-break");
    const rem = rest.limit - rest.elapsed;
    const frac = Math.max(0, Math.min(1, rem / rest.limit));
    if (ringBar) {
      ringBar.style.strokeDashoffset = RING_C * (1 - frac);
      ringGlow.style.strokeDashoffset = RING_C * (1 - frac);
      $("#ring-count").textContent = rem > 0 ? fmt(rem) : fmt(-rem);
      $(".ring-label .sub").textContent = rem > 0 ? "until rest break" : "break overdue";
    }

    // fire the overlay when a break becomes due (not for the daily limit)
    if (rem <= 0 && !overlay.classList.contains("is-open") && speed > 1) {
      openOverlay(rest.breakLen);
    }

    if (overlay.classList.contains("is-open")) {
      overlayRemaining -= dt;
      if (overlayRemaining <= 0) {
        overlayRemaining = 0;
        closeOverlay();
        rest.elapsed = 0;
      }
      updateOverlay();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ================= Stats page ================= */

  function buildBarChart() {
    const rootEl = $("#bar-chart");
    if (!rootEl || rootEl.childElementCount) return;
    const max = Math.max(...WR.week.map((d) => d.active + d.rest)) * 1.08;
    WR.week.forEach((d, i) => {
      const col = document.createElement("div");
      col.className = "bar-col";
      const total = d.active + d.rest;
      col.innerHTML = `
        <div class="bar-stack" style="--h:${(total / max) * 100}%; --d:${i * 70}ms">
          <div class="bar-stack rest-seg" style="--h:100%; height:${(d.rest / total) * 100}%"></div>
        </div>
        <div class="lbl">${d.day}</div>`;
      rootEl.appendChild(col);
    });
  }

  function animateStats() {
    buildBarChart();
    const donut = $("#donut-value");
    if (donut) {
      const C = 2 * Math.PI * 48;
      donut.style.strokeDasharray = C;
      donut.style.strokeDashoffset = C;
      requestAnimationFrame(() => {
        donut.style.strokeDashoffset = C * (1 - 0.76);
      });
    }
  }

  /* ================= Exercises ================= */

  function renderExercises(cat) {
    const grid = $("#exercise-grid");
    grid.innerHTML = "";
    WR.exercises
      .filter((ex) => cat === "all" || ex.cat === cat)
      .forEach((ex, i) => {
        const card = document.createElement("article");
        card.className = "exercise-card";
        card.style.animation = `page-in var(--duration-nav) var(--ease-nav) both ${i * 45}ms`;
        card.innerHTML = `
          <div class="exercise-art" style="background:${ex.grad}">
            <svg><use href="#${ex.icon}"/></svg>
          </div>
          <div class="exercise-body">
            <h4>${ex.title}</h4>
            <p>${ex.desc}</p>
            <div class="exercise-meta">
              <span class="chip">${ex.dur}</span>
              <span class="chip">${ex.reps}</span>
              <div class="spacer"></div>
              <button class="btn btn-secondary btn-sm">Add</button>
            </div>
          </div>`;
        grid.appendChild(card);
      });
  }

  const filterRoot = $("#exercise-filter");
  if (filterRoot) {
    filterRoot.addEventListener("click", (e) => {
      const chip = e.target.closest("button[data-cat]");
      if (!chip) return;
      $$("button[data-cat]", filterRoot).forEach((c) => {
        c.classList.remove("chip-blue");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("chip-blue");
      chip.setAttribute("aria-pressed", "true");
      renderExercises(chip.dataset.cat);
    });
    renderExercises("all");
  }

  /* ================= Design system page ================= */

  function renderPalette() {
    const pal = $("#palette");
    if (!pal || pal.childElementCount) return;
    WR.systemColors.forEach(([name, light, dark]) => {
      const sw = document.createElement("div");
      sw.className = "sw";
      sw.style.background = `rgb(${light})`;
      sw.style.color = ["Yellow", "Green", "Mint", "Cyan"].includes(name) ? "#000" : "#fff";
      sw.innerHTML = `${name}<br><span style="font-weight:400; opacity:.85">${light}</span>`;
      pal.appendChild(sw);
    });
  }

  function renderTypeScale() {
    const ts = $("#type-scale");
    if (!ts || ts.childElementCount) return;
    WR.typeScale.forEach(([name, font]) => {
      const row = document.createElement("div");
      row.className = "type-row";
      const sample = document.createElement("div");
      sample.style.font = font.includes("34px")
        ? "var(--type-large-title)"
        : font.includes("28px")
        ? "var(--type-title-1)"
        : font.includes("22px")
        ? "var(--type-title-2)"
        : font.includes("20px")
        ? "var(--type-title-3)"
        : font.includes("17px") && font.includes("600")
        ? "var(--type-headline)"
        : font.includes("17px")
        ? "var(--type-body)"
        : font.includes("16px")
        ? "var(--type-callout)"
        : font.includes("15px")
        ? "var(--type-subhead)"
        : font.includes("13px")
        ? "var(--type-footnote)"
        : font.includes("12px")
        ? "var(--type-caption)"
        : "var(--type-caption-2)";
      sample.textContent = "The quick brown fox";
      const spec = document.createElement("div");
      spec.className = "spec";
      spec.textContent = `${name} · ${font}`;
      row.append(sample, spec);
      ts.appendChild(row);
    });
  }

  function renderRadii() {
    const rs = $("#radius-scale");
    if (!rs || rs.childElementCount) return;
    WR.radii.forEach(([label, r]) => {
      const item = document.createElement("div");
      item.className = "rs";
      item.innerHTML = `<div class="box" style="border-radius:${Math.min(r, 42)}px"></div>${label}`;
      rs.appendChild(item);
    });
  }

  function renderShadows() {
    const ss = $("#shadow-scale");
    if (!ss || ss.childElementCount) return;
    WR.shadows.forEach(([label, shadow]) => {
      const item = document.createElement("div");
      item.className = "sh";
      item.style.boxShadow = `var(${shadow.slice(4, -1)})`;
      item.textContent = label;
      ss.appendChild(item);
    });
  }

  // build DS page lazily when first shown
  const systemNav = $('.nav-item[data-page="system"]');
  if (systemNav) {
    systemNav.addEventListener("click", () => {
      renderPalette();
      renderTypeScale();
      renderRadii();
      renderShadows();
    });
  }

  /* ================= Init ================= */

  applyTheme("light");
  animateStats();
})();
