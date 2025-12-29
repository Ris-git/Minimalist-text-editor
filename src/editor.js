/**
 * Core Editor functionality
 * Handles editor initialization, auto-save, and content management
 */

import storage from './storage.js';
import ui from './ui.js';

class Editor {
  constructor() {
    this.editorEl = document.getElementById('editor');
    this.saveDebounceTimer = null;
    this.saveDebounceDelay = 500; // 500ms delay for auto-save
    
    this.init();
  }

  async init() {
    // Initialize storage
    try {
      await storage.init();
    } catch (error) {
      console.error('Storage initialization failed:', error);
      ui.updateSaveStatus('Storage error', false);
    }

    // Load saved content
    await this.loadContent();

    // Focus editor
    this.editorEl.focus();

    // Setup auto-save
    this.setupAutoSave();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Load content from storage
   */
  async loadContent() {
    try {
      const content = await storage.load();
      if (content) {
        // Set content while preserving cursor position
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        this.editorEl.innerHTML = content;
        ui.updateStats(this.getTextContent());

        // Restore cursor position if possible
        if (range) {
          try {
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (e) {
            // Fallback: place cursor at end
            this.placeCursorAtEnd();
          }
        } else {
          this.placeCursorAtEnd();
        }
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      ui.updateSaveStatus('Load failed', false);
    }
  }

  /**
   * Place cursor at end of editor
   */
  placeCursorAtEnd() {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(this.editorEl);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    this.editorEl.addEventListener('input', () => {
      this.handleInput();
    });

    // Also save on blur (when editor loses focus)
    this.editorEl.addEventListener('blur', () => {
      this.save();
    });
  }

  /**
   * Handle input event (debounced)
   */
  handleInput() {
    // Update stats immediately
    ui.updateStats(this.getTextContent());

    // Debounce save
    clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
      this.save();
    }, this.saveDebounceDelay);
  }

  /**
   * Save content to storage
   */
  async save() {
    try {
      const content = this.editorEl.innerHTML;
      await storage.save(content);
      ui.updateSaveStatus('Saved', true);
    } catch (error) {
      console.error('Save failed:', error);
      ui.updateSaveStatus('Save failed', false);

      // Check if it's a quota error
      if (error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please clear some space.');
      }
    }
  }

  /**
   * Get plain text content
   * @returns {string} Plain text
   */
  getTextContent() {
    return this.editorEl.innerText || this.editorEl.textContent || '';
  }

  /**
   * Get HTML content
   * @returns {string} HTML content
   */
  getHTMLContent() {
    return this.editorEl.innerHTML || '';
  }

  /**
   * Set editor content
   * @param {string} content - Content to set
   */
  setContent(content) {
    this.editorEl.innerHTML = content;
    ui.updateStats(this.getTextContent());
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + S: Prevent default and show export menu (we handle save automatically)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        // Auto-save is handled, but we can trigger export menu
        document.getElementById('export-btn').click();
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        const visibleModal = document.querySelector('.modal.visible');
        if (visibleModal) {
          ui.hideModal(visibleModal);
        }
      }
    });

    // Prevent default save dialog
    window.addEventListener('beforeunload', (e) => {
      // Modern browsers ignore custom messages, but we can still prevent
      // Since we auto-save, we don't need to warn users
    });
  }
}

export default Editor;

