// ── sound.js  ─  Audio Engine with Alex MakeMusic Tropical House Track ────
// Uses the uploaded 2:10 Alex MakeMusic track + synthesized SFX.

let isMuted = false; // Default music to ON per user request
let audioInitialized = false;

// Background Audio Element (Alex MakeMusic - Future Energetic Tropical House Party)
let bgMusic = new Audio('/bg-music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.55;

// Web Audio API for SFX
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudioOnUserGesture() {
  const ctx = getAudioContext();
  if (ctx) {
    audioInitialized = true;
  }
  if (!isMuted && bgMusic.paused) {
    playBgMusic();
  }
}

export function playBgMusic() {
  if (isMuted) return;
  bgMusic.play().catch((err) => {
    console.log('Autoplay waiting for initial user gesture:', err.message);
  });
}

export function pauseBgMusic() {
  bgMusic.pause();
}

// Aliases for backwards compatibility with main.js
export const playBamBamSong = playBgMusic;
export const pauseBamBamSong = pauseBgMusic;

export function setMuted(muted) {
  isMuted = muted;
  if (muted) {
    pauseBgMusic();
  } else {
    getAudioContext();
    playBgMusic();
  }
}

export function getMuted() {
  return isMuted;
}

export function toggleMute() {
  setMuted(!isMuted);
  return isMuted;
}

// ── 1. Logo Entrance Stinger ────────────────────────────────────────
export function playLogoStinger() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const kick = ctx.createOscillator();
  const kickGain = ctx.createGain();

  kick.type = 'sine';
  kick.frequency.setValueAtTime(140, now);
  kick.frequency.exponentialRampToValueAtTime(35, now + 0.18);

  kickGain.gain.setValueAtTime(0.35, now);
  kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  kick.connect(kickGain);
  kickGain.connect(ctx.destination);

  kick.start(now);
  kick.stop(now + 0.22);
}

// ── 2. Field Focus Tick ─────────────────────────────────────────────
export function playFocusTick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.015);
}

// ── 3. Shuffle Button Slot-Machine Blip ─────────────────────────────
export function playShuffleBlip() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [659.25, 783.99, 1046.5]; // E5, G5, C6

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.04;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.08, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.05);
  });
}

// ── 4. Card Reveal Celebration ──────────────────────────────────────
export function playCardCelebration() {
  pauseBgMusic();

  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];

  chord.forEach((freq, idx) => {
    const noteTime = now + idx * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.12, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.35);
  });
}
