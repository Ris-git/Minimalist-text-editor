/**
 * Settings functionality
 * Handles editor customization settings
 */

class Settings {
  constructor() {
    this.sidebar = document.getElementById('settings-sidebar');
    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsClose = document.getElementById('settings-close');
    this.editor = document.getElementById('editor');
    this.editorContainer = document.querySelector('.editor-container');
    this.statusBar = document.querySelector('.status-bar');
    
    // Settings inputs
    this.theme = document.getElementById('setting-theme');
    this.bgColor = document.getElementById('setting-bg-color');
    this.fontColor = document.getElementById('setting-font-color');
    this.fontSize = document.getElementById('setting-font-size');
    this.fontFamily = document.getElementById('setting-font-family');
    this.lineHeight = document.getElementById('setting-line-height');
    this.width = document.getElementById('setting-width');
    this.statistics = document.getElementById('setting-statistics');
    this.scrollbar = document.getElementById('setting-scrollbar');
    this.restoreBtn = document.getElementById('restore-defaults');
    
    this.defaults = {
      theme: 'light',
      bgColor: '#ffffff',
      fontColor: '#1a1a1a',
      fontSize: '18',
      fontFamily: 'Verdana',
      lineHeight: '1.6',
      width: '800',
      statistics: true,
      scrollbar: true,
    };
    
    this.init();
  }

  init() {
    // Load saved settings
    this.loadSettings();
    
    // Toggle sidebar
    this.settingsBtn.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    this.settingsClose.addEventListener('click', () => {
      this.hideSidebar();
    });
    
    // Close on backdrop click
    this.sidebar.addEventListener('click', (e) => {
      if (e.target === this.sidebar) {
        this.hideSidebar();
      }
    });
    
    // Settings change handlers
    this.theme.addEventListener('change', () => this.updateTheme());
    this.bgColor.addEventListener('change', () => this.updateBackgroundColor());
    this.bgColor.addEventListener('input', () => this.updateColorPreview(this.bgColor, 'bg'));
    this.fontColor.addEventListener('change', () => this.updateFontColor());
    this.fontColor.addEventListener('input', () => this.updateColorPreview(this.fontColor, 'font'));
    this.fontSize.addEventListener('input', () => this.updateFontSize());
    this.fontFamily.addEventListener('input', () => this.updateFontFamily());
    this.lineHeight.addEventListener('input', () => this.updateLineHeight());
    this.width.addEventListener('input', () => this.updateWidth());
    this.statistics.addEventListener('change', () => this.toggleStatistics());
    this.scrollbar.addEventListener('change', () => this.toggleScrollbar());
    this.restoreBtn.addEventListener('click', () => this.restoreDefaults());
    
    // Apply initial settings
    this.applyAllSettings();
  }

  toggleSidebar() {
    this.sidebar.classList.toggle('visible');
    this.sidebar.setAttribute('aria-hidden', this.sidebar.classList.contains('visible') ? 'false' : 'true');
  }

  hideSidebar() {
    this.sidebar.classList.remove('visible');
    this.sidebar.setAttribute('aria-hidden', 'true');
  }

  updateColorPreview(colorInput, type) {
    const color = colorInput.value;
    colorInput.style.setProperty('--preview-color', color);
    colorInput.setAttribute('data-color-preview', color.toUpperCase());
  }

  updateTheme() {
    const theme = this.theme.value;
    const appContainer = document.querySelector('.app-container');
    appContainer.setAttribute('data-theme', theme);
    this.saveSettings();
  }

  updateBackgroundColor() {
    const color = this.bgColor.value;
    // Apply to entire website (body and html)
    document.body.style.backgroundColor = color;
    document.documentElement.style.backgroundColor = color;
    // Also update the editor container and status bar
    if (this.editorContainer) {
      this.editorContainer.style.backgroundColor = color;
    }
    if (this.statusBar) {
      this.statusBar.style.backgroundColor = color;
    }
    // Update CSS variable for consistency
    document.documentElement.style.setProperty('--bg-primary', color);
    this.saveSettings();
  }

  updateFontColor() {
    const color = this.fontColor.value;
    this.editor.style.color = color;
    this.saveSettings();
  }

  updateFontSize() {
    const size = this.fontSize.value;
    // Add 'px' if it's just a number
    const fontSize = isNaN(size) ? size : size + 'px';
    this.editor.style.fontSize = fontSize;
    this.saveSettings();
  }

  updateFontFamily() {
    const font = this.fontFamily.value;
    this.editor.style.fontFamily = font;
    this.saveSettings();
  }

  updateLineHeight() {
    const height = this.lineHeight.value;
    this.editor.style.lineHeight = height;
    this.saveSettings();
  }

  updateWidth() {
    const width = this.width.value;
    const widthValue = isNaN(width) ? width : width + 'px';
    this.editor.style.maxWidth = widthValue;
    this.saveSettings();
  }

  toggleStatistics() {
    const show = this.statistics.checked;
    const statsEl = document.getElementById('status-stats');
    if (statsEl) {
      statsEl.style.display = show ? 'flex' : 'none';
    }
    this.saveSettings();
  }

  toggleScrollbar() {
    const show = this.scrollbar.checked;
    if (show) {
      document.documentElement.style.overflowY = 'auto';
      this.editorContainer.style.overflowY = 'auto';
    } else {
      document.documentElement.style.overflowY = 'hidden';
      this.editorContainer.style.overflowY = 'hidden';
    }
    this.saveSettings();
  }

  restoreDefaults() {
    if (confirm('Restore all settings to defaults?')) {
      this.theme.value = this.defaults.theme;
      this.bgColor.value = this.defaults.bgColor;
      this.fontColor.value = this.defaults.fontColor;
      this.fontSize.value = this.defaults.fontSize;
      this.fontFamily.value = this.defaults.fontFamily;
      this.lineHeight.value = this.defaults.lineHeight;
      this.width.value = this.defaults.width;
      this.statistics.checked = this.defaults.statistics;
      this.scrollbar.checked = this.defaults.scrollbar;
      
      // Reset CSS variables
      document.documentElement.style.removeProperty('--bg-primary');
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      
      this.applyAllSettings();
      this.saveSettings();
    }
  }

  applyAllSettings() {
    this.updateColorPreview(this.bgColor, 'bg');
    this.updateColorPreview(this.fontColor, 'font');
    this.updateTheme();
    this.updateBackgroundColor();
    this.updateFontColor();
    this.updateFontSize();
    this.updateFontFamily();
    this.updateLineHeight();
    this.updateWidth();
    this.toggleStatistics();
    this.toggleScrollbar();
  }

  saveSettings() {
    const settings = {
      theme: this.theme.value,
      bgColor: this.bgColor.value,
      fontColor: this.fontColor.value,
      fontSize: this.fontSize.value,
      fontFamily: this.fontFamily.value,
      lineHeight: this.lineHeight.value,
      width: this.width.value,
      statistics: this.statistics.checked,
      scrollbar: this.scrollbar.checked,
    };
    localStorage.setItem('editorSettings', JSON.stringify(settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('editorSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.theme.value = settings.theme || this.defaults.theme;
        this.bgColor.value = settings.bgColor || this.defaults.bgColor;
        this.fontColor.value = settings.fontColor || this.defaults.fontColor;
        this.fontSize.value = settings.fontSize || this.defaults.fontSize;
        this.fontFamily.value = settings.fontFamily || this.defaults.fontFamily;
        this.lineHeight.value = settings.lineHeight || this.defaults.lineHeight;
        this.width.value = settings.width || this.defaults.width;
        this.statistics.checked = settings.statistics !== undefined ? settings.statistics : this.defaults.statistics;
        this.scrollbar.checked = settings.scrollbar !== undefined ? settings.scrollbar : this.defaults.scrollbar;
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }
}

export default Settings;

