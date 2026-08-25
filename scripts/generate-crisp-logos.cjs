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

// Crop and scale tightly
function cropAndResizeRGBA(srcBuffer, srcW, srcH, cropX, cropY, cropW, cropH, dstW, dstH) {
  const dstBuffer = Buffer.alloc(dstW * dstH * 4);
  const xRatio = cropW / dstW;
  const yRatio = cropH / dstH;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const gx = cropX + x * xRatio;
      const gy = cropY + y * yRatio;
      const gxi = Math.min(srcW - 2, Math.max(0, Math.floor(gx)));
      const gyi = Math.min(srcH - 2, Math.max(0, Math.floor(gy)));
      const xDiff = gx - gxi;
      const yDiff = gy - gyi;

      for (let c = 0; c < 4; c++) {
        const p00 = srcBuffer[(gyi * srcW + gxi) * 4 + c];
        const p10 = srcBuffer[(gyi * srcW + gxi + 1) * 4 + c];
        const p01 = srcBuffer[((gyi + 1) * srcW + gxi) * 4 + c];
        const p11 = srcBuffer[((gyi + 1) * srcW + gxi + 1) * 4 + c];

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
const { width, height, rawRgba } = decodePNG(srcFile);

// Find graphic content bounding box
let minX = width, maxX = 0, minY = height, maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = rawRgba[idx];
    const g = rawRgba[idx + 1];
    const b = rawRgba[idx + 2];
    const isBg = (r > 230 && g > 230 && b > 230);
    if (!isBg) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log('Detected Bounding Box:', { minX, maxX, minY, maxY });

// Add 5% padding around content
const contentW = maxX - minX;
const contentH = maxY - minY;
const maxDim = Math.max(contentW, contentH);
const pad = Math.round(maxDim * 0.05);

const centerX = Math.round((minX + maxX) / 2);
const centerY = Math.round((minY + maxY) / 2);
const cropSize = maxDim + pad * 2;

const cropX = Math.max(0, Math.round(centerX - cropSize / 2));
const cropY = Math.max(0, Math.round(centerY - cropSize / 2));
const cropW = Math.min(width - cropX, cropSize);
const cropH = Math.min(height - cropY, cropSize);

console.log('Cropping at:', { cropX, cropY, cropW, cropH });

const TARGET_SIZE = 512;
const croppedRgba = cropAndResizeRGBA(rawRgba, width, height, cropX, cropY, cropW, cropH, TARGET_SIZE, TARGET_SIZE);

// 1. Generate Crisp Light Mode Logo (Transparent background, bold crisp foreground)
const lightRgba = Buffer.alloc(TARGET_SIZE * TARGET_SIZE * 4);
for (let i = 0; i < TARGET_SIZE * TARGET_SIZE; i++) {
  const idx = i * 4;
  const r = croppedRgba[idx];
  const g = croppedRgba[idx + 1];
  const b = croppedRgba[idx + 2];

  const isWhiteBg = (r > 225 && g > 225 && b > 225) || (Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 200);

  if (isWhiteBg) {
    lightRgba[idx] = 0;
    lightRgba[idx + 1] = 0;
    lightRgba[idx + 2] = 0;
    lightRgba[idx + 3] = 0; // Completely transparent background!
  } else {
    // Enhance contrast for light mode
    lightRgba[idx] = r;
    lightRgba[idx + 1] = g;
    lightRgba[idx + 2] = b;
    lightRgba[idx + 3] = 255;
  }
}

// 2. Generate Crisp Dark Mode Logo (Transparent background, solid pearl boy & vivid neon elements)
const darkRgba = Buffer.alloc(TARGET_SIZE * TARGET_SIZE * 4);
for (let i = 0; i < TARGET_SIZE * TARGET_SIZE; i++) {
  const idx = i * 4;
  const r = croppedRgba[idx];
  const g = croppedRgba[idx + 1];
  const b = croppedRgba[idx + 2];

  const isWhiteBg = (r > 215 && g > 215 && b > 215) || (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 175);
  const isDarkNavyBoy = (r < 70 && g < 85 && b < 120) && !isWhiteBg;

  if (isWhiteBg) {
    darkRgba[idx] = 0;
    darkRgba[idx + 1] = 0;
    darkRgba[idx + 2] = 0;
    darkRgba[idx + 3] = 0; // Transparent background in dark mode!
  } else if (isDarkNavyBoy) {
    // Solid crisp pearl white avatar for dark mode
    darkRgba[idx] = 255;
    darkRgba[idx + 1] = 255;
    darkRgba[idx + 2] = 255;
    darkRgba[idx + 3] = 255;
  } else {
    // Vivid neon colors
    darkRgba[idx] = Math.min(255, Math.round(r * 1.25));
    darkRgba[idx + 1] = Math.min(255, Math.round(g * 1.25));
    darkRgba[idx + 2] = Math.min(255, Math.round(b * 1.25));
    darkRgba[idx + 3] = 255;
  }
}

const outLight = path.join(__dirname, '../public/logo.png');
const outDark = path.join(__dirname, '../public/logo-dark.png');

fs.writeFileSync(outLight, encodePNG(TARGET_SIZE, TARGET_SIZE, lightRgba));
fs.writeFileSync(outDark, encodePNG(TARGET_SIZE, TARGET_SIZE, darkRgba));

console.log('✅ Generated ultra-crisp transparent 512x512 public/logo.png');
console.log('✅ Generated ultra-crisp transparent 512x512 public/logo-dark.png');
