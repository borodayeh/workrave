# Workrave for macOS — UI concept

A next-generation interface concept for [Workrave](https://workrave.org), the
RSI prevention / break-reminder app — designed as if Apple's own product team
had built it: a native macOS window with a translucent sidebar, Screen
Time–style rhythm charts, System Settings–style grouped preferences, and a
break window that plays the **real Workrave exercise set**.

## Run it

No build step. Any static file server works:

```bash
cd ui/webapp
python3 -m http.server 8080
# open http://localhost:8080
```

```
ui/webapp/
├── index.html           # app shell: macOS window, sidebar, 5 pages, break overlay
├── css/tokens.css       # design tokens (Apple HIG measurements)
├── css/app.css          # window chrome, sidebar, rows, controls
├── css/pages.css        # Today / Breaks / Exercises / History / break window
├── js/data.js           # REAL exercise set + simulated timers & stats
├── js/app.js            # behaviour incl. the exercise sequence player
└── assets/              # REAL Workrave artwork (sheep, timers, exercise set)
```

## What makes it feel native

- **Real product content.** The exercise list, titles, descriptions, image
  sequences and durations come verbatim from
  `ui/data/exercises/exercises.xml.in`; the illustrations are the actual
  250×250 exercise images shipped with the app (including left/right
  mirroring). Break names and button labels (`Postpone`, `Skip`, `Take rest
  break now`, `You need a rest break…`) are the real strings from the source.
- **Restraint.** One app tint (health green), neutral surfaces, 0.5px
  hairlines, SF type scale, macOS control geometry (26px segmented, 38×22
  switch, capsule steppers, 28px toolbar buttons). Colour is used for
  meaning, not decoration.
- **The break player works.** *Take a Break* or *Preview Break* opens the
  break window and plays a real exercise sequence — each step for its XML
  duration, mirrored when the sequence says so, with the step indicator
  filling in real time.
- **Design tokens** are measured values from Apple's Human Interface
  Guidelines and Apple's own web, collected in the open research of
  [STiXzoOR/applecn](https://github.com/STiXzoOR/applecn) (system colours,
  type scale, radius ladder, easings, shadows). `css/tokens.css` is the
  single source of truth.

## Try this

- Timers tick live in the Today page and the sidebar status.
- Press **D** to cycle demo speed 1× / 30× / 120× — at speed, a break fires
  automatically when a timer expires.
- **Esc** closes the break window; **Next Exercise** advances the sequence.
- Settings page rows all work: switches, steppers, volume slider, and the
  Light/Dark/Auto appearance control (kept in sync with the toolbar).

## Status

Prototype / design exploration, not wired to the core engine or DBus.
Verified with a 32-assertion jsdom smoke test.
