/**
 * Image Cropper Engine
 * Pure canvas utility for precise bounding box cropping,
 * arbitrary aspect ratio clamping, 90-degree step rotations, and horizontal flips.
 */

export const CROP_RATIO_PRESETS = [
  { id: 'free', label: '自由比例', ratio: null },
  { id: '1:1', label: '1:1 正方形', ratio: 1 },
  { id: '2.35:1', label: '2.35:1 公众号', ratio: 2.35 },
  { id: '16:9', label: '16:9 宽屏', ratio: 16 / 9 },
  { id: '4:3', label: '4:3 经典', ratio: 4 / 3 },
  { id: '3:4', label: '3:4 竖版', ratio: 3 / 4 },
  { id: '9:16', label: '9:16 竖屏', ratio: 9 / 16 }
];

export function getOrientedDimensions(width, height, rotation = 0) {
  const normRot = ((rotation % 360) + 360) % 360;
  const isPerp = normRot === 90 || normRot === 270;
  return {
    width: isPerp ? height : width,
    height: isPerp ? width : height
  };
}

/**
 * Crop image to high-resolution Canvas
 * @param {HTMLImageElement} image
 * @param {Object} cropBox { x, y, width, height } in oriented image coordinates
 * @param {Object} options { rotation, flipH }
 * @returns {HTMLCanvasElement}
 */
export function cropImageToCanvas(image, cropBox, options = {}) {
  const { rotation = 0, flipH = false } = options;
  const origW = image.naturalWidth || image.width;
  const origH = image.naturalHeight || image.height;

  const oriented = getOrientedDimensions(origW, origH, rotation);
  const currentW = oriented.width;
  const currentH = oriented.height;

  // Clamp crop rectangle to boundary
  const x = Math.max(0, Math.min(cropBox.x, currentW));
  const y = Math.max(0, Math.min(cropBox.y, currentH));
  const w = Math.max(1, Math.min(cropBox.width, currentW - x));
  const h = Math.max(1, Math.min(cropBox.height, currentH - y));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  // 1. Shift canvas origin so crop box top-left becomes (0, 0)
  ctx.translate(-x, -y);

  // 2. Move to center of oriented image
  ctx.translate(currentW / 2, currentH / 2);

  // 3. Rotate
  const normRot = ((rotation % 360) + 360) % 360;
  ctx.rotate((normRot * Math.PI) / 180);

  // 4. Flip
  if (flipH) {
    ctx.scale(-1, 1);
  }

  // 5. Draw original image centered
  ctx.drawImage(image, -origW / 2, -origH / 2);

  return canvas;
}

export function canvasToBlob(canvas, quality = 0.95) {
  return new Promise((resolve, reject) => {
    if (!canvas) return reject(new Error('Canvas 不存在'));
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('生成裁剪图片失败'));
    }, 'image/png', quality);
  });
}

export function downloadCanvas(canvas, filename = 'cropped-image.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 0.96);
  link.click();
}
