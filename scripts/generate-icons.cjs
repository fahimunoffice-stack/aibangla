#!/usr/bin/env node

/**
 * Icon generation script for AiBangla
 * Generates all required icon formats from the source SVG
 *
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ICONS_DIR = path.join(__dirname, '..', 'src-tauri', 'icons');
const SOURCE_SVG = path.join(ICONS_DIR, 'icon.svg');

// Required icon files for Tauri
const ICONS = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 512 },
];

function checkImagemagick() {
  try {
    execSync('magick -version', { stdio: 'ignore' });
    return 'magick';
  } catch {
    try {
      execSync('convert -version', { stdio: 'ignore' });
      return 'convert';
    } catch {
      return null;
    }
  }
}

function generateIcons() {
  console.log('🎨 Generating AiBangla icons...\n');

  if (!fs.existsSync(SOURCE_SVG)) {
    console.error('❌ Source icon.svg not found!');
    process.exit(1);
  }

  const convertCmd = checkImagemagick();
  if (!convertCmd) {
    console.error('❌ ImageMagick not found! Please install it:');
    console.error('   Windows: choco install imagemagick');
    console.error('   macOS: brew install imagemagick');
    console.error('   Linux: sudo apt install imagemagick');
    process.exit(1);
  }

  // Generate PNG icons
  ICONS.forEach(({ name, size }) => {
    const outputPath = path.join(ICONS_DIR, name);
    try {
      execSync(`${convertCmd} "${SOURCE_SVG}" -resize ${size}x${size} "${outputPath}"`, {
        stdio: 'inherit'
      });
      console.log(`✅ Generated ${name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  });

  // Generate Windows ICO
  try {
    const icoPath = path.join(ICONS_DIR, 'icon.ico');
    execSync(`${convertCmd} "${SOURCE_SVG}" -define icon:auto-resize=256,128,64,48,32,16 "${icoPath}"`, {
      stdio: 'inherit'
    });
    console.log('✅ Generated icon.ico');
  } catch (error) {
    console.error('❌ Failed to generate icon.ico:', error.message);
  }

  // Generate macOS ICNS
  if (process.platform === 'darwin') {
    try {
      const icnsPath = path.join(ICONS_DIR, 'icon.icns');
      execSync(`iconutil -c icns "${ICONS_DIR}" -o "${icnsPath}"`, { stdio: 'inherit' });
      console.log('✅ Generated icon.icns');
    } catch (error) {
      console.error('❌ Failed to generate icon.icns:', error.message);
      console.log('   (macOS only - can be generated on macOS)');
    }
  } else {
    console.log('ℹ️  Skipping icon.icns (macOS only)');
  }

  console.log('\n✨ Icon generation complete!');
  console.log(`📁 Icons saved to: ${ICONS_DIR}`);
}

// Alternative: Use Tauri's icon generator if available
function useTauriIcon() {
  try {
    console.log('🚀 Using Tauri icon generator...\n');
    execSync('npx tauri icon src-tauri/icons/icon.svg', { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

// Main
if (require.main === module) {
  // Try Tauri icon first, fallback to ImageMagick
  if (!useTauriIcon()) {
    generateIcons();
  }
}

module.exports = { generateIcons, ICONS };
