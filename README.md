# AiBangla

[![Build & Test](https://github.com/yourusername/aibangla/actions/workflows/build.yml/badge.svg)](https://github.com/yourusername/aibangla/actions/workflows/build.yml)
[![Release](https://github.com/yourusername/aibangla/actions/workflows/release.yml/badge.svg)](https://github.com/yourusername/aibangla/actions/workflows/release.yml)

AI-powered Bengali input method desktop application with real-time phonetic correction and translation.

![AiBangla Screenshot](screenshot.png)

## Features

- **AI-Powered Phonetic Correction** - Converts romanized Bengali input to proper Unicode script using Groq's LLM API
- **Real-time Translation** - Translate text to any language on-the-fly
- **Multiple Modes** - Choose between Bengali correction, translation, both, or disable
- **System Tray Integration** - Runs in background with easy toggle access
- **Cross-Platform** - Works on Windows, Linux, and macOS
- **Fast & Lightweight** - Built with Rust and Tauri for optimal performance
- **Local Caching** - Avoids duplicate API calls for faster response
- **Configurable Hotkey** - Toggle the app on/off with Ctrl+Shift+B (customizable)

## Installation

### Download Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/yourusername/aibangla/releases) page.

**Windows:**
- Download `.msi` installer for system-wide installation
- Or download `.exe` for portable use

**Linux:**
- Download `.deb` for Debian/Ubuntu
- Or download `.AppImage` for any distribution

**macOS:**
- Download `.dmg` and drag AiBangla to Applications

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [ImageMagick](https://imagemagick.org/) (optional, for icon generation)
  - Windows: `choco install imagemagick`
  - macOS: `brew install imagemagick`
  - Linux: `sudo apt install imagemagick`
- Platform-specific dependencies:
  - **Linux:** `sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf`
  - **Windows:** Visual Studio Build Tools or MSVC
  - **macOS:** Xcode Command Line Tools

#### Quick Start (Minimal)

```bash
# Clone and enter directory
git clone https://github.com/yourusername/aibangla.git
cd aibangla

# Install dependencies (automatically creates placeholder icons)
npm install

# Generate proper icons (optional for dev, required for release)
npm run icons

# Start development server
npm run tauri:dev
```

#### Detailed Build Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/aibangla.git
cd aibangla

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## Getting Started

### 1. Get a Groq API Key

AiBangla uses the Groq API for AI inference. Get your free API key:

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key

### 2. Configure AiBangla

1. Launch AiBangla (it will start in system tray)
2. Right-click the system tray icon and select "Settings"
3. Enter your Groq API key
4. Select your preferred mode and model
5. Click "Activate" to enable the input hook

### 3. Start Typing

1. Type any word in phonetic English (e.g., "ami", "bhalobasa", "bangladesh")
2. Press **Space** to trigger correction
3. The word is automatically replaced with Bengali text

## Configuration

AiBangla stores configuration in your system's app data directory:

- **Windows:** `%APPDATA%\aibangla\config.json`
- **Linux:** `~/.config/aibangla/config.json`
- **macOS:** `~/Library/Application Support/aibangla/config.json`

### Available Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `groq_api_key` | Your Groq API key | (empty) |
| `model` | AI model to use | `gpt-oss-120b` |
| `mode` | Operating mode | `bengali_correction` |
| `target_language` | Translation target | `Bengali` |
| `trigger_on_space` | Trigger on space key | `true` |
| `show_preview` | Show live preview | `true` |
| `hotkey_toggle` | Toggle hotkey | `Ctrl+Shift+B` |

### Modes

- **Bengali Correction Only** - Converts phonetic input to Bengali script
- **Translation Only** - Translates text to target language
- **Bengali + Translation** - Applies both corrections
- **Disabled** - Input hook disabled

### Available Models

- `gpt-oss-120b` (default) - Open-source 120B parameter model
- `llama-3.1-8b-instant` - Fast, free tier available
- `mixtral-8x7b-32768` - 32K context window
- `gemma2-9b-it` - Google's Gemma 2 model

## Usage Tips

- **Backspace** - Correct typos before triggering correction
- **Escape** - Clear the current word buffer
- **Punctuation** - Clears the buffer and starts a new word
- **System Tray** - Right-click for quick toggle or quit
- **Settings Window** - Accessible from system tray or when first launched

## Development

### Project Structure

```
aibangla/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── main.rs          # Entry point
│   │   ├── input_hook.rs    # Keyboard listener
│   │   ├── text_injector.rs # Text injection
│   │   ├── ai_engine.rs     # Groq API integration
│   │   ├── buffer.rs        # Text buffer logic
│   │   ├── config.rs        # Settings management
│   │   └── commands.rs      # Tauri IPC commands
│   └── Cargo.toml
├── src/                # React frontend
│   ├── App.tsx
│   └── components/
└── package.json
```

### Key Dependencies

- **Backend:** Tauri v2, rdev, enigo, tokio, reqwest
- **Frontend:** React, TypeScript, Vite

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Running Tests

```bash
cd src-tauri
cargo test
```

## Troubleshooting

### App doesn't start
- Check if the API key is configured
- Ensure no other app is using global keyboard hooks

### Corrections not working
- Verify the app is in "Active" state (green indicator)
- Check API key validity in Settings
- Ensure you have internet connectivity

### Build errors on Linux
Make sure all dependencies are installed:
```bash
sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

## Privacy & Security

- Your Groq API key is stored locally in your system's config directory
- API keys are never logged or transmitted except to Groq's API
- No typing data is collected or stored
- All processing happens via Groq's API (see their privacy policy)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Avro Keyboard](https://www.omicronlab.com/avro-keyboard.html) - Inspiration for phonetic input
- [Groq](https://groq.com/) - Fast AI inference API
- [Tauri](https://tauri.app/) - Cross-platform desktop framework
- [rdev](https://github.com/Narsil/rdev) - Rust input device library
- [enigo](https://github.com/enigo-rs/enigo) - Cross-platform input simulation

## Support

- [GitHub Issues](https://github.com/yourusername/aibangla/issues) - Bug reports and feature requests
- [Discussions](https://github.com/yourusername/aibangla/discussions) - Questions and community

---

Made with ❤️ for the Bengali-speaking community
