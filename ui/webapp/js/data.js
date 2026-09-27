/* Workrave — demo data.
   The exercise set below is the real, built-in Workrave exercise data from
   ui/data/exercises/exercises.xml.in (titles, descriptions, image sequences,
   durations and mirroring), shipped with the desktop app. */

window.WR = window.WR || {};

const A = "assets/exercises/";

/* Real Workrave exercises. `total` = sequence duration in seconds;
   images are shown in order for `dur` seconds each and the sequence
   repeats to fill `total` (mirroring the desktop exercise player). */
WR.exercises = [
  {
    title: "Shoulder-arm stretch",
    desc: "Keep one arm horizontally stretched in front of your chest. Push this arm with your other arm towards you until you feel a mild tension in your shoulder. Hold this position briefly, and repeat the exercise for your other arm.",
    total: 40,
    images: [
      { src: A + "shoulder-arm-stretch.png", dur: 10, mirror: false },
      { src: A + "shoulder-arm-stretch.png", dur: 10, mirror: true },
    ],
  },
  {
    title: "Finger stretch",
    desc: "Separate and stretch your fingers until a mild tension is felt, and hold this for 10 seconds. Relax, then bend your fingers at the knuckles, and hold again for 10 seconds. Repeat this exercise once more.",
    total: 40,
    images: [
      { src: A + "finger-stretch-1.png", dur: 10, mirror: false },
      { src: A + "finger-stretch-2.png", dur: 10, mirror: false },
    ],
  },
  {
    title: "Neck tilt stretch",
    desc: "Start with your head in a comfortable straight position. Then, slowly tilt your head to your right shoulder to gently stretch the muscles on the left side of your neck. Hold this position for 5 seconds. Then, tilt your head to the left side to stretch your other side. Do this twice for each side.",
    total: 30,
    images: [
      { src: A + "neck-tilt-stretch-1.png", dur: 5, mirror: false },
      { src: A + "neck-tilt-stretch-2.png", dur: 5, mirror: false },
    ],
  },
  {
    title: "Backward shoulder stretch",
    desc: "Interlace your fingers behind your back. Then turn your elbows gently inward, while straightening your arms. Hold this position for 5 to 15 seconds, and repeat this exercise twice.",
    total: 30,
    images: [{ src: A + "backward-shoulder-stretch.png", dur: 10, mirror: false }],
  },
  {
    title: "Move the eyes",
    desc: "Look at the upper left corner of the outside border of your monitor. Follow the border slowly to the upper right corner. Continue to the next corner, until you got around it two times. Then, reverse the exercise.",
    total: 32,
    images: [
      { src: A + "monitor-border-1.png", dur: 4, mirror: false },
      { src: A + "monitor-border-2.png", dur: 4, mirror: false },
      { src: A + "monitor-border-3.png", dur: 4, mirror: false },
      { src: A + "monitor-border-4.png", dur: 4, mirror: false },
    ],
  },
  {
    title: "Train focusing the eyes",
    desc: "Look for the furthest point you can see behind your monitor. Focus your eyes on the remote point. Then focus on your monitor border. Repeat it. If you cannot look very far from your monitor, face another direction with a longer view. Then switch your focus between a distant object and a pen held at the same distance from your eyes as your monitor.",
    total: 25,
    images: [
      { src: A + "depth-focus-1.png", dur: 5, mirror: false },
      { src: A + "depth-focus-2.png", dur: 5, mirror: false },
    ],
  },
  {
    title: "Look into the darkness",
    desc: "Cover your eyes with your palms in such a way that you can still open your eyelids. Now open your eyes and look into the darkness of your palms. This exercise gives better relief to your eyes compared to simply closing them.",
    total: 20,
    images: [{ src: A + "eye-darkness.png", dur: 20, mirror: false }],
  },
  {
    title: "Move the shoulders",
    desc: "Spin your right arm slowly round like a plane propeller beside your body. Do this 4 times forwards, 4 times backwards and relax for a few seconds. Repeat with the left arm.",
    total: 30,
    images: [
      { src: A + "rotate-arm.png", dur: 15, mirror: false },
      { src: A + "rotate-arm.png", dur: 15, mirror: true },
    ],
  },
  {
    title: "Move the shoulders up and down",
    desc: "Put your hands on the armrests of your chair when you are sitting down and press your body up until your arms are straight. Try to move your head even further by lowering your shoulders. Slowly move back into your chair.",
    total: 30,
    images: [
      { src: A + "chair-pushup-1.png", dur: 5, mirror: false },
      { src: A + "chair-pushup-2.png", dur: 10, mirror: false },
    ],
  },
  {
    title: "Turn your head",
    desc: "Turn your head left and keep it there for 2 seconds. Then turn your head right and keep it there for 2 seconds.",
    total: 24,
    images: [
      { src: A + "turn-head-1.png", dur: 3, mirror: false },
      { src: A + "turn-head-2.png", dur: 3, mirror: false },
    ],
  },
];

/* Simulated timer state (seconds). */
WR.timers = {
  micro: { limit: 5 * 60, breakLen: 20, elapsed: 2 * 60 + 42 },
  rest: { limit: 45 * 60, breakLen: 5 * 60, elapsed: 32 * 60 + 19 },
  daily: { limit: 6 * 60 * 60, breakLen: 0, elapsed: 4 * 60 * 60 + 36 * 60 },
};

/* Activity per hour for the "Rhythm today" chart: 9:00–17:00. */
WR.hours = [
  { active: 42, brk: 6 },
  { active: 51, brk: 5 },
  { active: 47, brk: 8 },
  { active: 38, brk: 12 },
  { active: 53, brk: 5 },
  { active: 44, brk: 7 },
  { active: 26, brk: 14 },
  { active: 49, brk: 6 },
  { active: 46, brk: 5 },
];

/* Week overview (minutes). */
WR.week = [
  { day: "Mon", active: 336, brk: 52 },
  { day: "Tue", active: 368, brk: 61 },
  { day: "Wed", active: 302, brk: 47 },
  { day: "Thu", active: 385, brk: 58 },
  { day: "Fri", active: 276, brk: 44 },
  { day: "Sat", active: 142, brk: 32 },
  { day: "Sun", active: 96, brk: 24 },
];
