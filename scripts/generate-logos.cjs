const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function encodePNG(width, height, rgbaBuffer) {
  const stride = width * 4;
  const rawScanlines = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y++) {
    rawScanlines[y * (stride + 1)] = 0; // Filter None
    rgbaBuffer.copy(rawScanlines, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });

  const chunks = [];

  // Signature
  chunks.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = Buffer.alloc(12 + 13);
  ihdrChunk.writeUInt32BE(13, 0);
  ihdrChunk.write('IHDR', 4);
  ihdrData.copy(ihdrChunk, 8);
  const ihdrCrc = crc32(ihdrChunk.slice(4, 21));
  ihdrChunk.writeUInt32BE(ihdrCrc, 21);
  chunks.push(ihdrChunk);

  // IDAT
  const idatChunk = Buffer.alloc(12 + compressed.length);
  idatChunk.writeUInt32BE(compressed.length, 0);
  idatChunk.write('IDAT', 4);
  compressed.copy(idatChunk, 8);
  const idatCrc = crc32(idatChunk.slice(4, 8 + compressed.length));
  idatChunk.writeUInt32BE(idatCrc, 8 + compressed.length);
  chunks.push(idatChunk);

  // IEND
  const iendChunk = Buffer.alloc(12);
  iendChunk.writeUInt32BE(0, 0);
  iendChunk.write('IEND', 4);
  const iendCrc = crc32(iendChunk.slice(4, 8));
  iendChunk.writeUInt32BE(iendCrc, 8);
  chunks.push(iendChunk);

  return Buffer.concat(chunks);
}

function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
    pos += 12 + len;
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  const bpp = colorType === 6 ? 4 : (colorType === 2 ? 3 : 1);
  const stride = width * bpp;
  const rawRgba = Buffer.alloc(width * height * 4);

  let prevScanline = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * (stride + 1)];
    const currentScanline = decompressed.slice(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const unfiltered = Buffer.alloc(stride);

    for (let x = 0; x < stride; x++) {
      const byte = currentScanline[x];
      const a = x >= bpp ? unfiltered[x - bpp] : 0;
      const b = prevScanline[x];
      const c = x >= bpp ? prevScanline[x - bpp] : 0;

      let val = byte;
      if (filterType === 0) val = byte;
      else if (filterType === 1) val = (byte + a) & 0xff;
      else if (filterType === 2) val = (byte + b) & 0xff;
      else if (filterType === 3) val = (byte + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = a;
        if (pb < pa && pb < pc) pr = b;
        else if (pc < pa) pr = c;
        val = (byte + pr) & 0xff;
      }
      unfiltered[x] = val;
    }
    prevScanline = unfiltered;

    for (let col = 0; col < width; col++) {
      const idx = (y * width + col) * 4;
      if (colorType === 2) {
        rawRgba[idx] = unfiltered[col * 3];
        rawRgba[idx + 1] = unfiltered[col * 3 + 1];
        rawRgba[idx + 2] = unfiltered[col * 3 + 2];
        rawRgba[idx + 3] = 255;
      } else if (colorType === 6) {
        rawRgba[idx] = unfiltered[col * 4];
        rawRgba[idx + 1] = unfiltered[col * 4 + 1];
        rawRgba[idx + 2] = unfiltered[col * 4 + 2];
        rawRgba[idx + 3] = unfiltered[col * 4 + 3];
      }
    }
  }

  return { width, height, rawRgba };
}

// Bilinear scale down
function resizeRGBA(srcBuffer, srcW, srcH, dstW, dstH) {
  const dstBuffer = Buffer.alloc(dstW * dstH * 4);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const gx = x * xRatio;
      const gy = y * yRatio;
      const gxi = Math.floor(gx);
      const gyi = Math.floor(gy);
      const xDiff = gx - gxi;
      const yDiff = gy - gyi;

      for (let c = 0; c < 4; c++) {
        const p00 = srcBuffer[(gyi * srcW + gxi) * 4 + c];
        const p10 = srcBuffer[(gyi * srcW + Math.min(gxi + 1, srcW - 1)) * 4 + c];
        const p01 = srcBuffer[(Math.min(gyi + 1, srcH - 1) * srcW + gxi) * 4 + c];
        const p11 = srcBuffer[(Math.min(gyi + 1, srcH - 1) * srcW + Math.min(gxi + 1, srcW - 1)) * 4 + c];

        const val = p00 * (1 - xDiff) * (1 - yDiff) +
                    p10 * xDiff * (1 - yDiff) +
                    p01 * (1 - xDiff) * yDiff +
                    p11 * xDiff * yDiff;

        dstBuffer[(y * dstW + x) * 4 + c] = Math.round(val);
      }
    }
  }
  return dstBuffer;
}

const srcFile = path.join(__dirname, '../public/logo.png');
console.log('Loading logo from:', srcFile);
const { width, height, rawRgba } = decodePNG(srcFile);

// Resize to 256x256 for fast web loading and sharp crisp retina rendering
const TARGET_SIZE = 256;
const baseRgba = resizeRGBA(rawRgba, width, height, TARGET_SIZE, TARGET_SIZE);

// Create Light Mode Logo: Transparent background outer corners + clean rounded squircle mask
const lightRgba = Buffer.from(baseRgba);
const radius = TARGET_SIZE * 0.22; // smooth squircle radius

for (let y = 0; y < TARGET_SIZE; y++) {
  for (let x = 0; x < TARGET_SIZE; x++) {
    const idx = (y * TARGET_SIZE + x) * 4;
    
    // Check squircle distance
    let dx = 0;
    if (x < radius) dx = radius - x;
    else if (x > TARGET_SIZE - 1 - radius) dx = x - (TARGET_SIZE - 1 - radius);

    let dy = 0;
    if (y < radius) dy = radius - y;
    else if (y > TARGET_SIZE - 1 - radius) dy = y - (TARGET_SIZE - 1 - radius);

    if (dx > 0 && dy > 0) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) {
        lightRgba[idx + 3] = 0; // Transparent
      } else if (dist > radius - 1.5) {
        lightRgba[idx + 3] = Math.round(255 * (radius - dist) / 1.5);
      }
    }
  }
}

// Create Dark Mode Logo: Deep dark background #0d1117 with glowing vibrant elements
const darkRgba = Buffer.alloc(TARGET_SIZE * TARGET_SIZE * 4);

for (let y = 0; y < TARGET_SIZE; y++) {
  for (let x = 0; x < TARGET_SIZE; x++) {
    const idx = (y * TARGET_SIZE + x) * 4;
    const r = baseRgba[idx];
    const g = baseRgba[idx + 1];
    const b = baseRgba[idx + 2];
    const a = baseRgba[idx + 3];

    // Check squircle distance for outer transparent corners
    let dx = 0;
    if (x < radius) dx = radius - x;
    else if (x > TARGET_SIZE - 1 - radius) dx = x - (TARGET_SIZE - 1 - radius);

    let dy = 0;
    if (y < radius) dy = radius - y;
    else if (y > TARGET_SIZE - 1 - radius) dy = y - (TARGET_SIZE - 1 - radius);

    let alpha = 255;
    if (dx > 0 && dy > 0) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) {
        alpha = 0;
      } else if (dist > radius - 1.5) {
        alpha = Math.round(255 * (radius - dist) / 1.5);
      }
    }

    if (alpha === 0) {
      darkRgba[idx] = 0;
      darkRgba[idx + 1] = 0;
      darkRgba[idx + 2] = 0;
      darkRgba[idx + 3] = 0;
      continue;
    }

    // Determine if pixel is part of the white/light background or artifact lines
    const isWhiteBg = (r > 220 && g > 220 && b > 220) || (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 180);
    const isDarkNavyBoy = (r < 65 && g < 80 && b < 110) && !isWhiteBg;

    if (isWhiteBg) {
      // Deep dark sleek gradient background for dark mode #101116
      const bgGrade = Math.round(14 + (y / TARGET_SIZE) * 6);
      darkRgba[idx] = bgGrade;
      darkRgba[idx + 1] = bgGrade + 2;
      darkRgba[idx + 2] = bgGrade + 6;
      darkRgba[idx + 3] = alpha;
    } else if (isDarkNavyBoy) {
      // Invert boy silhouette to crisp glowing pearl white #e2e8f0 with subtle blue tint
      darkRgba[idx] = 232;
      darkRgba[idx + 1] = 240;
      darkRgba[idx + 2] = 250;
      darkRgba[idx + 3] = alpha;
    } else {
      // Keep colorful icons & airplane vibrant with boosted saturation/brightness for dark mode
      darkRgba[idx] = Math.min(255, Math.round(r * 1.12));
      darkRgba[idx + 1] = Math.min(255, Math.round(g * 1.12));
      darkRgba[idx + 2] = Math.min(255, Math.round(b * 1.12));
      darkRgba[idx + 3] = alpha;
    }
  }
}

// Write out both optimized light and dark logos
const outLight = path.join(__dirname, '../public/logo.png');
const outDark = path.join(__dirname, '../public/logo-dark.png');

fs.writeFileSync(outLight, encodePNG(TARGET_SIZE, TARGET_SIZE, lightRgba));
fs.writeFileSync(outDark, encodePNG(TARGET_SIZE, TARGET_SIZE, darkRgba));

console.log('✅ Generated public/logo.png (Light mode, 256x256)');
console.log('✅ Generated public/logo-dark.png (Dark mode, 256x256)');
