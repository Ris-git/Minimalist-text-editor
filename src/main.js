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

// Initialize Editor
const editor = new Editor();

// Initialize Settings
const settings = new Settings();

// Initialize Cloud Sync
const cloudSync = new CloudSync();
cloudSync.init();

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

console.log('Minimal Text Editor initialized');

