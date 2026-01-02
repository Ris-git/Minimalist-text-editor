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
    this.typingTimer = null;
    this.isTyping = false;
    
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

    // If no content, show demo typewriter effect
    if (!this.editorEl.innerHTML.trim()) {
      this.showTypewriterDemo();
    }

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

    // Handle typewriter effect
    this.handleTypewriterEffect();

    // Debounce save
    clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
      this.save();
    }, this.saveDebounceDelay);
  }

  /**
   * Handle typewriter effect
   */
  handleTypewriterEffect() {
    // Clear existing timer
    clearTimeout(this.typingTimer);
    
    // Add typing class if not already present
    if (!this.isTyping) {
      this.isTyping = true;
      this.editorEl.classList.add('typing');
    }
    
    // Set timer to remove typing class after typing stops
    this.typingTimer = setTimeout(() => {
      this.isTyping = false;
      this.editorEl.classList.remove('typing');
    }, 1000); // Remove effect 1 second after typing stops
  }

  /**
   * Create smooth typewriter effect for demo text
   */
  createSmoothTypewriterEffect(text, className = '') {
    const words = text.split(' ');
    let html = '';
    
    words.forEach((word, index) => {
      const wordClass = className && index === words.length - 1 ? className : '';
      html += `<span class="typewriter-word ${wordClass}" style="animation-delay: ${index * 0.5}s">${word}</span>`;
      if (index < words.length - 1) {
        html += ' ';
      }
    });
    
    return `<div class="typewriter-container">${html}</div>`;
  }

  /**
   * Show typewriter demo on first load
   */
  showTypewriterDemo() {
    const demoText = "Build awesome apps with Aceternity.";
    const demoHtml = this.createSmoothTypewriterEffect(demoText, 'text-blue-500');
    
    // Add demo content with subtitle
    this.editorEl.innerHTML = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem;">
          The road to freedom starts from here
        </p>
        ${demoHtml}
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
          <button style="padding: 0.5rem 1rem; border-radius: 0.75rem; background: black; color: white; border: none; font-size: 0.875rem;">
            Join now
          </button>
          <button style="padding: 0.5rem 1rem; border-radius: 0.75rem; background: white; color: black; border: 1px solid black; font-size: 0.875rem;">
            Signup
          </button>
        </div>
      </div>
    `;
    
    // Clear demo after user starts typing
    setTimeout(() => {
      this.editorEl.addEventListener('input', () => {
        if (this.editorEl.innerHTML.includes('Build awesome apps')) {
          this.editorEl.innerHTML = '';
          this.editorEl.focus();
        }
      }, { once: true });
    }, 1000);
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

