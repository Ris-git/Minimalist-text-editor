# Minimal Text Editor - Architecture & Design

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Editor UI  │  │ IndexedDB    │  │  OAuth Flow  │      │
│  │  Component   │  │  Storage     │  │  (Optional)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
    ┌───────▼────────┐          ┌────────▼────────┐
    │ Google Drive   │          │  Dropbox API    │
    │     API        │          │   (Optional)    │
    └────────────────┘          └─────────────────┘
```

### Component Architecture
- **Single Page Application (SPA)** - No routing needed
- **Local-first data layer** - IndexedDB for primary storage
- **Optional cloud sync** - OAuth-based integration
- **Progressive enhancement** - Works offline, enhanced with cloud

## Technology Choices

### Core Stack
1. **Vanilla JavaScript (ES6+)** - No framework bloat
   - Reasoning: Minimal overhead, fast, demonstrates core JS skills
   - Tradeoff: More manual DOM management, but acceptable for single-page app
   - Alternative considered: React/Vue - Rejected for simplicity

2. **IndexedDB API** - Local storage
   - Reasoning: Handles large text, async, works offline
   - Tradeoff: More complex than localStorage, but necessary for production
   - Wrapper: Custom lightweight wrapper (no external deps)

3. **OAuth 2.0** - Cloud integration
   - Reasoning: Industry standard, secure, no credentials stored
   - Implementation: Google Drive API, Dropbox API
   - Tradeoff: Requires backend proxy or PKCE for mobile (PKCE chosen)

4. **CSS with CSS Variables** - Styling
   - Reasoning: Modern, themeable, no build step needed
   - Dark mode: CSS variables for easy theme switching

5. **Service Worker (Optional)** - PWA capabilities
   - Reasoning: True offline-first, installable
   - Tradeoff: Added complexity, but enhances resume value

### Build Tools
- **Vite** - Fast dev server, minimal config
  - Reasoning: Modern, fast, simple
  - Alternative: Parcel - Similar, but Vite has better DX

### File Structure
```
minimal-text-editor/
├── index.html
├── src/
│   ├── main.js              # Entry point
│   ├── editor.js            # Core editor logic
│   ├── storage.js           # IndexedDB wrapper
│   ├── export.js            # Export functionality
│   ├── cloud.js             # OAuth & cloud sync
│   ├── ui.js                # UI controls (word count, theme, etc.)
│   └── styles.css           # Main stylesheet
├── sw.js                    # Service Worker (optional)
├── manifest.json            # PWA manifest
└── package.json
```

## Implementation Plan

### Phase 1: Core Foundation (MVP)
1. **HTML Structure**
   - Minimal HTML with editor container
   - Semantic HTML for accessibility

2. **Basic Editor**
   - `<textarea>` or `contenteditable` div
   - Decision: `contenteditable` for better formatting control
   - Tradeoff: More complex, but better UX (font size, line height)

3. **IndexedDB Storage**
   - Open database on load
   - Auto-save on input (debounced)
   - Load saved content on init

4. **Basic Styling**
   - Full-screen layout
   - Typography optimized for writing
   - Keyboard-focused interactions

### Phase 2: Essential Features
1. **Export Functionality**
   - Download as .txt
   - Download as .md
   - Use Blob API + URL.createObjectURL

2. **Theme System**
   - CSS variables for colors
   - Light/dark mode toggle
   - Persist preference in localStorage

3. **Writing Metrics**
   - Word count (real-time)
   - Reading time calculation (avg 200 wpm)
   - Display in non-intrusive UI

### Phase 3: Cloud Integration (Optional)
1. **OAuth Setup**
   - Google Drive OAuth flow
   - Dropbox OAuth flow
   - PKCE for security (no backend needed)

2. **Cloud Sync**
   - Manual sync button (no auto-sync to preserve bandwidth)
   - Conflict resolution: Local-first (simple merge or overwrite)

3. **UI Integration**
   - Connect/disconnect buttons
   - Sync status indicator

### Phase 4: Polish & Production
1. **Performance**
   - Debounce auto-save (500ms)
   - Virtual scrolling for large documents (if needed)

2. **Accessibility**
   - Keyboard shortcuts
   - ARIA labels
   - Focus management

3. **Error Handling**
   - Storage quota errors
   - Network errors for cloud
   - User-friendly error messages

4. **PWA Features**
   - Service Worker for offline
   - Install prompt
   - App manifest

## Security Considerations

### Data Privacy
1. **Local Storage**: All data stays in browser by default
2. **OAuth Tokens**: Stored in sessionStorage (cleared on close)
3. **No Analytics**: No tracking scripts
4. **No Backend**: No server means no data collection

### OAuth Security
1. **PKCE (Proof Key for Code Exchange)**: Required for public clients
2. **Token Storage**: SessionStorage (not localStorage) for tokens
3. **Scope Minimization**: Request only necessary permissions
4. **HTTPS Required**: OAuth requires HTTPS in production

### Input Sanitization
1. **XSS Prevention**: Sanitize contenteditable content on export
2. **No Eval**: Never use eval() or innerHTML with user input
3. **Content Security Policy**: Strict CSP headers

### Storage Security
1. **IndexedDB Encryption**: Consider encrypting sensitive content (future)
2. **Storage Quota**: Handle quota exceeded errors gracefully

## UX Design Principles

### Minimalism
1. **No Dashboard**: Single view, editor on load
2. **Hidden UI**: Controls appear on hover/focus
3. **Full Screen**: Maximize writing space
4. **No Distractions**: Remove unnecessary elements

### Keyboard-First
1. **Keyboard Shortcuts**:
   - `Cmd/Ctrl + S` - Export (menu)
   - `Cmd/Ctrl + K` - Theme toggle
   - `Cmd/Ctrl + E` - Export menu
   - `Esc` - Close modals/menus

2. **Focus Management**: Editor auto-focuses on load
3. **Tab Navigation**: Logical tab order

### Feedback
1. **Auto-save Indicator**: Subtle "Saved" indicator
2. **Sync Status**: Clear connection state
3. **Export Feedback**: Download confirmation

### Typography
1. **Readable Font**: System font stack (San Francisco, Segoe UI, etc.)
2. **Line Height**: 1.6-1.8 for readability
3. **Max Width**: ~70-80 characters for optimal reading
4. **Font Size**: 16-18px base, adjustable

### Performance
1. **Instant Load**: No splash screens
2. **Fast Typing**: No lag on input
3. **Smooth Scrolling**: Native scroll behavior

## Resume Bullet Points

1. **Built a production-ready, offline-first text editor** using vanilla JavaScript and IndexedDB, achieving sub-100ms save latency with debounced auto-save and zero dependency overhead

2. **Implemented OAuth 2.0 integration** with Google Drive and Dropbox APIs using PKCE flow, enabling optional cloud sync while maintaining strict data privacy (no backend required)

3. **Designed and implemented a progressive web application** with service worker for offline functionality, manifest for installability, and CSS variables for seamless theme switching

4. **Created a minimalist, keyboard-first UX** with real-time word count, reading time estimates, and export capabilities (TXT/MD), prioritizing writer productivity over feature bloat

5. **Architected a local-first data storage solution** using IndexedDB with automatic conflict resolution and quota management, ensuring data persistence without server dependency

## Future Improvements

### Short-term (Nice to have)
1. **Markdown Preview**: Split view with rendered markdown
2. **Multiple Documents**: Document list with IndexedDB
3. **Version History**: Track changes over time
4. **Custom Fonts**: Allow font selection
5. **Export Formats**: PDF export, HTML export

### Medium-term (Valuable additions)
1. **Collaboration**: Real-time editing (WebRTC or WebSocket)
2. **Search & Replace**: In-document search
3. **Syntax Highlighting**: For code blocks in markdown
4. **Tags/Categories**: Organize documents
5. **Full-text Search**: Search across all documents

### Long-term (Product expansion)
1. **Mobile App**: React Native or PWA enhancement
2. **Backend Sync**: Optional server for cross-device sync
3. **Plugin System**: Extensible architecture
4. **AI Features**: Grammar check, suggestions (privacy-preserving)
5. **Export Templates**: Custom export formats

## Design Decision Challenges & Improvements

### Challenge 1: Contenteditable vs Textarea
**Decision**: Use `contenteditable` div
**Pros**: Better formatting, font control, more professional
**Cons**: More complex, potential XSS, inconsistent across browsers
**Alternative Considered**: `<textarea>` - simpler but less flexible
**Recruiter Perspective**: Contenteditable shows advanced DOM knowledge
**Product Perspective**: Better UX for writers (customizable typography)
**Improvement**: Use a library like Quill.js if markdown formatting becomes complex

### Challenge 2: Framework vs Vanilla JS
**Decision**: Vanilla JavaScript
**Pros**: Zero dependencies, fast load, demonstrates core skills
**Cons**: More code, manual DOM management
**Alternative**: React/Vue/Svelte
**Recruiter Perspective**: Shows understanding of fundamentals
**Product Perspective**: Faster initial load, smaller bundle
**Improvement**: Consider migrating to Svelte if adding collaboration (small, performant)

### Challenge 3: Auto-sync vs Manual Sync
**Decision**: Manual sync for cloud
**Pros**: User control, bandwidth efficient, simpler conflict handling
**Cons**: Users might forget to sync
**Alternative**: Auto-sync on save
**Recruiter Perspective**: Shows understanding of tradeoffs
**Product Perspective**: Better for users with limited bandwidth
**Improvement**: Add auto-sync as optional preference

### Challenge 4: Single Document vs Multi-Document
**Decision**: Start with single document
**Pros**: Simpler, faster MVP, aligns with minimalism
**Cons**: Less useful for power users
**Alternative**: Document list from start
**Recruiter Perspective**: Shows product prioritization skills
**Product Perspective**: True to minimalism, can be added later
**Improvement**: Add document management in v2 (IndexedDB object store per doc)

### Challenge 5: PWA vs Web App
**Decision**: PWA (Service Worker + Manifest)
**Pros**: Installable, offline-first, modern
**Cons**: Additional complexity
**Alternative**: Plain web app
**Recruiter Perspective**: Demonstrates modern web capabilities
**Product Perspective**: Better user experience, native-like
**Improvement**: Already optimal choice

### Challenge 6: No Backend vs Backend
**Decision**: No backend (client-only)
**Pros**: No server costs, true privacy, simpler deployment
**Cons**: No cross-device sync without OAuth APIs
**Alternative**: Backend for sync
**Recruiter Perspective**: Shows full-stack awareness and constraint understanding
**Product Perspective**: Lower costs, faster development, better privacy
**Improvement**: Consider optional backend if collaboration needed (separate service)

## Technical Tradeoffs Summary

| Aspect | Choice | Tradeoff |
|--------|--------|----------|
| Framework | Vanilla JS | Simplicity vs. Developer Experience |
| Storage | IndexedDB | Complexity vs. Capacity |
| Editor | Contenteditable | Flexibility vs. Consistency |
| Cloud | Manual Sync | Control vs. Convenience |
| Architecture | Client-only | Privacy vs. Cross-device Sync |
| PWA | Yes | Features vs. Complexity |

## Success Metrics

1. **Performance**: <100ms save latency, <1s initial load
2. **Reliability**: 100% offline functionality
3. **User Experience**: Zero learning curve
4. **Privacy**: Zero data collection, local-first
5. **Code Quality**: Maintainable, well-documented, testable

