/**
 * Main application entry point
 * Wires together all modules
 */

import Editor from './editor.js';
import ui from './ui.js';
import Export from './export.js';
import CloudSync from './cloud.js';
import storage from './storage.js';
import Settings from './settings.js';
import FormattingToolbar from './ui/formatting-toolbar.js';

// Initialize Editor
const editor = new Editor();

// Initialize Settings
const settings = new Settings();

// Initialize Cloud Sync
const cloudSync = new CloudSync();
cloudSync.init();

// Initialize Formatting Toolbar
const formattingToolbar = new FormattingToolbar();

// Setup Save button (triggers export menu)
const saveBtn = document.getElementById('save-btn');

// Setup export functionality
const exportModal = document.getElementById('export-modal');
const exportClose = document.getElementById('export-close');
const exportTxt = document.getElementById('export-txt');
const exportMd = document.getElementById('export-md');

// Save button opens export menu
saveBtn.addEventListener('click', () => {
  ui.showModal(exportModal);
});

exportClose.addEventListener('click', () => {
  ui.hideModal(exportModal);
});

// Close modal on backdrop click
exportModal.addEventListener('click', (e) => {
  if (e.target === exportModal) {
    ui.hideModal(exportModal);
  }
});

exportTxt.addEventListener('click', () => {
  const content = editor.getHTMLContent();
  const filename = Export.generateFilename('txt');
  Export.exportAsTXT(content, filename);
  
  // Update file extension indicator
  const fileExt = document.getElementById('file-extension');
  if (fileExt) fileExt.textContent = '.txt';
  
  ui.hideModal(exportModal);
  ui.updateSaveStatus('Exported as TXT', true);
});

exportMd.addEventListener('click', () => {
  const content = editor.getHTMLContent();
  const filename = Export.generateFilename('md');
  Export.exportAsMD(content, filename);
  
  // Update file extension indicator
  const fileExt = document.getElementById('file-extension');
  if (fileExt) fileExt.textContent = '.md';
  
  ui.hideModal(exportModal);
  ui.updateSaveStatus('Exported as Markdown', true);
});

// Keyboard shortcut: Cmd/Ctrl + S for save/export
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    saveBtn.click();
  }
});

// Keyboard shortcut: Cmd/Ctrl + E for export (alternative)
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
    e.preventDefault();
    saveBtn.click();
  }
});

// Setup New button
const newBtn = document.getElementById('new-btn');
newBtn.addEventListener('click', () => {
  if (confirm('Create a new document? Current content will be saved.')) {
    editor.setContent('');
    ui.updateSaveStatus('New document created', true);
  }
});

// Setup Open button (placeholder - would need file input)
const openBtn = document.getElementById('open-btn');
openBtn.addEventListener('click', () => {
  // Create hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt,.md,.text';
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.setContent(event.target.result);
        ui.updateSaveStatus('File opened', true);
      };
      reader.readAsText(file);
    }
  });
  fileInput.click();
});

// Setup menu dropdown
const menuBtn = document.getElementById('menu-btn');
const menuDropdown = document.getElementById('menu-dropdown');
const menuSaveAs = document.getElementById('menu-save-as');
const menuDelete = document.getElementById('menu-delete');
const menuDownload = document.getElementById('menu-download');
const menuClearData = document.getElementById('menu-clear-data');
const menuShortcut = document.getElementById('menu-shortcut');
const menuCloudStorage = document.getElementById('menu-cloud-storage');
const menuAbout = document.getElementById('menu-about');
const menuFullscreen = document.getElementById('menu-fullscreen');
const menuFontDropdown = document.getElementById('menu-font-dropdown');

// Toggle dropdown
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  menuDropdown.classList.toggle('visible');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
    menuDropdown.classList.remove('visible');
  }
});

// Menu item actions
menuSaveAs.addEventListener('click', () => {
  menuDropdown.classList.remove('visible');
  saveBtn.click();
});

menuDelete.addEventListener('click', () => {
  menuDropdown.classList.remove('visible');
  if (confirm('Delete current document? This cannot be undone.')) {
    editor.setContent('');
    ui.updateSaveStatus('Document deleted', true);
  }
});

menuDownload.addEventListener('click', () => {
  menuDropdown.classList.remove('visible');
  saveBtn.click();
});

menuClearData.addEventListener('click', () => {
  menuDropdown.classList.remove('visible');
  if (confirm('Clear all local data? This will delete all saved documents.')) {
    storage.clear().then(() => {
      editor.setContent('');
      ui.updateSaveStatus('All data cleared', true);
    });
  }
});

menuShortcut.addEventListener('click', () => {
  menuDropdown.classList.remove('visible');
  alert('Keyboard Shortcuts:\n\n' +
    'Cmd/Ctrl + S - Save/Export\n' +
    'Cmd/Ctrl + E - Export\n' +
    'Cmd/Ctrl + K - Toggle Theme\n' +
    'Esc - Close Modals'
  );
});

menuCloudStorage.addEventListener('click', () => {
  menuDropdown.classList.remove('visible');
  ui.showModal(cloudModal);
});

menuAbout.addEventListener('click', () => {
  menuDropdown.classList.remove('visible');
  alert('Minimal Text Editor\n\n' +
    'A distraction-free text editor for writers and students.\n' +
    'Version 1.0.0\n\n' +
    'Built with vanilla JavaScript, IndexedDB, and modern web APIs.'
  );
});

// Font selection functionality
const settingsFontFamilyInput = document.getElementById('setting-font-family');
const editorDomEl = document.getElementById('editor');

function getSavedFontFamily() {
  if (settingsFontFamilyInput && settingsFontFamilyInput.value) return settingsFontFamilyInput.value;
  try {
    const s = JSON.parse(localStorage.getItem('editorSettings') || '{}');
    if (s.fontFamily) return s.fontFamily;
  } catch {}
  return 'Verdana';
}

function applyFontFamily(font) {
  if (!font) return;

  if (editorDomEl) editorDomEl.style.fontFamily = font;

  if (settingsFontFamilyInput) {
    settingsFontFamilyInput.value = font;
    settingsFontFamilyInput.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    try {
      const s = JSON.parse(localStorage.getItem('editorSettings') || '{}');
      s.fontFamily = font;
      localStorage.setItem('editorSettings', JSON.stringify(s));
    } catch {}
  }
}

if (menuFontDropdown) {
  const initialFont = getSavedFontFamily();
  if ([...menuFontDropdown.options].some((o) => o.value === initialFont)) {
    menuFontDropdown.value = initialFont;
  }
  applyFontFamily(menuFontDropdown.value);

  menuFontDropdown.addEventListener('change', (e) => {
    applyFontFamily(e.target.value);
  });
}

// Fullscreen toggle from menu
if (menuFullscreen) {
  menuFullscreen.addEventListener('click', () => {
    menuDropdown.classList.remove('visible');
    toggleFullscreen();
  });
}

// Setup cloud sync modal (accessed via settings or menu in future)
const cloudModal = document.getElementById('cloud-modal');
const cloudClose = document.getElementById('cloud-close');

cloudClose.addEventListener('click', () => {
  ui.hideModal(cloudModal);
});

cloudModal.addEventListener('click', (e) => {
  if (e.target === cloudModal) {
    ui.hideModal(cloudModal);
  }
});

// Command palette modal
const commandModal = document.getElementById('command-modal');
const commandInput = document.getElementById('command-input');
const commandList = document.getElementById('command-list');
const commandEmpty = document.getElementById('command-empty');

function filterCommandItems(query) {
  if (!commandList) return;
  const items = commandList.querySelectorAll('.command-item');
  let any = false;
  const q = (query || '').toLowerCase();
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    const match = text.includes(q);
    item.style.display = match ? 'flex' : 'none';
    if (match && !item.disabled) any = true;
  });
  if (commandEmpty) commandEmpty.style.display = any ? 'none' : 'block';
}

if (commandModal) {
  // Toggle Command with Cmd/Ctrl + J
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'j' || e.key === 'J')) {
      e.preventDefault();
      const isVisible = commandModal.classList.contains('visible');
      if (isVisible) {
        ui.hideModal(commandModal);
      } else {
        ui.showModal(commandModal);
        if (commandInput) {
          commandInput.value = '';
        }
        filterCommandItems('');
      }
    }
  });

  // Backdrop click closes
  commandModal.addEventListener('click', (e) => {
    if (e.target === commandModal) {
      ui.hideModal(commandModal);
    }
  });

  // Input filtering
  if (commandInput) {
    commandInput.addEventListener('input', (e) => {
      filterCommandItems(e.target.value);
    });
  }

  // Item click handler
  if (commandList) {
    commandList.addEventListener('click', (e) => {
      const item = e.target.closest('.command-item');
      if (!item || item.disabled) return;
      const action = item.getAttribute('data-action');
      if (action === 'settings') {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) settingsBtn.click();
      }
      ui.hideModal(commandModal);
    });
  }
}

// Service Worker registration (for PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
      // Service worker is optional, so we continue without it
    }
  });
}

// Handle online/offline status
window.addEventListener('online', () => {
  ui.updateSaveStatus('Online', true);
});

window.addEventListener('offline', () => {
  ui.updateSaveStatus('Offline', false);
});

const appContainer = document.querySelector('.app-container');
const editorEl = document.getElementById('editor');

function enterFocusMode() {
  if (appContainer && !appContainer.classList.contains('focus-mode')) {
    appContainer.classList.add('focus-mode');
  }
}

function exitFocusMode() {
  if (appContainer && appContainer.classList.contains('focus-mode')) {
    appContainer.classList.remove('focus-mode');
  }
}

if (editorEl) {
  editorEl.addEventListener('input', enterFocusMode);
  editorEl.addEventListener('focus', enterFocusMode);
  editorEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      exitFocusMode();
    } else {
      enterFocusMode();
    }
  });
}

let lastMouseY = 0;
document.addEventListener('mousemove', (e) => {
  lastMouseY = e.clientY || 0;
  if (lastMouseY <= 10) {
    exitFocusMode();
  }
});

if (menuBtn) {
  menuBtn.addEventListener('click', exitFocusMode);
}
const settingsBtnEl = document.getElementById('settings-btn');
if (settingsBtnEl) {
  settingsBtnEl.addEventListener('click', exitFocusMode);
}

const fullscreenBtn = document.getElementById('fullscreen-btn');
function isFullscreen() {
  return document.fullscreenElement || document.webkitFullscreenElement;
}

function updateFullscreenUI() {
  const inFs = !!isFullscreen();
  
  // Update existing fullscreen button if it exists
  if (fullscreenBtn) {
    fullscreenBtn.title = inFs ? 'Exit Fullscreen (F11 or Cmd/Ctrl+Shift+F)' : 'Fullscreen (F11 or Cmd/Ctrl+Shift+F)';
    fullscreenBtn.setAttribute('aria-pressed', inFs ? 'true' : 'false');
  }
  
  // Update menu fullscreen button
  if (menuFullscreen) {
    menuFullscreen.setAttribute('aria-pressed', inFs ? 'true' : 'false');
  }
}

async function toggleFullscreen() {
  const elem = document.documentElement;
  try {
    if (!isFullscreen()) {
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  } catch (err) {
    console.warn('Fullscreen error:', err);
  } finally {
    updateFullscreenUI();
  }
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isFullscreen()) {
    toggleFullscreen();
  }
  if (e.key === 'F11') {
    e.preventDefault();
    toggleFullscreen();
  }
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
    e.preventDefault();
    toggleFullscreen();
  }
});

document.addEventListener('fullscreenchange', updateFullscreenUI);
document.addEventListener('webkitfullscreenchange', updateFullscreenUI);

// Mobile touch functionality
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  const appContainer = document.querySelector('.app-container');
  const header = document.querySelector('.header');
  let lastTap = 0;

  // Tap to show/hide header on mobile
  document.addEventListener('touchstart', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 500 && tapLength > 0) {
      // Double tap - toggle header
      e.preventDefault();
      appContainer.classList.toggle('focus-mode');
    }
    
    lastTap = currentTime;
  });

  // Single tap on editor area to show header
  const editor = document.getElementById('editor');
  editor.addEventListener('touchend', (e) => {
    // Only show header if in focus mode and not selecting text
    if (appContainer.classList.contains('focus-mode') && !window.getSelection().toString()) {
      setTimeout(() => {
        appContainer.classList.remove('focus-mode');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          if (!appContainer.classList.contains('focus-mode')) {
            appContainer.classList.add('focus-mode');
          }
        }, 3000);
      }, 100);
    }
  });

  // Prevent focus mode on menu interactions
  const menuBtn = document.getElementById('menu-btn');
  const settingsBtn = document.getElementById('settings-btn');
  
  [menuBtn, settingsBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        appContainer.classList.remove('focus-mode');
      });
    }
  });

  // Handle keyboard show/hide on mobile
  window.addEventListener('resize', () => {
    const isKeyboardVisible = window.innerHeight < window.screen.height * 0.75;
    
    if (isKeyboardVisible) {
      // Keyboard is visible - hide header
      appContainer.classList.add('focus-mode');
    } else {
      // Keyboard is hidden - show header briefly
      appContainer.classList.remove('focus-mode');
      setTimeout(() => {
        appContainer.classList.add('focus-mode');
      }, 2000);
    }
  });

  // Initialize in focus mode for mobile
  appContainer.classList.add('focus-mode');
}

console.log('Minimal Text Editor initialized');

