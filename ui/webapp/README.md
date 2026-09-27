# Workrave Control Center — UI concept

A next-generation web UI concept for [Workrave](https://workrave.org), the RSI
prevention / break-reminder app. This is a working, interactive prototype of a
“Control Center” experience: live timers, break overlay, statistics, exercises,
settings — plus the design system that powers it.

## Run it

No build step. Any static file server works:

```bash
cd ui/webapp
python3 -m http.server 8080
# open http://localhost:8080
```

Everything is plain HTML/CSS/JS:

```
ui/webapp/
├── index.html        # app shell + inline SVG icon sprite
├── css/tokens.css    # design tokens (colour, type, shape, motion, elevation)
├── css/app.css       # components & layout (cards, lists, switches, segmented…)
├── css/pages.css     # page compositions (dashboard, break stage, stats…)
├── js/data.js        # demo timers, exercises, stats, token registries
└── js/app.js         # behaviour: live simulation, navigation, theming
```

## Try this

- The three break timers **really tick**. “Demo speed” (top bar) fast-forwards
  30×/120× — let a timer hit zero and the full-screen break overlay fires.
- **Theme** toggles light/dark; Settings → Appearance has Light/Dark/Auto and
  six accent colours that retint the whole UI live.
- Settings uses iOS-style grouped lists with working switches, steppers and
  sliders. The segmented controls have a real sliding thumb.
- **Design System** (sidebar) shows every token: palette, type scale, radius
  ladder, shadows and a live control gallery.

## Design system — “Aurora”

Built after studying open design systems on GitHub (see *Inspiration* below).
The backbone is Apple’s Human Interface Guidelines — not guessed, but the
**measured values** collected in
[STiXzoOR/applecn](https://github.com/STiXzoOR/applecn)
(`docs/research/apple-design-system-reference.md`), which reads Apple’s
published HIG tables plus Apple’s own web stylesheets (apps.apple.com,
music.apple.com) and on-device UIKit/AppKit metrics.

What is taken from where:

| Layer      | Source | Values used |
|------------|--------|-------------|
| Colour     | HIG Color Specifications | 12 system colours light/dark, semantic roles (label-1…4, fill-1…4, grouped backgrounds, separator) |
| Typography | HIG Typography Specifications | Large Title 34/41 → Caption 2 11/13, weights, SF system font stack |
| Shape      | apps.apple.com tokens | radius ladder 5 / 8 / 10 / 12 / 17 / 20 / 24 + pill |
| Controls   | UIKit / AppKit metrics | switch 51×31 (27 pt thumb), segmented 32 h capsule w/ sliding thumb + `0 3px 8px .12` selection shadow, buttons capsule 44 h, slider track 4 / thumb 26 |
| Motion     | Apple web CSS | `cubic-bezier(.04,.04,.12,.96)` standard, `.52,.16,.24,1` sheet, 100 / 210 / 300 / 560 ms durations |
| Elevation  | UIKit + Apple web | thumb, segment, card, multi-layer lift, glass inner-stroke + `0 10px 40px` |
| Glass      | Music / App Store glass tokens | `blur(40px) saturate(1.8)`, translucent panels, inner hairline stroke |

Workrave’s own timebar semantics (active / inactive / overdue, from
`ui/app/toolkits/gtkmm/widgets/TimeBar.cc`) are mapped onto Apple system
colours so the product identity survives the restyle.

### Token examples (`css/tokens.css`)

```css
--type-title-1: 600 28px/34px var(--font-sans);
--radius-xl: 17px;
--ease-standard: cubic-bezier(0.04, 0.04, 0.12, 0.96);
--shadow-thumb: 0 3px 8px rgba(0,0,0,.15), 0 3px 1px rgba(0,0,0,.06);
--system-blue: rgb(0, 136, 255);   /* dark: rgb(0, 145, 255) */
```

## Inspiration

Design systems researched on GitHub before drawing anything:

- **[Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)** — colour roles, type scale, spacing, motion philosophy, accessibility contrast rules.
- **[STiXzoOR/applecn](https://github.com/STiXzoOR/applecn)** — HIG as a shadcn design system on Base UI; its research doc is the measurement source for the exact numbers in `tokens.css`.
- **[radix-ui](https://github.com/radix-ui)** (primitives / colors / themes) — semantic token architecture and accessibility-first components.
- **[shadcn-ui/ui](https://github.com/shadcn-ui/ui)** — “own your components” distribution model and clean component API conventions.
- **[justinwetch/HIGAgentSkills](https://github.com/justinwetch/HIGAgentSkills)** & **[Shiaoming123/Apple-Design](https://github.com/Shiaoming123/Apple-Design)** — distilled HIG knowledge bases for agents.

## Status

Prototype / design exploration. It demonstrates the direction a redesigned
Workrave desktop UI (GTK/Qt) could take; it is not wired to the real core
engine or DBus. Timers, charts and settings are simulated.
