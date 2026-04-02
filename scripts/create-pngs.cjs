const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICONS_DIR = path.join(__dirname, '..', 'src-tauri', 'icons');

// CRC32 table
const crcTable = [];
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return ~crc >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth
  ihdrData.writeUInt8(6, 9);   // RGBA
  ihdrData.writeUInt8(0, 10);  // compression
  ihdrData.writeUInt8(0, 11);  // filter
  ihdrData.writeUInt8(0, 12);  // interlace

  // Raw image data
  const rowSize = 1 + (width * 4);
  const rawData = Buffer.alloc(rowSize * height);
  // Fill with transparent pixels
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // filter byte
  }

  // Compress
  const compressed = zlib.deflateSync(rawData);

  // Build PNG
  const chunks = [
    signature,
    writeChunk('IHDR', ihdrData),
    writeChunk('IDAT', compressed),
    writeChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

// Create all required icons
const files = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 512 },
];

console.log('🎨 Creating PNG icons...\n');

files.forEach(({ name, size }) => {
  const png = createPNG(size, size);
  fs.writeFileSync(path.join(ICONS_DIR, name), png);
  console.log(`✅ Created ${name} (${size}x${size})`);
});

// Create empty ICNS for macOS
fs.writeFileSync(path.join(ICONS_DIR, 'icon.icns'), Buffer.alloc(0));
console.log('✅ Created icon.icns (placeholder)');

console.log('\n✨ All placeholder icons ready!');
