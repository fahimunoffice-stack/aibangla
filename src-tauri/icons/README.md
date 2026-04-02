# AiBangla Icons

This directory contains the application icons in various formats.

## Source Icon

- **icon.svg** - Source SVG file with the AiBangla logo

## Generated Icons

The following icons are generated from the source SVG:

- **32x32.png** - Small icon for taskbar/system tray
- **128x128.png** - Standard icon for Linux
- **128x128@2x.png** - Retina display icon (256x256)
- **icon.png** - High-resolution icon (512x512)
- **icon.ico** - Windows icon with multiple sizes
- **icon.icns** - macOS icon file

## Generating Icons

### Option 1: Using Tauri CLI (Recommended)

```bash
npm run icons:tauri
# or
npx tauri icon src-tauri/icons/icon.svg
```

### Option 2: Using the Node.js Script

Requires [ImageMagick](https://imagemagick.org/):

```bash
# Windows
choco install imagemagick

# macOS
brew install imagemagick

# Linux
sudo apt install imagemagick

# Generate icons
npm run icons
```

### Option 3: Using resvg (Rust-based)

```bash
cargo install resvg
cargo run --example icon-gen
```

## Icon Design

The AiBangla icon features:
- **Bengali letter "অ"** (the first letter of the Bengali alphabet)
- **Circuit/AI pattern** representing the AI-powered nature
- **Green gradient** (#4caf50 to #81c784) for a fresh, modern look
- **Dark background** (#1a1a2e to #16213e) matching the app theme

## Icon Specifications

| Platform | Format | Sizes |
|----------|--------|-------|
| Windows | ICO | 16, 32, 48, 64, 128, 256 |
| macOS | ICNS | 16, 32, 64, 128, 256, 512, 1024 |
| Linux | PNG | 32, 128, 256, 512 |
