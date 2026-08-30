// ── main.js  ─  Application controller ──────────────────────────────
import './style.css';
import { renderBoardingPass } from './boarding-pass.js';
import { shuffleClass, shuffleFlavor } from './data.js';
import { loadImage, loadImageURL, downloadPNG, shareToX } from './utils.js';
import {
  initAudioOnUserGesture,
  toggleMute,
  getMuted,
  playBamBamSong,
  pauseBamBamSong,
  playLogoStinger,
  playFocusTick,
  playShuffleBlip,
  playCardCelebration,
} from './sound.js';

// ── State ───────────────────────────────────────────────────────────
const state = {
  isTeam: false,
  teamName: '',
  teamClass: shuffleClass(),
  teamMembers: [
    { id: 1, name: '', stack: '', photo: null, photoOffset: { x: 0, y: 0 }, photoScale: 1 },
    { id: 2, name: '', stack: '', photo: null, photoOffset: { x: 0, y: 0 }, photoScale: 1 },
  ],
  photo: null,
  photoOffset: { x: 0, y: 0 },
  photoScale: 1,
  name: '',
  stacks: [],
  city: '',
  builderClass: shuffleClass(),
  flavorText: shuffleFlavor(),
  logoImg: null,
  logoHacker: null,
  logoGoa: null,
  bgScene: null,
  currentScreen: 'intro',
};

// ── DOM refs ────────────────────────────────────────────────────────
const introScreen = document.getElementById('introScreen');
const formScreen = document.getElementById('formScreen');
const cardScreen = document.getElementById('cardScreen');
const introSkip = document.getElementById('introSkip');

const soundToggle = document.getElementById('soundToggle');
const soundMutedIcon = document.getElementById('soundMutedIcon');
const soundActiveIcon = document.getElementById('soundActiveIcon');

const canvas = document.getElementById('passCanvas');
const previewWrap = document.getElementById('previewWrap');
const previewHint = document.getElementById('previewHint');
const zoomControls = document.getElementById('zoomControls');
const zoomRange = document.getElementById('zoomRange');

// Mode Switcher refs
const modeSoloBtn = document.getElementById('modeSoloBtn');
const modeTeamBtn = document.getElementById('modeTeamBtn');
const soloFormSection = document.getElementById('soloFormSection');
const teamFormSection = document.getElementById('teamFormSection');

// Solo form refs
const photoInput = document.getElementById('photoInput');
const uploadLabel = document.getElementById('uploadLabel');
const photoThumbWrap = document.getElementById('photoThumbWrap');
const photoThumb = document.getElementById('photoThumb');

const nameInput = document.getElementById('nameInput');
const stackInput = document.getElementById('stackInput');
const cityInput = document.getElementById('cityInput');

// Team form refs
const teamNameInput = document.getElementById('teamNameInput');
const teamMembersList = document.getElementById('teamMembersList');
const addTeammateBtn = document.getElementById('addTeammateBtn');

const continueBtn = document.getElementById('continueBtn');
const backBtn = document.getElementById('backBtn');
const bottomBar = document.getElementById('bottomBar');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// ── Audio Toggle Helper ─────────────────────────────────────────────
function updateSoundIcon() {
  const muted = getMuted();
  if (muted) {
    soundMutedIcon.style.display = 'block';
    soundActiveIcon.style.display = 'none';
    soundToggle.title = 'Unmute sound';
  } else {
    soundMutedIcon.style.display = 'none';
    soundActiveIcon.style.display = 'block';
    soundToggle.title = 'Mute sound';
  }
}

soundToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  initAudioOnUserGesture();
  const muted = toggleMute();
  updateSoundIcon();
  if (!muted) {
    if (state.currentScreen === 'intro' || state.currentScreen === 'form') {
      playBamBamSong();
    } else {
      playFocusTick();
    }
  }
});

// Enable audio context on any user gesture (do not auto-advance screen)
window.addEventListener('click', () => {
  initAudioOnUserGesture();
});

window.addEventListener('touchstart', () => {
  initAudioOnUserGesture();
});

// ── Mode Switcher ───────────────────────────────────────────────────
function setMode(mode) {
  state.isTeam = mode === 'team';
  if (state.isTeam) {
    if (modeSoloBtn) modeSoloBtn.classList.remove('active');
    if (modeTeamBtn) modeTeamBtn.classList.add('active');
    if (soloFormSection) soloFormSection.style.display = 'none';
    if (teamFormSection) teamFormSection.style.display = 'flex';
    renderTeamMemberBlocks();
  } else {
    if (modeTeamBtn) modeTeamBtn.classList.remove('active');
    if (modeSoloBtn) modeSoloBtn.classList.add('active');
    if (teamFormSection) teamFormSection.style.display = 'none';
    if (soloFormSection) soloFormSection.style.display = 'flex';
  }
}

if (modeSoloBtn) {
  modeSoloBtn.addEventListener('click', () => {
    playFocusTick();
    setMode('solo');
  });
}

if (modeTeamBtn) {
  modeTeamBtn.addEventListener('click', () => {
    playFocusTick();
    setMode('team');
  });
}

// ── Team Member Form Management ─────────────────────────────────────
function renderTeamMemberBlocks() {
  if (!teamMembersList) return;
  teamMembersList.innerHTML = '';

  state.teamMembers.forEach((member, index) => {
    const block = document.createElement('div');
    block.className = 'team-card-block';

    block.innerHTML = `
      <div class="team-card-header">
        <span class="team-card-title">Teammate ${index + 1}</span>
        ${
          state.teamMembers.length > 2
            ? `<button type="button" class="team-remove-btn" data-index="${index}" title="Remove teammate">✕</button>`
            : ''
        }
      </div>
      <label class="upload-btn team-upload-label" data-index="${index}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 5.5a.75.75 0 01.75.75v4h4a.75.75 0 010 1.5h-4v4a.75.75 0 01-1.5 0v-4h-4a.75.75 0 010-1.5h4v-4A.75.75 0 0112 5.5z"/><path fill-rule="evenodd" d="M9.77 3.346a2.75 2.75 0 014.46 0l.632.877A1.25 1.25 0 0015.88 4.8h.37A2.75 2.75 0 0119 7.55v8.9A2.75 2.75 0 0116.25 19.2H7.75A2.75 2.75 0 015 16.45v-8.9A2.75 2.75 0 017.75 4.8h.37c.402 0 .779-.194 1.017-.577l.632-.877zM12 8a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" clip-rule="evenodd"/></svg>
        <span>${member.photo ? 'Change Photo' : 'Upload Photo'}</span>
        <input type="file" class="team-photo-input" data-index="${index}" accept="image/*,.heic,.heif" style="display:none" />
      </label>
      <div class="form-group">
        <input type="text" class="team-name-input" data-index="${index}" placeholder="Name" value="${member.name}" maxlength="30" />
      </div>
      <div class="form-group">
        <input type="text" class="team-stack-input" data-index="${index}" placeholder="Role / Stack (e.g. Frontend)" value="${member.stack}" maxlength="40" />
      </div>
    `;

    teamMembersList.appendChild(block);
  });

  // Attach event listeners for dynamic team inputs
  teamMembersList.querySelectorAll('.team-remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      if (state.teamMembers.length > 2) {
        state.teamMembers.splice(idx, 1);
        renderTeamMemberBlocks();
      }
    });
  });

  teamMembersList.querySelectorAll('.team-name-input').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (state.teamMembers[idx]) {
        state.teamMembers[idx].name = e.target.value;
      }
    });
  });

  teamMembersList.querySelectorAll('.team-stack-input').forEach((input) => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (state.teamMembers[idx]) {
        state.teamMembers[idx].stack = e.target.value;
      }
    });
  });

  teamMembersList.querySelectorAll('.team-upload-label').forEach((label) => {
    label.addEventListener('click', (e) => {
      const fileInput = label.querySelector('.team-photo-input');
      if (fileInput) fileInput.click();
    });
  });

  teamMembersList.querySelectorAll('.team-photo-input').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.dataset.index);
      const file = e.target.files?.[0];
      if (!file) return;

      loadingOverlay.classList.add('active');
      try {
        const loaded = await loadImage(file);
        if (state.teamMembers[idx]) {
          state.teamMembers[idx].photo = loaded;
        }
        renderTeamMemberBlocks();
        render();
      } catch (err) {
        alert('Could not load image. Please try another file.');
        console.error(err);
      } finally {
        loadingOverlay.classList.remove('active');
      }
    });
  });

  if (addTeammateBtn) {
    if (state.teamMembers.length >= 3) {
      addTeammateBtn.disabled = true;
      addTeammateBtn.style.opacity = '0.4';
    } else {
      addTeammateBtn.disabled = false;
      addTeammateBtn.style.opacity = '1';
    }
  }
}

if (addTeammateBtn) {
  addTeammateBtn.addEventListener('click', () => {
    if (state.teamMembers.length < 3) {
      state.teamMembers.push({
        id: Date.now(),
        name: '',
        stack: '',
        photo: null,
        photoOffset: { x: 0, y: 0 },
        photoScale: 1,
      });
      renderTeamMemberBlocks();
    }
  });
}

if (teamNameInput) {
  teamNameInput.addEventListener('input', () => {
    state.teamName = teamNameInput.value;
  });
}

// ── Placeholders for Designation / Stack ────────────────────────────
const STACK_PLACEHOLDERS = [
  'Student',
  'Working Professional',
  'Full-Stack Developer',
  'React, Node, Go',
  'AI Engineer, Python',
  'UI/UX Designer, Figma',
  'DevOps, Docker, K8s',
  'Frontend Wizard',
];
let placeholderIndex = 0;
let placeholderTimer = null;

function startRotatingPlaceholder() {
  if (!stackInput) return;
  stackInput.placeholder = STACK_PLACEHOLDERS[0];
  placeholderTimer = setInterval(() => {
    if (document.activeElement === stackInput || stackInput.value.length > 0) return;
    placeholderIndex = (placeholderIndex + 1) % STACK_PLACEHOLDERS.length;
    stackInput.placeholder = STACK_PLACEHOLDERS[placeholderIndex];
  }, 2400);
}

// ── Screen Navigation ───────────────────────────────────────────────
function showScreen(screenId) {
  state.currentScreen = screenId;
  introScreen.classList.remove('active');
  formScreen.classList.remove('active');
  cardScreen.classList.remove('active');

  if (screenId === 'intro') {
    introScreen.classList.add('active');
    bottomBar.style.display = 'none';
  } else if (screenId === 'form') {
    formScreen.classList.add('active');
    bottomBar.style.display = 'none';
    playBamBamSong();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (screenId === 'card') {
    cardScreen.classList.add('active');
    bottomBar.style.display = 'flex';
    pauseBamBamSong();
    render();
    playCardCelebration();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ── Intro Sequence & Sound Sync ─────────────────────────────────────
let introTimer = null;
let stingerTimer = null;

function scrollToAboutUs() {
  const aboutSec = document.getElementById('aboutUsSection');
  if (aboutSec) {
    aboutSec.scrollIntoView({ behavior: 'smooth' });
  }
}

function startIntroSequence() {
  playBamBamSong();

  stingerTimer = setTimeout(() => {
    playLogoStinger();
  }, 900);

  // Bind CTA buttons on Intro page
  const startFormBtn = document.getElementById('startFormBtn');
  if (startFormBtn) {
    startFormBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToForm();
    });
  }

  const navPassBtn = document.getElementById('navPassBtn');
  if (navPassBtn) {
    navPassBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToForm();
    });
  }

  if (introSkip) {
    introSkip.addEventListener('click', (e) => {
      e.stopPropagation();
      goToForm();
    });
  }

  // Bind About Us buttons
  const heroAboutBtn = document.getElementById('heroAboutBtn');
  if (heroAboutBtn) {
    heroAboutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollToAboutUs();
    });
  }

  const navAboutBtn = document.getElementById('navAboutBtn');
  if (navAboutBtn) {
    navAboutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      scrollToAboutUs();
    });
  }

  // Prevent member card clicks from propagating
  document.querySelectorAll('.member-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

function goToForm() {
  if (introTimer) {
    clearTimeout(introTimer);
    introTimer = null;
  }
  if (stingerTimer) {
    clearTimeout(stingerTimer);
    stingerTimer = null;
  }
  showScreen('form');
}

// ── Render helper ───────────────────────────────────────────────────
function render() {
  renderBoardingPass(canvas, {
    isTeam: state.isTeam,
    teamName: state.teamName,
    teamMembers: state.teamMembers,
    photo: state.photo,
    photoOffset: state.photoOffset,
    photoScale: state.photoScale,
    name: state.name,
    stacks: state.stacks,
    city: state.city,
    builderClass: state.isTeam ? state.teamClass : state.builderClass,
    flavorText: state.flavorText,
    logoImg: state.logoImg,
    logoHacker: state.logoHacker,
    logoGoa: state.logoGoa,
    bgScene: state.bgScene,
  });
}

// ── Preload fonts & assets ──────────────────────────────────────────
async function init() {
  // Load logo and assets
  try {
    state.logoImg = await loadImageURL('/hh-goa-logo.png');
    state.logoHacker = await loadImageURL('/hhgoa_assets/Hacker_house.png');
    state.logoGoa = await loadImageURL('/hhgoa_assets/goa_hindi.svg');
    state.bgScene = await loadImageURL('/card-bg.png');
  } catch (e) {
    console.warn('Assets not found:', e);
  }

  // Preload fonts into canvas
  await Promise.all([
    document.fonts.load('700 48px "Bodoni Moda"'),
    document.fonts.load('400 16px "Space Mono"'),
    document.fonts.load('700 16px "Space Mono"'),
  ]).catch(() => {});

  // Set initial class input safely if element exists
  const classInput = document.getElementById('classInput');
  if (classInput) {
    classInput.value = state.builderClass;
  }

  // Set initial sound toggle UI to ON
  updateSoundIcon();

  // Start rotating placeholders
  startRotatingPlaceholder();

  // Start intro sequence
  startIntroSequence();
}

// ── Photo upload ────────────────────────────────────────────────────
photoInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  loadingOverlay.classList.add('active');
  try {
    state.photo = await loadImage(file);
    state.photoOffset = { x: 0, y: 0 };
    state.photoScale = 1;
    zoomRange.value = 100;
    zoomControls.style.display = 'flex';
    uploadLabel.textContent = 'Change Photo';

    // Show thumbnail preview in form
    photoThumb.src = URL.createObjectURL(file);
    photoThumbWrap.style.display = 'flex';

    previewHint.classList.remove('hidden');
    setTimeout(() => previewHint.classList.add('hidden'), 3000);
    render();
  } catch (err) {
    alert('Could not load image. Please try another file.');
    console.error(err);
  } finally {
    loadingOverlay.classList.remove('active');
  }
});

photoThumbWrap.addEventListener('click', () => {
  photoInput.click();
});

// ── Drag-to-reposition ──────────────────────────────────────────────
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let offsetStart = { x: 0, y: 0 };

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const touch = e.touches ? e.touches[0] : e;
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleX,
  };
}

previewWrap.addEventListener('pointerdown', (e) => {
  if (!state.photo) return;
  isDragging = true;
  dragStart = getPointerPos(e);
  offsetStart = { ...state.photoOffset };
  previewWrap.setPointerCapture(e.pointerId);
});

previewWrap.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const pos = getPointerPos(e);
  state.photoOffset = {
    x: offsetStart.x + (pos.x - dragStart.x),
    y: offsetStart.y + (pos.y - dragStart.y),
  };
  render();
});

previewWrap.addEventListener('pointerup', () => {
  isDragging = false;
});

previewWrap.addEventListener('pointercancel', () => {
  isDragging = false;
});

const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomValBadge = document.getElementById('zoomValBadge');

function setZoomScale(newScale) {
  state.photoScale = Math.max(1, Math.min(3, newScale));
  const pct = Math.round(state.photoScale * 100);
  if (zoomRange) zoomRange.value = pct;
  if (zoomValBadge) zoomValBadge.textContent = `${pct}%`;
  render();
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    setZoomScale(state.photoScale - 0.15);
  });
}

if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    setZoomScale(state.photoScale + 0.15);
  });
}

previewWrap.addEventListener('wheel', (e) => {
  if (!state.photo) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  setZoomScale(state.photoScale + delta);
}, { passive: false });

if (zoomRange) {
  zoomRange.addEventListener('input', () => {
    setZoomScale(parseInt(zoomRange.value) / 100);
  });
}

// ── Form inputs & Audio Feedback ────────────────────────────────────
[nameInput, stackInput, cityInput, teamNameInput].forEach((input) => {
  if (input) {
    input.addEventListener('focus', () => playFocusTick());
  }
});

nameInput.addEventListener('input', () => {
  state.name = nameInput.value;
});

stackInput.addEventListener('input', () => {
  const raw = stackInput.value.trim();
  if (!raw) {
    state.stacks = [];
  } else if (raw.includes(',')) {
    state.stacks = raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3);
  } else {
    state.stacks = [raw];
  }
});

cityInput.addEventListener('input', () => {
  state.city = cityInput.value;
});

// ── Continue to Card View ───────────────────────────────────────────
continueBtn.addEventListener('click', () => {
  if (!state.isTeam) {
    const trimmedName = nameInput ? nameInput.value.trim() : '';
    if (!trimmedName) {
      alert('Please enter your Name before proceeding.');
      if (nameInput) {
        nameInput.focus();
        nameInput.style.borderColor = '#E6007E';
        setTimeout(() => { nameInput.style.borderColor = ''; }, 2500);
      }
      return;
    }

    if (!state.photo) {
      alert('Please upload your Photo before proceeding.');
      const uploadBtn = document.getElementById('uploadBtn');
      if (uploadBtn) {
        uploadBtn.style.borderColor = '#E6007E';
        uploadBtn.style.boxShadow = '0 0 16px rgba(230, 0, 126, 0.6)';
        setTimeout(() => {
          uploadBtn.style.borderColor = '';
          uploadBtn.style.boxShadow = '';
        }, 2500);
      }
      return;
    }

    state.name = trimmedName;
    state.city = cityInput ? (cityInput.value.trim() || 'EVERYWHERE') : 'EVERYWHERE';
    
    const rawStack = stackInput ? stackInput.value.trim() : '';
    if (!rawStack) {
      state.stacks = ['DEVELOPER'];
    } else if (rawStack.includes(',')) {
      state.stacks = rawStack.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3);
    } else {
      state.stacks = [rawStack];
    }
  } else {
    // Team mode validation: require name and photo for each teammate
    for (let i = 0; i < state.teamMembers.length; i++) {
      const member = state.teamMembers[i];
      if (!member.name || !member.name.trim()) {
        alert(`Please enter the name for Teammate ${i + 1} before proceeding.`);
        return;
      }
      if (!member.photo) {
        alert(`Please upload a photo for Teammate ${i + 1} before proceeding.`);
        return;
      }
    }
    state.teamName = (teamNameInput && teamNameInput.value.trim()) ? teamNameInput.value.trim() : 'SQUAD 404';
  }

  showScreen('card');
});

// ── Back to Form ────────────────────────────────────────────────────
backBtn.addEventListener('click', () => {
  showScreen('form');
});

// ── Download ────────────────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  renderBoardingPass(exportCanvas, {
    isTeam: state.isTeam,
    teamName: state.teamName,
    teamMembers: state.teamMembers,
    photo: state.photo,
    photoOffset: state.photoOffset,
    photoScale: state.photoScale,
    name: state.name,
    stacks: state.stacks,
    city: state.city,
    builderClass: state.isTeam ? state.teamClass : state.builderClass,
    flavorText: state.flavorText,
    logoImg: state.logoImg,
    logoHacker: state.logoHacker,
    logoGoa: state.logoGoa,
    bgScene: state.bgScene,
  });
  downloadPNG(exportCanvas);
});

// ── Share ───────────────────────────────────────────────────────────
shareBtn.addEventListener('click', () => {
  const exportCanvas = document.createElement('canvas');
  renderBoardingPass(exportCanvas, {
    isTeam: state.isTeam,
    teamName: state.teamName,
    teamMembers: state.teamMembers,
    photo: state.photo,
    photoOffset: state.photoOffset,
    photoScale: state.photoScale,
    name: state.name,
    stacks: state.stacks,
    city: state.city,
    builderClass: state.isTeam ? state.teamClass : state.builderClass,
    flavorText: state.flavorText,
    logoImg: state.logoImg,
    logoHacker: state.logoHacker,
    logoGoa: state.logoGoa,
    bgScene: state.bgScene,
  });
  const displayName = state.isTeam ? (state.teamName || 'Our team').trim() : (state.name || 'a builder').trim();
  shareToX(
    exportCanvas,
    `${displayName} just boarded Hacker House Goa! 🚀✈️ #FrameInGoa`
  );
});

// ── Boot ────────────────────────────────────────────────────────────
init();
