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
    name: '六图矩阵 (2×3)',
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
 * Load an image from URL into an HTMLImageElement
 */
const imageCache = new Map();

export function loadImage(src) {
  if (!src) return Promise.reject(new Error('图片地址为空'));
  if (imageCache.has(src)) {
    const cached = imageCache.get(src);
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      // Retry without anonymous in case server prohibits CORS but allows canvas drawing
      if (img.crossOrigin) {
        const retryImg = new window.Image();
        retryImg.onload = () => {
          imageCache.set(src, retryImg);
          resolve(retryImg);
        };
        retryImg.onerror = (err) => reject(err);
        retryImg.src = src;
      } else {
        reject(new Error('无法加载图片: ' + src));
      }
    };
    img.src = src;
  });
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
 * Render complete collage onto a Canvas element
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
    selectedCellIndex = null
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

    ctx.save();

    // Create Cell Clipping Region with Border Radius
    ctx.beginPath();
    drawRoundedPath(ctx, geom.x, geom.y, geom.w, geom.h, radius);
    ctx.closePath();

    if (imgObj && imgObj.complete && imgObj.naturalWidth > 0) {
      // Cell background fill
      ctx.fillStyle = '#E2E8F0';
      ctx.fill();

      ctx.clip();

      // Calculate object-fit: cover with user zoom & pan
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
  });
}

/**
 * Export canvas to PNG Blob
 */
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas) return reject(new Error('Canvas 不存在'));
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('生成图片失败'));
    }, 'image/png', 0.96);
  });
}

/**
 * Trigger local browser download for canvas image
 */
export function downloadCanvas(canvas, filename = 'cover-collage.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 0.96);
  link.click();
}

