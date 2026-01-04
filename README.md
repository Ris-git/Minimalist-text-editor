# Minimal Text Editor

A minimalist, distraction-free online text editor designed for content writers and students. Built with vanilla JavaScript, IndexedDB, and modern web APIs.

## 🚀 Live Demo

**Try it now:** [https://minimalist-text-editor.vercel.app/](https://minimalist-text-editor.vercel.app/)

## Features

- ✨ **Local-first** - Works completely offline, no server required
- 🎨 **Minimal UI** - Clean, distraction-free interface
- 🔒 **Privacy-respecting** - No forced login, no tracking
- ⌨️ **Keyboard-first** - Optimized for efficient writing
- 💾 **Auto-save** - Automatic saving to IndexedDB
- 📤 **Export** - Download as TXT or Markdown
- ☁️ **Optional Cloud Sync** - Google Drive and Dropbox integration (OAuth)
- 🌓 **Light/Dark Mode** - Theme switching with persistence
- 📊 **Writing Metrics** - Real-time word count and reading time
- 📱 **PWA** - Installable, works offline

## Tech Stack

- **Vanilla JavaScript (ES6+)** - No framework overhead
- **IndexedDB** - Local storage for large documents
- **Vite** - Fast development and build tool
- **Service Worker** - Offline-first PWA capabilities
- **OAuth 2.0** - Secure cloud integration

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd minimal-text-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture, design decisions, and implementation notes.

## Project Structure

```
minimal-text-editor/
├── index.html          # Main HTML file
├── src/
│   ├── main.js        # Application entry point
│   ├── editor.js      # Core editor functionality
│   ├── storage.js     # IndexedDB wrapper
│   ├── ui.js          # UI utilities (theme, stats)
│   ├── export.js      # Export functionality
│   ├── cloud.js       # OAuth cloud sync
│   └── styles.css     # Main stylesheet
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
└── package.json       # Dependencies
```

## Usage

### Keyboard Shortcuts

- `Cmd/Ctrl + K` - Toggle theme
- `Cmd/Ctrl + E` - Open export menu
- `Cmd/Ctrl + S` - Export (shows menu)
- `Esc` - Close modals

### Features

1. **Writing**: Just start typing! Content auto-saves every 500ms
2. **Export**: Click the save icon (💾) or press `Cmd/Ctrl + E` to export
3. **Theme**: Click the theme icon (🌓) or press `Cmd/Ctrl + K` to switch themes
4. **Cloud Sync**: Click the cloud icon (☁️) to connect Google Drive or Dropbox

## Cloud Sync Setup

To enable cloud sync, you'll need to:

1. **Google Drive**:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
   - Add your domain to authorized redirect URIs
   - Implement PKCE flow in `src/cloud.js`

2. **Dropbox**:
   - Create an app in [Dropbox Developer Console](https://www.dropbox.com/developers/apps)
   - Configure OAuth redirect URIs
   - Implement PKCE flow in `src/cloud.js`

See `src/cloud.js` for implementation details and placeholder code.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires modern browser with IndexedDB and ES6+ support.

## Security Considerations

- All data stored locally by default (IndexedDB)
- OAuth tokens stored in sessionStorage (cleared on close)
- No backend server = no data collection
- Content sanitized on export to prevent XSS
- HTTPS required for OAuth in production

## License

MIT

## Contributing

This is a resume project, but contributions and feedback are welcome!

---

Built with ❤️ for writers and students who value simplicity and privacy.

