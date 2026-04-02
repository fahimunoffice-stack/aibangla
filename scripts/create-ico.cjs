const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'src-tauri', 'icons');

// Simple valid PNG (2x2 transparent)
function createPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth
  ihdrData.writeUInt8(6, 9);   // RGBA
  ihdrData.writeUInt8(0, 10);  // compression
  ihdrData.writeUInt8(0, 11);  // filter
  ihdrData.writeUInt8(0, 12);  // interlace

  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(13);
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])) >>> 0);

  // Raw pixel data (filter byte + transparent pixels)
  const rowSize = 1 + (width * 4);
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // filter byte
  }

  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);

  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(compressed.length);
  const idatType = Buffer.from('IDAT');
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, compressed])) >>> 0);

  // IEND chunk
  const iendLen = Buffer.alloc(4);
  iendLen.writeUInt32BE(0);
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType) >>> 0);

  return Buffer.concat([
    signature,
    ihdrLen, ihdrType, ihdrData, ihdrCrc,
    idatLen, idatType, compressed, idatCrc,
    iendLen, iendType, iendCrc
  ]);
}

// Simple CRC32 implementation
function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }

  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return ~crc >>> 0;
}

// Create ICO from PNGs
async function createICO() {
  try {
    const pngToIcoModule = require('png-to-ico');
    const pngToIco = pngToIcoModule.default || pngToIcoModule;

    // Create PNG files
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngPaths = [];

    for (const size of sizes) {
      const pngPath = path.join(ICONS_DIR, `temp-${size}.png`);
      const png = createPNG(size, size);
      fs.writeFileSync(pngPath, png);
      pngPaths.push(pngPath);
    }

    // Convert to ICO
    const ico = await pngToIco(pngPaths);
    fs.writeFileSync(path.join(ICONS_DIR, 'icon.ico'), ico);

    // Cleanup temp files
    pngPaths.forEach(p => fs.unlinkSync(p));

    console.log('✅ Created icon.ico');
  } catch (err) {
    console.error('❌ Failed to create ICO:', err.message);
    process.exit(1);
  }
}

createICO();
