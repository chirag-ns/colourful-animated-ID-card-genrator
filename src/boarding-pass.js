// ── boarding-pass.js  ─  HACKER HOUSE GOA 2026 Card Engine ───────────────────
import { generateBuilderId } from './data.js';

// ── Canvas Dimensions (Matching template image 682x1024 aspect ratio) ──────
const W = 1080;
const H = 1620;

// ── Brand Palette ─────────────────────────────────────────────────────────
const COL = {
  greenDk:    '#064D2A',
  greenDeep:  '#032B16',
  yellow:     '#FEE101',
  goldBorder: '#E5BE53',
  magenta:    '#E6007E',
  cream:      '#FFF8E7',
  white:      '#FFFFFF',
};

// ── Template Image Preloader ──────────────────────────────────────────────
let cardTemplateImg = null;
let isTemplateLoading = false;

function getCardTemplate(onLoadCallback) {
  if (cardTemplateImg) return cardTemplateImg;
  if (!isTemplateLoading) {
    isTemplateLoading = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cardTemplateImg = img;
      if (onLoadCallback) onLoadCallback();
    };
    img.onerror = () => {
      isTemplateLoading = false;
    };
    img.src = '/card-template.jpg';
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Draw Vertical Rectangle Photo with Decorative Multi-Border Frame
function drawVerticalRectanglePhotoInTemplate(ctx, photo, x, y, w, h, offset = { x: 0, y: 0 }, scale = 1, cornerRadius = 24) {
  // 1. Full Vertical Clip Path
  ctx.save();
  roundRect(ctx, x, y, w, h, cornerRadius);
  ctx.clip();

  // Base fill under photo
  ctx.fillStyle = COL.greenDeep;
  ctx.fillRect(x, y, w, h);

  if (photo && photo.naturalWidth) {
    const imgW = photo.naturalWidth;
    const imgH = photo.naturalHeight;
    const imgAspect = imgW / imgH;
    const boxAspect = w / h;

    let drawW, drawH;
    if (imgAspect > boxAspect) {
      drawH = h;
      drawW = h * imgAspect;
    } else {
      drawW = w;
      drawH = w / imgAspect;
    }

    drawW *= scale;
    drawH *= scale;

    const drawX = x + (w - drawW) / 2 + offset.x;
    const drawY = y + (h - drawH) / 2 + offset.y;

    ctx.drawImage(photo, drawX, drawY, drawW, drawH);
  } else {
    ctx.font = '90px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷', x + w / 2, y + h / 2);
  }
  ctx.restore();

  // 2. Multi-Layer Decorative Border Frame (Covers template frame completely)
  ctx.save();

  // Outer Dashed Accent Line
  ctx.strokeStyle = COL.yellow;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 8]);
  roundRect(ctx, x - 16, y - 16, w + 32, h + 32, cornerRadius + 12);
  ctx.stroke();
  ctx.setLineDash([]);

  // Solid Hot Pink Outer Border
  ctx.strokeStyle = COL.magenta;
  ctx.lineWidth = 10;
  roundRect(ctx, x - 8, y - 8, w + 16, h + 16, cornerRadius + 6);
  ctx.stroke();

  // Inner Mustard Yellow Border
  ctx.strokeStyle = COL.yellow;
  ctx.lineWidth = 7;
  roundRect(ctx, x, y, w, h, cornerRadius);
  ctx.stroke();

  // Fine Inner Dark Line
  ctx.strokeStyle = COL.greenDeep;
  ctx.lineWidth = 2.5;
  roundRect(ctx, x + 2, y + 2, w - 4, h - 4, cornerRadius - 2);
  ctx.stroke();

  ctx.restore();
}

// ── Main Render Entry Point ───────────────────────────────────────────
export function renderBoardingPass(canvas, opts) {
  const {
    isTeam = false,
    teamName = '',
    teamMembers = [],
    photo = null,
    photoOffset = { x: 0, y: 0 },
    photoScale = 1,
    name = 'YOUR NAME',
    stacks = [],
    builderClass = 'TERMINAL WIZARD',
  } = opts;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Load card-template.jpg
  const templateImg = getCardTemplate(() => {
    renderBoardingPass(canvas, opts);
  });

  // 1. Base Pristine Template Background
  if (templateImg && templateImg.naturalWidth) {
    ctx.drawImage(templateImg, 0, 0, W, H);
  } else {
    ctx.fillStyle = COL.greenDk;
    ctx.fillRect(0, 0, W, H);
  }

  // 2. Render Solo or Team Content Overlays
  if (isTeam && teamMembers && teamMembers.length > 0) {
    renderTeamCardContent(ctx, { teamName, teamMembers });
  } else {
    renderSoloCardContent(ctx, { photo, photoOffset, photoScale, name, stacks, builderClass });
  }
}

// ── Solo Mode Overlays ────────────────────────────────────────────────
function renderSoloCardContent(ctx, opts) {
  const { photo, photoOffset, photoScale, name, stacks, builderClass } = opts;

  // Vertical Rectangle Frame bounds (295, 435, 490, 560)
  drawVerticalRectanglePhotoInTemplate(ctx, photo, 295, 435, 490, 560, photoOffset, photoScale, 24);

  // Render Builder Name (Covers "CHIRAG NS")
  const nameX = 155;
  const nameY = 1010;
  const nameW = 770;
  const nameH = 115;

  ctx.save();
  roundRect(ctx, nameX, nameY, nameW, nameH, 16);
  ctx.fillStyle = COL.greenDeep;
  ctx.strokeStyle = COL.yellow;
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();

  const displayName = (name || 'YOUR NAME').trim().toUpperCase();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let nameFontSize = 52;
  ctx.font = `900 ${nameFontSize}px "Victor Mono", "Space Mono", monospace`;
  while (ctx.measureText(displayName).width > nameW - 40 && nameFontSize > 22) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px "Victor Mono", "Space Mono", monospace`;
  }

  ctx.fillStyle = COL.cream;
  ctx.fillText(displayName, W / 2, nameY + nameH / 2 + 2);
  ctx.restore();

  // Render Designation & Stack (Covers "VIP BUILDER")
  const ribbonX = 250;
  const ribbonY = 1135;
  const ribbonW = 580;
  const ribbonH = 65;

  ctx.save();
  roundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 12);
  ctx.fillStyle = COL.magenta;
  ctx.strokeStyle = COL.yellow;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();

  let roleText = '';
  if (stacks && stacks.length > 0) {
    roleText = stacks.slice(0, 2).join(' • ').toUpperCase();
  } else {
    roleText = (builderClass || 'BUILDER').toUpperCase();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let roleFontSize = 26;
  ctx.font = `800 ${roleFontSize}px "Victor Mono", "Space Mono", monospace`;
  while (ctx.measureText(roleText).width > ribbonW - 30 && roleFontSize > 14) {
    roleFontSize -= 1;
    ctx.font = `800 ${roleFontSize}px "Victor Mono", "Space Mono", monospace`;
  }

  ctx.fillStyle = COL.yellow;
  ctx.fillText(roleText, W / 2, ribbonY + ribbonH / 2 + 1);
  ctx.restore();

  // Render Dynamic Builder ID Text on Left Ticket Stub
  const builderId = generateBuilderId(name || 'BUILDER');
  ctx.save();
  ctx.fillStyle = COL.yellow;
  ctx.font = '800 19px "Victor Mono", "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(builderId, 195, 1526);
  ctx.restore();
}

// ── Team Mode Overlays ────────────────────────────────────────────────
function renderTeamCardContent(ctx, opts) {
  const { teamName, teamMembers } = opts;

  const count = Math.min(3, Math.max(2, teamMembers.length));

  let grid = [];
  if (count === 2) {
    grid = [
      { x: 140, y: 460, w: 380, h: 480 },
      { x: 560, y: 460, w: 380, h: 480 },
    ];
  } else {
    grid = [
      { x: 70, y: 470, w: 290, h: 440 },
      { x: 395, y: 470, w: 290, h: 440 },
      { x: 720, y: 470, w: 290, h: 440 },
    ];
  }

  teamMembers.slice(0, 3).forEach((m, idx) => {
    const pos = grid[idx];
    if (!pos) return;

    drawVerticalRectanglePhotoInTemplate(
      ctx,
      m.photo,
      pos.x,
      pos.y,
      pos.w,
      pos.h,
      m.photoOffset || { x: 0, y: 0 },
      m.photoScale || 1,
      20
    );

    const plateY = pos.y + pos.h - 60;
    ctx.save();
    roundRect(ctx, pos.x + 10, plateY, pos.w - 20, 50, 8);
    ctx.fillStyle = COL.greenDeep;
    ctx.strokeStyle = COL.yellow;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();

    ctx.font = '800 18px "Victor Mono", "Space Mono", monospace';
    ctx.fillStyle = COL.cream;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((m.name || `MEMBER ${idx + 1}`).toUpperCase(), pos.cx || (pos.x + pos.w / 2), plateY + 25);
    ctx.restore();
  });

  // Name Box: Team Name
  const nameX = 155;
  const nameY = 1010;
  const nameW = 770;
  const nameH = 115;

  ctx.save();
  roundRect(ctx, nameX, nameY, nameW, nameH, 16);
  ctx.fillStyle = COL.greenDeep;
  ctx.strokeStyle = COL.yellow;
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();

  const tName = (teamName || 'YOUR TEAM').trim().toUpperCase();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let nameFontSize = 48;
  ctx.font = `900 ${nameFontSize}px "Victor Mono", "Space Mono", monospace`;
  while (ctx.measureText(tName).width > nameW - 40 && nameFontSize > 20) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px "Victor Mono", "Space Mono", monospace`;
  }
  ctx.fillStyle = COL.cream;
  ctx.fillText(tName, W / 2, nameY + nameH / 2 + 2);
  ctx.restore();

  // Ribbon: TEAM FIELD PASS
  const ribbonX = 250;
  const ribbonY = 1135;
  const ribbonW = 580;
  const ribbonH = 65;

  ctx.save();
  roundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 12);
  ctx.fillStyle = COL.magenta;
  ctx.strokeStyle = COL.yellow;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();

  ctx.font = '800 24px "Victor Mono", "Space Mono", monospace';
  ctx.fillStyle = COL.yellow;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ TEAM FIELD PASS ★', W / 2, ribbonY + ribbonH / 2 + 1);
  ctx.restore();
}

// ── Export PNG ────────────────────────────────────────────────────────
export function exportPNG(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}
