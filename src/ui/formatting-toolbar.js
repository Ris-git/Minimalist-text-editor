/**
 * Text Formatting Toolbar
 * Appears when text is selected and provides formatting options
 */

class FormattingToolbar {
  constructor() {
    this.toolbar = null;
    this.editor = document.getElementById('editor');
    this.isVisible = false;
    this.selection = null;
    
    this.init();
  }

  init() {
    this.createToolbar();
    this.setupEventListeners();
  }

  createToolbar() {
    // Create toolbar element
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'formatting-toolbar';
    this.toolbar.innerHTML = `
      <div class="toolbar-content">
        <div class="toolbar-group">
          <button class="toolbar-btn" data-action="heading1" title="Heading 1">
            <span class="toolbar-icon">H1</span>
          </button>
          <button class="toolbar-btn" data-action="heading2" title="Heading 2">
            <span class="toolbar-icon">H2</span>
          </button>
          <button class="toolbar-btn" data-action="heading3" title="Heading 3">
            <span class="toolbar-icon">H3</span>
          </button>
        </div>
        
        <div class="toolbar-separator"></div>
        
        <div class="toolbar-group">
          <button class="toolbar-btn" data-action="bold" title="Bold">
            <span class="toolbar-icon">B</span>
          </button>
          <button class="toolbar-btn" data-action="italic" title="Italic">
            <span class="toolbar-icon">I</span>
          </button>
        </div>
        
        <div class="toolbar-separator"></div>
        
        <div class="toolbar-group">
          <button class="toolbar-btn" data-action="link" title="Add Link">
            <span class="toolbar-icon">🔗</span>
          </button>
        </div>
        
        <div class="toolbar-separator"></div>
        
        <div class="toolbar-group">
          <button class="toolbar-btn" data-action="align-left" title="Align Left">
            <span class="toolbar-icon">⬅</span>
          </button>
          <button class="toolbar-btn" data-action="align-center" title="Align Center">
            <span class="toolbar-icon">⬌</span>
          </button>
          <button class="toolbar-btn" data-action="align-right" title="Align Right">
            <span class="toolbar-icon">➡</span>
          </button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(this.toolbar);
  }

  setupEventListeners() {
    // Show/hide toolbar on selection
    this.editor.addEventListener('mouseup', () => this.handleSelection());
    this.editor.addEventListener('keyup', () => this.handleSelection());
    
    // Hide toolbar when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.toolbar.contains(e.target) && e.target !== this.editor) {
        this.hide();
      }
    });
    
    // Handle toolbar button clicks
    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.toolbar-btn');
      if (btn) {
        const action = btn.dataset.action;
        this.applyFormatting(action);
      }
    });
  }

  handleSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      this.show(selection);
    } else {
      this.hide();
    }
  }

  show(selection) {
    this.selection = selection;
    this.isVisible = true;
    
    // Position toolbar near selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    this.toolbar.style.display = 'block';
    this.toolbar.style.left = `${rect.left + window.scrollX}px`;
    this.toolbar.style.top = `${rect.top + window.scrollY - 50}px`;
  }

  hide() {
    this.isVisible = false;
    this.toolbar.style.display = 'none';
  }

  applyFormatting(action) {
    if (!this.selection) return;
    
    const range = this.selection.getRangeAt(0);
    const selectedText = range.toString();
    
    switch (action) {
      case 'heading1':
        this.wrapSelection('h1');
        break;
      case 'heading2':
        this.wrapSelection('h2');
        break;
      case 'heading3':
        this.wrapSelection('h3');
        break;
      case 'bold':
        this.wrapSelection('strong');
        break;
      case 'italic':
        this.wrapSelection('em');
        break;
      case 'link':
        this.createLink();
        break;
      case 'align-left':
        this.setAlignment('left');
        break;
      case 'align-center':
        this.setAlignment('center');
        break;
      case 'align-right':
        this.setAlignment('right');
        break;
    }
    
    this.hide();
  }

  wrapSelection(tag) {
    const range = this.selection.getRangeAt(0);
    const selectedText = range.toString();
    
    const wrapper = document.createElement(tag);
    wrapper.textContent = selectedText;
    
    range.deleteContents();
    range.insertNode(wrapper);
    
    // Clear selection
    this.selection.removeAllRanges();
  }

  createLink() {
    const url = prompt('Enter URL:');
    if (url) {
      const range = this.selection.getRangeAt(0);
      const selectedText = range.toString();
      
      const link = document.createElement('a');
      link.href = url;
      link.textContent = selectedText;
      link.target = '_blank';
      
      range.deleteContents();
      range.insertNode(link);
      
      this.selection.removeAllRanges();
    }
  }

  setAlignment(align) {
    const range = this.selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    
    // Find or create block container
    while (container && container !== this.editor) {
      if (container.nodeType === Node.ELEMENT_NODE) {
        const display = window.getComputedStyle(container).display;
        if (display === 'block' || display === 'flex') {
          break;
        }
      }
      container = container.parentNode;
    }
    
    if (container === this.editor) {
      // Create a div wrapper
      const wrapper = document.createElement('div');
      wrapper.style.textAlign = align;
      
      try {
        range.surroundContents(wrapper);
      } catch (e) {
        // If selection spans multiple blocks, wrap each
        const contents = range.extractContents();
        wrapper.appendChild(contents);
        range.insertNode(wrapper);
      }
    } else {
      container.style.textAlign = align;
    }
    
    this.selection.removeAllRanges();
  }
}

export default FormattingToolbar;
