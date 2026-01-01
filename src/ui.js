/**
 * UI Utilities
 * Handles stats (lines, words, characters), theme, and UI interactions
 */

class UI {
  constructor() {
    this.lineCountEl = document.getElementById('line-count');
    this.wordCountEl = document.getElementById('word-count');
    this.charCountEl = document.getElementById('char-count');
    this.saveStatusEl = document.getElementById('save-status');
    this.appContainer = document.querySelector('.app-container');
    this.settingsBtn = document.getElementById('settings-btn');
    
    this.init();
  }

  init() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);

    // Keyboard shortcut: Cmd/Ctrl + K for theme toggle (opens settings)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const currentTheme = this.appContainer.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
      }
    });
  }

  setTheme(theme) {
    this.appContainer.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Sync with Tailwind/RetroUI dark mode convention
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update theme color meta tag
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
    }
  }

  /**
   * Update stats: lines, words, and characters
   * @param {string} text - The text to analyze
   */
  updateStats(text) {
    const lines = this.countLines(text);
    const words = this.countWords(text);
    const chars = this.countCharacters(text);

    this.lineCountEl.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
    this.wordCountEl.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
    this.charCountEl.textContent = `${chars} chars`;
  }

  /**
   * Count lines in text
   * @param {string} text - The text to count
   * @returns {number} Line count
   */
  countLines(text) {
    if (!text || !text.trim()) return 1;
    
    // Remove HTML tags if any, preserve line breaks
    const cleanText = text.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]*>/g, '');
    
    // Count newlines (always at least 1 line)
    const lineCount = cleanText.split('\n').length;
    return Math.max(1, lineCount);
  }

  /**
   * Count characters in text
   * @param {string} text - The text to count
   * @returns {number} Character count
   */
  countCharacters(text) {
    if (!text) return 0;
    
    // Remove HTML tags if any
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length;
  }

  /**
   * Count words in text
   * @param {string} text - The text to count
   * @returns {number} Word count
   */
  countWords(text) {
    if (!text || !text.trim()) return 0;
    
    // Remove HTML tags if any
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    
    // Split by whitespace and filter empty strings
    const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  /**
   * Update save status
   * @param {string} message - Status message
   * @param {boolean} success - Whether the operation was successful
   */
  updateSaveStatus(message, success = true) {
    if (this.saveStatusEl) {
      this.saveStatusEl.textContent = message;
      this.saveStatusEl.className = `status-item ${success ? 'success' : 'error'}`;
      
      if (success && message) {
        setTimeout(() => {
          this.saveStatusEl.textContent = '';
          this.saveStatusEl.className = 'status-item';
        }, 2000);
      }
    }
  }

  /**
   * Show modal
   * @param {HTMLElement} modal - Modal element
   */
  showModal(modal) {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    
    // Focus first interactive element
    const firstButton = modal.querySelector('button');
    if (firstButton) firstButton.focus();
  }

  /**
   * Hide modal
   * @param {HTMLElement} modal - Modal element
   */
  hideModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('visible');
    document.body.style.overflow = '';
  }
}

export default new UI();

