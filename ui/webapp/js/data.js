/* Workrave — demo content.
   EXERCISES come from ui/data/exercises/exercises.xml.in — the real
   Workrave exercise program (titles, descriptions, durations, art). */

const SCHEDULES = {
  micro: { id: "micro", name: "Micro-break", interval: 5 * 60, duration: 20, icon: "i-pause-mini" },
  rest: { id: "rest", name: "Rest break", interval: 45 * 60, duration: 5 * 60, icon: "i-mug" },
  daily: { id: "daily", name: "Daily limit", interval: 6 * 60 * 60, duration: 0, icon: "i-moon" }
};

const EXERCISES = [
  {
    id: "shoulder-arm-stretch",
    name: "Shoulder-arm stretch",
    description: "Stretch your shoulder and arm muscles to reduce tension.",
    duration: 40,
    images: ["assets/exercises/shoulder-arm-stretch-1.png"]
  },
  {
    id: "finger-stretch",
    name: "Finger stretch",
    description: "Stretch your fingers to improve flexibility and circulation.",
    duration: 40,
    images: ["assets/exercises/finger-stretch-1.png"]
  },
  {
    id: "neck-tilt-stretch",
    name: "Neck tilt stretch",
    description: "Gently stretch the muscles on the side of your neck.",
    duration: 30,
    images: ["assets/exercises/neck-tilt-stretch-1.png"]
  },
  {
    id: "backward-shoulder-stretch",
    name: "Backward shoulder stretch",
    description: "Stretch your shoulder muscles by pulling your arm backward.",
    duration: 30,
    images: ["assets/exercises/backward-shoulder-stretch-1.png"]
  },
  {
    id: "move-the-eyes",
    name: "Move the eyes",
    description: "Move your eyes from side to side to relax your eye muscles.",
    duration: 32,
    images: ["assets/exercises/monitor-border-1.png"]
  },
  {
    id: "train-focusing",
    name: "Train focusing the eyes",
    description: "Focus on your thumb and objects further away to train your focus.",
    duration: 25,
    images: ["assets/exercises/depth-focus-1.png"]
  },
  {
    id: "eye-darkness",
    name: "Look into the darkness",
    description: "Close your eyes and relax them in darkness.",
    duration: 20,
    images: ["assets/exercises/eye-darkness-1.png"]
  },
  {
    id: "move-the-shoulders",
    name: "Move the shoulders",
    description: "Rotate your shoulders in circular movements.",
    duration: 30,
    images: ["assets/exercises/rotate-arm-1.png"]
  },
  {
    id: "chair-pushup",
    name: "Move the shoulders up and down",
    description: "Push yourself up from your chair using your arms.",
    duration: 30,
    images: ["assets/exercises/chair-pushup-1.png"]
  },
  {
    id: "turn-your-head",
    name: "Turn your head",
    description: "Turn your head to each side to stretch your neck.",
    duration: 24,
    images: ["assets/exercises/turn-head-1.png"]
  }
];
