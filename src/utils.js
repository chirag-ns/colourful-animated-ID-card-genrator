// ── utils.js  ─  HEIC conversion, image loading, share/download ─────
import heic2any from 'heic2any';

// ── Load image from File (handles HEIC) ─────────────────────────────
export async function loadImage(file) {
  let blob = file;

  // HEIC/HEIF detection by extension or MIME
  const name = (file.name || '').toLowerCase();
  const isHeic =
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif';

  if (isHeic) {
    try {
      blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    } catch (e) {
      console.warn('HEIC conversion failed, trying as-is:', e);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

// ── Load image from URL ─────────────────────────────────────────────
export function loadImageURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}

// ── Download canvas as PNG ──────────────────────────────────────────
export function downloadPNG(canvas, filename = 'hh-goa-boarding-pass.png') {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

// ── Share to X ──────────────────────────────────────────────────────
export async function shareToX(canvas, caption) {
  const text = caption || 'Just got my boarding pass to Hacker House Goa! 🚀 #FrameInGoa';

  // Try Web Share API (mobile)
  if (navigator.canShare) {
    try {
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], 'hh-goa-boarding-pass.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ text, files: [file] });
        return;
      }
    } catch (e) {
      if (e.name === 'AbortError') return; // user cancelled
      console.warn('Web Share failed, falling back:', e);
    }
  }

  // Fallback: X intent URL
  const encoded = encodeURIComponent(text);
  window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
}
