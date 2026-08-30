// ── Builder Class titles (witty tech personas) ──────────────────────
export const BUILDER_CLASSES = [
  'TERMINAL WIZARD',
  'CHAOS ENGINEER',
  'PIXEL ALCHEMIST',
  'STACK SURGEON',
  'BUG WHISPERER',
  'DEPLOY DAEMON',
  'MERGE CONFLICT MEDIATOR',
  'INFINITE LOOPER',
  'CACHE INVALIDATOR',
  'REGEX SHAMAN',
  'DOCKER CAPTAIN',
  'CALLBACK CRUSADER',
  '404 EXPLORER',
  'SYNTAX SORCERER',
  'API ARCHITECT',
  'MEMORY LEAK DETECTIVE',
  'RUBBER DUCK DEBUGGER',
  'GIT REBASE GURU',
  'KERNEL PANICKER',
  'BUFFER OVERFLOW BARON',
  'NULL POINTER KNIGHT',
  'ASYNC AVENGER',
  'LAMBDA LORD',
  'SEGFAULT SURVIVOR',
  'BINARY BARD',
  'LINTER LIBERATOR',
  'COMMIT MESSAGE POET',
  'RACE CONDITION RACER',
  'HEAP HERO',
  'PIPELINE PLUMBER',
];

// ── Flavor texts ────────────────────────────────────────────────────
export const FLAVOR_TEXTS = [
  'CURRENTLY SHIPPING: vibes & semicolons',
  'CURRENTLY SHIPPING: another rewrite',
  'CURRENTLY SHIPPING: "it works on my machine"',
  'CURRENTLY SHIPPING: zero-bug code (trust me)',
  'CURRENTLY SHIPPING: dark mode everything',
  'CURRENTLY SHIPPING: Stack Overflow answers',
  'CURRENTLY SHIPPING: one more "final" commit',
  'CURRENTLY SHIPPING: coffee-driven development',
  'CURRENTLY SHIPPING: technical debt repayment',
  'CURRENTLY SHIPPING: features, not bugs',
  'CURRENTLY SHIPPING: side projects at 3am',
  'CURRENTLY SHIPPING: unread Slack messages',
  'CURRENTLY SHIPPING: README-driven development',
  'CURRENTLY SHIPPING: "I\'ll refactor it later"',
  'CURRENTLY SHIPPING: localhost to production',
];

// ── Deterministic-ish ID from name ──────────────────────────────────
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function generateBuilderId(name) {
  const num = name.trim()
    ? hashCode(name.trim().toUpperCase()) % 10000
    : Math.floor(Math.random() * 10000);
  return `HHG26-${String(num).padStart(4, '0')}`;
}

// ── Random pick helpers ─────────────────────────────────────────────
let lastClassIndex = -1;
let lastFlavorIndex = -1;

export function shuffleClass() {
  let idx;
  do {
    idx = Math.floor(Math.random() * BUILDER_CLASSES.length);
  } while (idx === lastClassIndex && BUILDER_CLASSES.length > 1);
  lastClassIndex = idx;
  return BUILDER_CLASSES[idx];
}

export function shuffleFlavor() {
  let idx;
  do {
    idx = Math.floor(Math.random() * FLAVOR_TEXTS.length);
  } while (idx === lastFlavorIndex && FLAVOR_TEXTS.length > 1);
  lastFlavorIndex = idx;
  return FLAVOR_TEXTS[idx];
}
