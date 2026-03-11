export async function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function drawToCanvas(img, maxW, maxH) {
  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

async function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function pickExt(mime) {
  return mime === 'image/webp' ? 'webp' : 'jpg';
}

export async function generateVariantBlobs(file) {
  const img = await loadImageFromFile(file);
  // Limits
  const FULL_MAX = 1600;
  const CARD_MAX = 800;
  const THUMB_MAX = 320;

  // Try WebP first, fallback to JPEG if needed
  const preferred = 'image/webp';
  const fallback = 'image/jpeg';

  // Full
  const fullCanvas = drawToCanvas(img, FULL_MAX, FULL_MAX);
  let fullBlob = await canvasToBlob(fullCanvas, preferred, 0.85);
  let fullType = preferred;
  if (!fullBlob || fullBlob.size === 0) {
    fullBlob = await canvasToBlob(fullCanvas, fallback, 0.85);
    fullType = fallback;
  }

  // Card
  const cardCanvas = drawToCanvas(img, CARD_MAX, CARD_MAX);
  let cardBlob = await canvasToBlob(cardCanvas, preferred, 0.82);
  let cardType = preferred;
  if (!cardBlob || cardBlob.size === 0) {
    cardBlob = await canvasToBlob(cardCanvas, fallback, 0.82);
    cardType = fallback;
  }

  // Thumb
  const thumbCanvas = drawToCanvas(img, THUMB_MAX, THUMB_MAX);
  let thumbBlob = await canvasToBlob(thumbCanvas, preferred, 0.8);
  let thumbType = preferred;
  if (!thumbBlob || thumbBlob.size === 0) {
    thumbBlob = await canvasToBlob(thumbCanvas, fallback, 0.8);
    thumbType = fallback;
  }

  return {
    width: img.width,
    height: img.height,
    full: { blob: fullBlob, type: fullType, ext: pickExt(fullType) },
    card: { blob: cardBlob, type: cardType, ext: pickExt(cardType) },
    thumb: { blob: thumbBlob, type: thumbType, ext: pickExt(thumbType) },
  };
}

export function makeVariantFilenames(baseName) {
  const safe = (baseName || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return {
    full: `${safe}-full`,
    card: `${safe}-card`,
    thumb: `${safe}-thumb`,
  };
}