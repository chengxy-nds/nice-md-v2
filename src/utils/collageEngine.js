/**
 * Collage Canvas Rendering Engine
 * Handles normalized layout calculations, object-fit cover clipping,
 * multi-cell image panning/scaling, and high-DPI canvas export.
 */

export const COLLAGE_RATIOS = [
  { id: 'wechat-cover', name: '公众号首图 (2.35:1)', ratio: 2.35, width: 1880, height: 800, badge: '官方推荐' },
  { id: 'square', name: '社交正方形 (1:1)', ratio: 1, width: 1200, height: 1200, badge: '次条/头图' },
  { id: '16:9', name: '横屏宽画幅 (16:9)', ratio: 16 / 9, width: 1920, height: 1080, badge: '高清' },
  { id: '3:4', name: '社交竖版 (3:4)', ratio: 3 / 4, width: 900, height: 1200, badge: '小红书' },
  { id: '4:3', name: '经典杂志 (4:3)', ratio: 4 / 3, width: 1200, height: 900, badge: '画报' },
  { id: '9:16', name: '手机竖屏 (9:16)', ratio: 9 / 16, width: 1080, height: 1920, badge: '全屏' }
];

function makeRowLayout(id, name, rowCounts) {
  const rowHeight = 1 / rowCounts.length;
  const cells = rowCounts.flatMap((count, row) => Array.from({ length: count }, (_, col) => ({
    x: col / count,
    y: row * rowHeight,
    w: 1 / count,
    h: rowHeight
  })));
  return { id, name, cellsCount: cells.length, cells };
}

function makeHeroLeftLayout(id, name, cellsCount) {
  const heroWidth = 0.62;
  const sideWidth = 1 - heroWidth;
  const sideCount = cellsCount - 1;
  return {
    id,
    name,
    cellsCount,
    cells: [
      { x: 0, y: 0, w: heroWidth, h: 1 },
      ...Array.from({ length: sideCount }, (_, index) => ({
        x: heroWidth,
        y: index / sideCount,
        w: sideWidth,
        h: 1 / sideCount
      }))
    ]
  };
}

export const COLLAGE_LAYOUTS = [
  {
    id: '1-cell',
    name: '单图封面',
    cellsCount: 1,
    cells: [
      { x: 0, y: 0, w: 1, h: 1 }
    ]
  },
  {
    id: '2-split-h',
    name: '左右双拼',
    cellsCount: 2,
    cells: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 }
    ]
  },
  {
    id: '2-split-v',
    name: '上下双拼',
    cellsCount: 2,
    cells: [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 }
    ]
  },
  {
    id: '3-hero-left',
    name: '左一大右二小 (品字)',
    cellsCount: 3,
    cells: [
      { x: 0, y: 0, w: 0.6, h: 1 },
      { x: 0.6, y: 0, w: 0.4, h: 0.5 },
      { x: 0.6, y: 0.5, w: 0.4, h: 0.5 }
    ]
  },
  {
    id: '3-hero-top',
    name: '上一大下二小',
    cellsCount: 3,
    cells: [
      { x: 0, y: 0, w: 1, h: 0.6 },
      { x: 0, y: 0.6, w: 0.5, h: 0.4 },
      { x: 0.5, y: 0.6, w: 0.5, h: 0.4 }
    ]
  },
  {
    id: '3-cols',
    name: '三列并排',
    cellsCount: 3,
    cells: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 }
    ]
  },
  {
    id: '4-grid',
    name: '经典四田字格',
    cellsCount: 4,
    cells: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ]
  },
  {
    id: '4-hero-left',
    name: '左一主图 + 右三副图',
    cellsCount: 4,
    cells: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 1 / 3 },
      { x: 0.62, y: 1 / 3, w: 0.38, h: 1 / 3 },
      { x: 0.62, y: 2 / 3, w: 0.38, h: 1 / 3 }
    ]
  },
  {
    id: '4-cols',
    name: '四列竖拼',
    cellsCount: 4,
    cells: [
      { x: 0, y: 0, w: 0.25, h: 1 },
      { x: 0.25, y: 0, w: 0.25, h: 1 },
      { x: 0.5, y: 0, w: 0.25, h: 1 },
      { x: 0.75, y: 0, w: 0.25, h: 1 }
    ]
  },
  {
    id: '5-magazine',
    name: '五图杂志风 (左二右三)',
    cellsCount: 5,
    cells: [
      { x: 0, y: 0, w: 0.44, h: 0.5 },
      { x: 0, y: 0.5, w: 0.44, h: 0.5 },
      { x: 0.44, y: 0, w: 0.56, h: 1 / 3 },
      { x: 0.44, y: 1 / 3, w: 0.56, h: 1 / 3 },
      { x: 0.44, y: 2 / 3, w: 0.56, h: 1 / 3 }
    ]
  },
  {
    id: '6-grid',
    name: '六图矩阵 (3×2)',
    cellsCount: 6,
    cells: [
      { x: 0, y: 0, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 0, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 }
    ]
  },
  {
    id: '2-split-h-wide',
    name: '左右主次拼',
    cellsCount: 2,
    cells: [
      { x: 0, y: 0, w: 0.66, h: 1 },
      { x: 0.66, y: 0, w: 0.34, h: 1 }
    ]
  },
  {
    id: '2-split-v-wide',
    name: '上下主次拼',
    cellsCount: 2,
    cells: [
      { x: 0, y: 0, w: 1, h: 0.66 },
      { x: 0, y: 0.66, w: 1, h: 0.34 }
    ]
  },
  {
    id: '3-hero-right',
    name: '右一大左二小',
    cellsCount: 3,
    cells: [
      { x: 0, y: 0, w: 0.4, h: 0.5 },
      { x: 0, y: 0.5, w: 0.4, h: 0.5 },
      { x: 0.4, y: 0, w: 0.6, h: 1 }
    ]
  },
  makeRowLayout('3-stacked', '三行横排', [1, 1, 1]),
  makeRowLayout('3-offset', '上下错列', [1, 2]),
  makeRowLayout('3-offset-reverse', '上二下一', [2, 1]),
  {
    id: '4-hero-top',
    name: '上一大下三小',
    cellsCount: 4,
    cells: [
      { x: 0, y: 0, w: 1, h: 0.58 },
      { x: 0, y: 0.58, w: 1 / 3, h: 0.42 },
      { x: 1 / 3, y: 0.58, w: 1 / 3, h: 0.42 },
      { x: 2 / 3, y: 0.58, w: 1 / 3, h: 0.42 }
    ]
  },
  {
    id: '4-hero-bottom',
    name: '下方主图',
    cellsCount: 4,
    cells: [
      { x: 0, y: 0, w: 1 / 3, h: 0.42 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.42 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.42 },
      { x: 0, y: 0.42, w: 1, h: 0.58 }
    ]
  },
  makeRowLayout('4-rows', '四行横排', [1, 1, 1, 1]),
  makeRowLayout('5-grid', '五格均衡拼', [2, 3]),
  makeRowLayout('5-grid-reverse', '上三下二', [3, 2]),
  makeHeroLeftLayout('5-hero-left', '左主图右四格', 5),
  makeRowLayout('5-masonry', '三行错列', [2, 1, 2]),
  makeRowLayout('6-grid-2x3', '两列三行', [2, 2, 2]),
  makeHeroLeftLayout('6-hero-left', '左主图右五格', 6),
  makeRowLayout('6-masonry', '错列拼接', [1, 2, 3]),
  makeRowLayout('7-grid', '四上三下', [4, 3]),
  makeRowLayout('7-masonry', '三行错列', [2, 2, 3]),
  makeHeroLeftLayout('7-hero-left', '左主图右六格', 7),
  makeRowLayout('8-grid-4x2', '四列两行', [4, 4]),
  makeRowLayout('8-grid-2x4', '两列四行', [2, 2, 2, 2]),
  makeHeroLeftLayout('8-hero-left', '左主图右七格', 8),
  makeRowLayout('8-masonry', '三行错列', [2, 3, 3]),
  makeRowLayout('9-grid', '经典九宫格', [3, 3, 3]),
  makeHeroLeftLayout('9-hero-left', '左主图右八格', 9)
];

export const COLLAGE_BG_COLORS = [
  { label: '纯白', value: '#FFFFFF', border: '#E2E8F0' },
  { label: '极夜黑', value: '#0F172A', border: '#334155' },
  { label: '云石灰', value: '#F8FAFC', border: '#E2E8F0' },
  { label: '暖羊皮', value: '#FDFBF7', border: '#E7DFD5' },
  { label: '淡樱粉', value: '#FFF1F2', border: '#FECDD3' },
  { label: '薄荷淡青', value: '#F0FDF4', border: '#BBF7D0' },
  { label: '透明', value: 'transparent', border: '#CBD5E1', isTransparent: true }
];

/**
 * Extract image references from markdown source
 */
export function extractImagesFromMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') return [];
  const results = [];
  const seen = new Set();

  // 1. Markdown syntax ![alt](url)
  const mdImgRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  let match;
  while ((match = mdImgRegex.exec(markdown)) !== null) {
    const alt = (match[1] || '').trim();
    const url = (match[2] || '').trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      results.push({ url, alt: alt || '文档图片', source: 'markdown' });
    }
  }

  // 2. HTML <img> tags
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImgRegex.exec(markdown)) !== null) {
    const url = (match[1] || '').trim();
    if (url && !seen.has(url)) {
      seen.add(url);
      results.push({ url, alt: '文档配图', source: 'html' });
    }
  }

  return results;
}

/**
 * Host of an image URL, for user-facing CORS errors (never the full URL,
 * which may contain tokens / signed query strings).
 */
export function getImageHost(src) {
  try {
    return new URL(src, window.location.href).host || '该图片';
  } catch {
    return '该图片';
  }
}

/**
 * Friendly, user-facing error for an image that cannot be exported because
 * its host does not allow cross-origin canvas export.
 */
export function corsExportError(src) {
  return new Error(`图片不支持跨域导出: ${getImageHost(src)}，请先下载到本地再上传，或换一张图`);
}

/**
 * Load a single Image element from a URL. Resolves only with a CLEAN image
 * (one that can be drawn to canvas without tainting it). Never resolves a
 * tainted image.
 */
function loadImageElement(src, { crossOrigin = false } = {}) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (img.naturalWidth > 0) resolve(img);
      else reject(new Error('图片为空: ' + getImageHost(src)));
    };
    img.onerror = () => reject(new Error('无法加载图片: ' + getImageHost(src)));
    img.src = src;
  });
}

/**
 * Load an image from URL into an HTMLImageElement.
 *
 * Invariant: this function only ever resolves CLEAN images that are safe to
 * draw to a canvas and export with toBlob()/toDataURL(). The old silent
 * fallback (retry without crossOrigin when the server sent no CORS headers)
 * is deliberately gone: that retry image displayed fine but tainted the
 * canvas, so export failed later with a cryptic "Tainted canvases" error.
 *
 * Load order for remote http(s) URLs:
 *   (a) fetch(mode: 'cors', 15s timeout) -> blob -> same-origin object URL;
 *   (b) Image with crossOrigin='anonymous';
 *   (c) reject with a friendly error naming the host.
 * data:/blob: URLs and same-origin/relative URLs load directly and are clean.
 */
const imageCache = new Map();

export async function loadImage(src) {
  if (!src) throw new Error('图片地址为空');
  const cached = imageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0 && cached.__clean) {
    return cached;
  }

  const isRemote = /^https?:\/\//i.test(src);
  let img;

  if (!isRemote) {
    // data:/blob:/same-origin/relative URLs: no crossOrigin needed, clean.
    img = await loadImageElement(src);
  } else {
    // (a) Fetch as a blob first: a same-origin blob URL never taints.
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      let blob;
      try {
        const res = await fetch(src, { mode: 'cors', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        blob = await res.blob();
      } finally {
        clearTimeout(timer);
      }
      if (!blob || !blob.type.startsWith('image/')) {
        throw new Error('返回的不是图片');
      }
      const blobUrl = URL.createObjectURL(blob);
      try {
        img = await loadImageElement(blobUrl);
      } catch (e) {
        URL.revokeObjectURL(blobUrl);
        throw e;
      }
      // Keep the blob URL alive while the image is cached; it is the
      // image's backing store. It is revoked only if loading fails above.
    } catch {
      // (b) Fall back to an anonymous CORS image load.
      try {
        img = await loadImageElement(src, { crossOrigin: true });
      } catch {
        // (c) Never resolve a tainted image: reject with the host named.
        throw corsExportError(src);
      }
    }
  }

  img.__clean = true;
  imageCache.set(src, img);
  return img;
}

/**
 * Check whether the used cells of a collage can be exported.
 * A cell is exportable only if its image was loaded cleanly via loadImage()
 * (present in imageMap and flagged __clean). Returns { ok, badUrls } where
 * badUrls lists { url, host, cellIndex } (1-based) for every bad used cell.
 * Use before canvasToBlob()/downloadCanvas() so the user gets a clear
 * message naming the culprit instead of a raw "Tainted canvases" throw.
 */
export function checkCollageExportable(cellStates = [], imageMap = new Map()) {
  const badUrls = [];
  (cellStates || []).forEach((cellState, index) => {
    const url = cellState?.url;
    if (!url) return;
    const img = imageMap?.get(url);
    if (!img || !img.__clean || !img.complete || img.naturalWidth <= 0) {
      badUrls.push({ url, host: getImageHost(url), cellIndex: index + 1 });
    }
  });
  return { ok: badUrls.length === 0, badUrls };
}

export function collageExportErrorMessage(badUrls = []) {
  if (!badUrls.length) return '图片导出失败：画布包含不支持跨域导出的图片，请先下载到本地再上传，或换一张图';
  const parts = badUrls.map(({ host, cellIndex }) => `拼块 #${cellIndex}（${host}）`);
  return `无法导出：${parts.join('、')} 不支持跨域导出，请先下载到本地再上传，或换一张图`;
}

/**
 * Compute the pixel rectangle of a normalized cell definition
 */
export function computeCellGeometry(cellDef, canvasWidth, canvasHeight, gap, padding) {
  const innerW = Math.max(1, canvasWidth - padding * 2);
  const innerH = Math.max(1, canvasHeight - padding * 2);

  const rawX = padding + cellDef.x * innerW;
  const rawY = padding + cellDef.y * innerH;
  const rawW = cellDef.w * innerW;
  const rawH = cellDef.h * innerH;

  const halfGap = gap / 2;
  const isLeftEdge = cellDef.x <= 0.001;
  const isRightEdge = cellDef.x + cellDef.w >= 0.999;
  const isTopEdge = cellDef.y <= 0.001;
  const isBottomEdge = cellDef.y + cellDef.h >= 0.999;

  const leftTrim = isLeftEdge ? 0 : halfGap;
  const rightTrim = isRightEdge ? 0 : halfGap;
  const topTrim = isTopEdge ? 0 : halfGap;
  const bottomTrim = isBottomEdge ? 0 : halfGap;

  const x = rawX + leftTrim;
  const y = rawY + topTrim;
  const w = Math.max(1, rawW - (leftTrim + rightTrim));
  const h = Math.max(1, rawH - (topTrim + bottomTrim));

  return { x, y, w, h };
}

/**
 * Helper to draw a rounded rectangle path on Canvas context
 */
function drawRoundedPath(ctx, x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}

/**
 * Draw an image into a cell rect with object-fit: cover, applying the cell's
 * zoom & pan. Shared by the normal cell render and the drag ghost so the
 * carried tile looks exactly like it does in its cell.
 */
function drawCoverImage(ctx, imgObj, geom, cellState) {
  const cellRatio = geom.w / geom.h;
  const imgRatio = imgObj.naturalWidth / imgObj.naturalHeight;
  const zoom = Math.max(1, Math.min(3, cellState.zoom || 1));

  let drawW, drawH;
  if (imgRatio > cellRatio) {
    drawH = geom.h * zoom;
    drawW = geom.h * imgRatio * zoom;
  } else {
    drawW = geom.w * zoom;
    drawH = (geom.w / imgRatio) * zoom;
  }

  const panXRatio = cellState.panX || 0;
  const panYRatio = cellState.panY || 0;
  const maxPanX = (drawW - geom.w) / 2;
  const maxPanY = (drawH - geom.h) / 2;

  const drawX = geom.x + (geom.w - drawW) / 2 + panXRatio * maxPanX;
  const drawY = geom.y + (geom.h - drawH) / 2 + panYRatio * maxPanY;

  ctx.drawImage(imgObj, drawX, drawY, drawW, drawH);
}

/**
 * Render complete collage onto a Canvas element.
 * Optional config.dragState { fromIndex, overIndex, ghostX, ghostY } draws a
 * drag-to-swap in progress: the source cell renders as a lifted empty slot,
 * the hovered cell gets a drop-target highlight, and the carried tile is
 * drawn as a semi-transparent ghost following the pointer (canvas coords).
 */
export function renderCollageToCanvas(canvas, config, imageMap = new Map()) {
  if (!canvas) return;
  const {
    width,
    height,
    layout,
    gap = 8,
    padding = 12,
    radius = 12,
    backgroundColor = '#FFFFFF',
    cellStates = [],
    selectedCellIndex = null,
    dragState = null
  } = config;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Draw Canvas Background
  ctx.clearRect(0, 0, width, height);
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  const cells = layout?.cells || [{ x: 0, y: 0, w: 1, h: 1 }];

  // 2. Render each cell
  cells.forEach((cellDef, index) => {
    const geom = computeCellGeometry(cellDef, width, height, gap, padding);
    const cellState = cellStates[index] || {};
    const imgObj = cellState.url ? imageMap.get(cellState.url) : null;
    const isSelected = selectedCellIndex === index;
    const isDragSource = dragState !== null && dragState.fromIndex === index;
    const isDropTarget = dragState !== null && dragState.overIndex === index && dragState.overIndex !== dragState.fromIndex;

    ctx.save();

    // Create Cell Clipping Region with Border Radius
    ctx.beginPath();
    drawRoundedPath(ctx, geom.x, geom.y, geom.w, geom.h, radius);
    ctx.closePath();

    if (imgObj && imgObj.complete && imgObj.naturalWidth > 0 && !isDragSource) {
      // Cell background fill
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();

      ctx.clip();

      // object-fit: cover with user zoom & pan (shared with the drag ghost)
      drawCoverImage(ctx, imgObj, geom, cellState);
    } else if (isDragSource) {
      // Lifted tile: the image is on the ghost, so the source cell renders
      // as a dimmed empty slot with a dashed outline.
      ctx.fillStyle = '#E8EEF5';
      ctx.fill();

      ctx.lineWidth = Math.max(2, Math.round(width / 600));
      ctx.strokeStyle = '#94A3B8';
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Empty cell placeholder
      ctx.fillStyle = isSelected ? '#EFF6FF' : '#F8FAFC';
      ctx.fill();

      ctx.lineWidth = Math.max(2, Math.round(width / 600));
      ctx.strokeStyle = isSelected ? '#3B82F6' : '#CBD5E1';
      ctx.setLineDash([8, 6]);
      ctx.stroke();

      // Keep the hint consistent in CSS pixels. Tiny cells use a simple plus mark.
      ctx.setLineDash([]);
      const cssScale = Math.min(canvas.clientWidth / width, canvas.clientHeight / height) || 1;
      const cellShortSide = Math.min(geom.w, geom.h);
      const visibleCellSize = cellShortSide * cssScale;
      const centerX = geom.x + geom.w / 2;
      const centerY = geom.y + geom.h / 2;

      if (isSelected && visibleCellSize >= 96) {
        ctx.fillStyle = '#64748B';
        const hintFontSize = Math.min(16 / cssScale, cellShortSide * 0.08);
        ctx.font = `500 ${hintFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('添加图片', centerX, centerY);
      } else {
        const markerCssSize = Math.min(28, Math.max(14, visibleCellSize * 0.22));
        const markerSize = markerCssSize / cssScale;
        const circleRadius = markerSize * 0.7;
        const halfMark = markerSize * 0.28;
        ctx.strokeStyle = isSelected ? '#64748B' : '#94A3B8';
        ctx.lineWidth = 2 / cssScale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.moveTo(centerX - halfMark, centerY);
        ctx.lineTo(centerX + halfMark, centerY);
        ctx.moveTo(centerX, centerY - halfMark);
        ctx.lineTo(centerX, centerY + halfMark);
        ctx.stroke();
      }
    }

    ctx.restore();

    // 3. Selection outline highlight
    if (isSelected) {
      ctx.save();
      ctx.beginPath();
      drawRoundedPath(ctx, geom.x, geom.y, geom.w, geom.h, radius);
      ctx.lineWidth = Math.max(3, Math.round(width / 400));
      ctx.strokeStyle = '#2563EB';
      ctx.shadowColor = 'rgba(37, 99, 235, 0.35)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Drop-target highlight for a drag-to-swap in progress
    if (isDropTarget) {
      ctx.save();
      ctx.beginPath();
      drawRoundedPath(ctx, geom.x, geom.y, geom.w, geom.h, radius);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.14)';
      ctx.fill();
      ctx.lineWidth = Math.max(4, Math.round(width / 300));
      ctx.strokeStyle = '#2563EB';
      ctx.shadowColor = 'rgba(37, 99, 235, 0.45)';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    }
  });

  // 5. Drag ghost: the carried tile follows the pointer, semi-transparent,
  // at the source cell's size and with its zoom/pan intact.
  if (dragState) {
    const fromState = cellStates[dragState.fromIndex] || {};
    const ghostImg = fromState.url ? imageMap.get(fromState.url) : null;
    const fromCell = cells[dragState.fromIndex];
    if (ghostImg && ghostImg.complete && ghostImg.naturalWidth > 0 && fromCell) {
      const fromGeom = computeCellGeometry(fromCell, width, height, gap, padding);
      const ghostGeom = {
        x: dragState.ghostX - fromGeom.w / 2,
        y: dragState.ghostY - fromGeom.h / 2,
        w: fromGeom.w,
        h: fromGeom.h
      };
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.shadowColor = 'rgba(15, 23, 42, 0.45)';
      ctx.shadowBlur = Math.max(12, Math.round(width / 100));
      ctx.shadowOffsetY = Math.max(6, Math.round(width / 200));
      ctx.beginPath();
      drawRoundedPath(ctx, ghostGeom.x, ghostGeom.y, ghostGeom.w, ghostGeom.h, radius);
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();
      // The shadow must not bleed into the image itself.
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.clip();
      drawCoverImage(ctx, ghostImg, ghostGeom, fromState);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      drawRoundedPath(ctx, ghostGeom.x, ghostGeom.y, ghostGeom.w, ghostGeom.h, radius);
      ctx.lineWidth = Math.max(3, Math.round(width / 400));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.stroke();
      ctx.restore();
    }
  }
}

/**
 * Export canvas to PNG Blob.
 * A tainted canvas throws synchronously from toBlob(); translate that into
 * the same friendly message the export guard uses, instead of the raw
 * "Tainted canvases may not be exported" error.
 */
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas) return reject(new Error('Canvas 不存在'));
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('图片导出失败：画布包含不支持跨域导出的图片，请先下载到本地再上传，或换一张图'));
      }, 'image/png', 0.96);
    } catch (err) {
      const msg = String(err?.message || '');
      if (err?.name === 'SecurityError' || /taint/i.test(msg)) {
        reject(new Error('图片导出失败：画布包含不支持跨域导出的图片，请先下载到本地再上传，或换一张图'));
      } else {
        reject(err);
      }
    }
  });
}

/**
 * Trigger local browser download for canvas image
 */
export function downloadCanvas(canvas, filename = 'cover-collage.png') {
  const link = document.createElement('a');
  link.download = filename;
  try {
    link.href = canvas.toDataURL('image/png', 0.96);
  } catch (err) {
    const msg = String(err?.message || '');
    if (err?.name === 'SecurityError' || /taint/i.test(msg)) {
      throw new Error('图片导出失败：画布包含不支持跨域导出的图片，请先下载到本地再上传，或换一张图');
    }
    throw err;
  }
  link.click();
}

