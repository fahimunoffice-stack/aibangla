#!/usr/bin/env node

/**
 * AiBangla Project Initialization Script
 * Generates placeholder icons and verifies project setup
 */

const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'src-tauri', 'icons');

// Minimal 1x1 transparent PNG (base64 encoded)
const MINI_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Minimal 1x1 transparent PNG for 128x128 (just a bigger placeholder)
const MINI_PNG_128 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const REQUIRED_FILES = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.png',
  'icon.ico',
  'icon.icns'
];

function createPlaceholderIcons() {
  console.log('🎨 Creating placeholder icons...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Check if icon.svg exists
  const svgPath = path.join(ICONS_DIR, 'icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.log('⚠️  icon.svg not found! Please create an SVG icon first.');
    return false;
  }

  console.log('✅ icon.svg found');

  // Create placeholder PNG files
  REQUIRED_FILES.forEach(filename => {
    const filePath = path.join(ICONS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      // Write minimal PNG placeholder
      fs.writeFileSync(filePath, MINI_PNG);
      console.log(`⚠️  Created placeholder: ${filename}`);
    } else {
      console.log(`✅ Found: ${filename}`);
    }
  });

  console.log('\n✨ Placeholder icons created!');
  console.log('\n📋 Next steps:');
  console.log('   1. Generate proper icons: npm run icons');
  console.log('   2. Or use Tauri: npm run icons:tauri');
  console.log('\n⚠️  Note: Placeholder icons are 1x1 transparent images.');
  console.log('   Replace them with proper icons before distribution.\n');

  return true;
}

function checkDependencies() {
  console.log('🔍 Checking dependencies...\n');

  const checks = [
    { name: 'Node.js', cmd: 'node --version' },
    { name: 'npm', cmd: 'npm --version' },
  ];

  let allPassed = true;

  checks.forEach(({ name, cmd }) => {
    try {
      require('child_process').execSync(cmd, { stdio: 'ignore' });
      console.log(`✅ ${name} installed`);
    } catch {
      console.log(`❌ ${name} not found`);
      allPassed = false;
    }
  });

  console.log('');
  return allPassed;
}

function printWelcome() {
  console.log(`
╔════════════════════════════════════════╗
║           🚀 AiBangla Setup            ║
║     AI-Powered Bengali Input Method    ║
╚════════════════════════════════════════╝
`);
}

// Main
if (require.main === module) {
  printWelcome();

  checkDependencies();
  createPlaceholderIcons();

  console.log('📚 Quick start:');
  console.log('   npm install      - Install dependencies');
  console.log('   npm run icons    - Generate proper icons');
  console.log('   npm run tauri:dev - Start development\n');
}

module.exports = { createPlaceholderIcons, checkDependencies };
