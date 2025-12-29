# Implementation Notes & Setup Guide

## Quick Start

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Open browser to `http://localhost:3000`

## PWA Icons

The manifest.json references icon files that need to be created:

- `/icon-192.png` - 192x192px icon
- `/icon-512.png` - 512x512px icon

You can:
1. Create simple icons using any image editor
2. Use online icon generators
3. Use placeholder icons for development

To generate icons, you can use tools like:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Or create simple SVG icons and convert to PNG

## Cloud Sync Implementation

The cloud sync functionality (`src/cloud.js`) currently has placeholder implementations. To make it production-ready:

### Google Drive Setup

1. **Create OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Drive API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs (e.g., `https://yourdomain.com`)

2. **Implement PKCE Flow**:
   ```javascript
   // Generate code verifier and challenge
   async function generatePKCE() {
     const codeVerifier = generateRandomString(128);
     const codeChallenge = await sha256(codeVerifier);
     // Store codeVerifier temporarily
     return { codeVerifier, codeChallenge };
   }
   ```

3. **OAuth Flow**:
   ```javascript
   async connectGoogle() {
     const { codeVerifier, codeChallenge } = await generatePKCE();
     const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
       client_id=${CLIENT_ID}&
       redirect_uri=${REDIRECT_URI}&
       response_type=code&
       scope=https://www.googleapis.com/auth/drive.file&
       code_challenge=${codeChallenge}&
       code_challenge_method=S256`;
     
     window.location.href = authUrl;
   }
   ```

4. **Token Exchange** (requires backend proxy or use Google's JS client library):
   - Exchange authorization code for access token
   - Store token securely (consider using Google's JS client library)

### Dropbox Setup

1. **Create App**:
   - Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
   - Create new app (Scoped access, Full Dropbox)
   - Note App Key

2. **Implement PKCE Flow**:
   Similar to Google, but using Dropbox's OAuth endpoints

3. **OAuth Flow**:
   ```javascript
   async connectDropbox() {
     const { codeVerifier, codeChallenge } = await generatePKCE();
     const authUrl = `https://www.dropbox.com/oauth2/authorize?
       client_id=${APP_KEY}&
       redirect_uri=${REDIRECT_URI}&
       response_type=code&
       code_challenge=${codeChallenge}&
       code_challenge_method=S256`;
     
     window.location.href = authUrl;
   }
   ```

### Recommended Approach

For a production app, consider using:
- **Google**: [Google API Client Library for JavaScript](https://github.com/google/google-api-javascript-client)
- **Dropbox**: [Dropbox SDK for JavaScript](https://github.com/dropbox/dropbox-sdk-js)

These libraries handle PKCE, token refresh, and API calls more securely.

## Build & Deploy

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment Options

1. **Static Hosting**:
   - Netlify, Vercel, GitHub Pages
   - Just deploy the `dist/` folder

2. **HTTPS Requirement**:
   - OAuth requires HTTPS in production
   - Most hosting platforms provide HTTPS by default

3. **Service Worker**:
   - Ensure service worker is served with correct MIME type
   - Most static hosts handle this automatically

## Testing Checklist

- [ ] Editor loads and saves content
- [ ] Auto-save works (check after 500ms delay)
- [ ] Export to TXT works
- [ ] Export to Markdown works
- [ ] Theme toggle works (light/dark)
- [ ] Theme preference persists
- [ ] Word count updates correctly
- [ ] Reading time calculates correctly
- [ ] Keyboard shortcuts work
- [ ] Offline mode works (disable network, test)
- [ ] Service Worker caches assets
- [ ] PWA installable (if icons added)

## Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- IndexedDB operations are async and may take time with large documents
- Debounce auto-save to avoid excessive writes
- Consider virtual scrolling for very large documents (100k+ words)

## Security Checklist

- [ ] Content sanitized on export (prevents XSS)
- [ ] OAuth tokens stored securely (sessionStorage, not localStorage)
- [ ] HTTPS in production
- [ ] CSP headers configured (if using)
- [ ] No eval() or innerHTML with untrusted content

## Future Enhancements

See ARCHITECTURE.md for detailed future improvements. Quick wins:
- Multiple documents support
- Markdown preview
- Version history
- Search & replace
- Custom fonts

