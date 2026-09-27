/* Workrave “Aurora” — demo data & design-system registries */

window.WR = window.WR || {};

/* Simulated timer state. `elapsed` advances with the demo clock. */
WR.timers = [
  {
    id: "micro-break",
    name: "Micro-break",
    subtitle: "Short pause",
    icon: "i-bolt",
    color: "var(--micro)",
    limit: 5 * 60, // seconds until break
    breakLen: 20, // seconds of break
    elapsed: 2 * 60 + 41,
    idle: 0,
    enabled: true,
  },
  {
    id: "rest-break",
    name: "Rest break",
    subtitle: "Real movement",
    icon: "i-cup",
    color: "var(--rest)",
    limit: 45 * 60,
    breakLen: 5 * 60,
    elapsed: 32 * 60 + 19,
    idle: 0,
    enabled: true,
  },
  {
    id: "daily-limit",
    name: "Daily limit",
    subtitle: "Total activity",
    icon: "i-chart",
    color: "var(--daily)",
    limit: 6 * 60 * 60,
    breakLen: 0,
    elapsed: 4 * 60 * 60 + 36 * 60,
    idle: 0,
    enabled: true,
  },
];

WR.exercises = [
  {
    cat: "neck",
    title: "Neck rolls",
    desc: "Slow half-circles, ear toward shoulder. Never force the range.",
    dur: "30 s",
    reps: "×3",
    grad: "linear-gradient(145deg,#00c8b3,#0088ff)",
    icon: "i-stretch",
  },
  {
    cat: "shoulders",
    title: "Shoulder shrugs",
    desc: "Lift, hold two seconds, release. Let the tension melt on the way down.",
    dur: "20 s",
    reps: "×5",
    grad: "linear-gradient(145deg,#6155f5,#cb30e0)",
    icon: "i-stretch",
  },
  {
    cat: "eyes",
    title: "20-20-20 gaze",
    desc: "Every 20 minutes, look 20 feet away for 20 seconds. Blink slowly.",
    dur: "20 s",
    reps: "×1",
    grad: "linear-gradient(145deg,#00c0e8,#0088ff)",
    icon: "i-eye",
  },
  {
    cat: "hands",
    title: "Wrist flexor stretch",
    desc: "Arm straight, palm up, gently pull the fingers down. Then reverse.",
    dur: "15 s",
    reps: "×2",
    grad: "linear-gradient(145deg,#ff8d28,#ff383c)",
    icon: "i-hand",
  },
  {
    cat: "back",
    title: "Seated spinal twist",
    desc: "Hand on the opposite knee, breathe out as you turn. Keep hips square.",
    dur: "30 s",
    reps: "×2",
    grad: "linear-gradient(145deg,#34c759,#00c8b3)",
    icon: "i-stretch",
  },
  {
    cat: "hands",
    title: "Finger fan",
    desc: "Spread fingers wide like a star, hold, then make a soft fist. Repeat.",
    dur: "10 s",
    reps: "×8",
    grad: "linear-gradient(145deg,#ff2d55,#cb30e0)",
    icon: "i-hand",
  },
  {
    cat: "neck",
    title: "Chin tucks",
    desc: "Glide the chin straight back — a gentle double-chin. Great after long calls.",
    dur: "10 s",
    reps: "×5",
    grad: "linear-gradient(145deg,#0088ff,#6155f5)",
    icon: "i-stretch",
  },
  {
    cat: "eyes",
    title: "Palming",
    desc: "Warm the hands, cup them over closed eyes, breathe. Total darkness for 30 s.",
    dur: "30 s",
    reps: "×1",
    grad: "linear-gradient(145deg,#ffcc00,#ff8d28)",
    icon: "i-eye",
  },
  {
    cat: "shoulders",
    title: "Doorway stretch",
    desc: "Forearms on the frame, step through until the chest opens. Breathe into it.",
    dur: "30 s",
    reps: "×2",
    grad: "linear-gradient(145deg,#00c8b3,#34c759)",
    icon: "i-stretch",
  },
];

/* Weekly stats for the bar chart: active + break minutes per day */
WR.week = [
  { day: "Mon", active: 336, rest: 52 },
  { day: "Tue", active: 368, rest: 61 },
  { day: "Wed", active: 302, rest: 47 },
  { day: "Thu", active: 385, rest: 58 },
  { day: "Fri", active: 276, rest: 44 },
  { day: "Sat", active: 142, rest: 32 },
  { day: "Sun", active: 96, rest: 24 },
];

/* Design-system registries (values from the Apple HIG research) */
WR.systemColors = [
  ["Red", "255,56,60", "255,66,69"],
  ["Orange", "255,141,40", "255,146,48"],
  ["Yellow", "255,204,0", "255,214,0"],
  ["Green", "52,199,89", "48,209,88"],
  ["Mint", "0,200,179", "0,218,195"],
  ["Teal", "0,195,208", "0,210,224"],
  ["Cyan", "0,192,232", "60,211,254"],
  ["Blue", "0,136,255", "0,145,255"],
  ["Indigo", "97,85,245", "109,124,255"],
  ["Purple", "203,48,224", "219,52,242"],
  ["Pink", "255,45,85", "255,55,95"],
  ["Brown", "172,127,94", "183,138,102"],
];

WR.typeScale = [
  ["Large Title", "600 34px/41px", "17/22px"],
  ["Title 1", "600 28px/34px", "—"],
  ["Title 2", "600 22px/28px", "—"],
  ["Title 3", "600 20px/25px", "—"],
  ["Headline", "600 17px/22px", "—"],
  ["Body", "400 17px/22px", "—"],
  ["Callout", "400 16px/21px", "—"],
  ["Subhead", "400 15px/20px", "—"],
  ["Footnote", "400 13px/18px", "—"],
  ["Caption 1", "400 12px/16px", "—"],
  ["Caption 2", "500 11px/13px", "—"],
];

WR.radii = [
  ["xs · 5", 5],
  ["sm · 8", 8],
  ["md · 10", 10],
  ["lg · 12", 12],
  ["xl · 17", 17],
  ["2xl · 20", 20],
  ["3xl · 24", 24],
  ["pill", 1000],
];

WR.shadows = [
  ["Thumb", "var(--shadow-thumb)"],
  ["Segment", "var(--shadow-segment)"],
  ["Card small", "var(--shadow-card-small)"],
  ["Card", "var(--shadow-card)"],
  ["Lift", "var(--shadow-lift)"],
  ["Glass", "var(--shadow-glass)"],
];
