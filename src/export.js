/**
 * Export functionality
 * Handles exporting content to TXT and Markdown formats
 */

class Export {
  /**
   * Export content as plain text
   * @param {string} content - The content to export
   * @param {string} filename - Optional filename
   */
  exportAsTXT(content, filename = 'document.txt') {
    // Strip HTML tags if any
    const textContent = this.stripHTML(content);
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    this.downloadBlob(blob, filename);
  }

  /**
   * Export content as Markdown
   * @param {string} content - The content to export
   * @param {string} filename - Optional filename
   */
  exportAsMD(content, filename = 'document.md') {
    // Convert HTML to Markdown (basic conversion)
    const markdown = this.htmlToMarkdown(content);
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    this.downloadBlob(blob, filename);
  }

  /**
   * Strip HTML tags from content
   * @param {string} html - HTML content
   * @returns {string} Plain text
   */
  stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Handle line breaks - preserve them
    const brRegex = /<br\s*\/?>/gi;
    const preprocessed = html.replace(brRegex, '\n');
    div.innerHTML = preprocessed;
    
    return div.textContent || div.innerText || '';
  }

  /**
   * Convert HTML to Markdown (basic conversion)
   * @param {string} html - HTML content
   * @returns {string} Markdown content
   */
  htmlToMarkdown(html) {
    // For a simple editor, we'll mostly preserve the text
    // This is a basic implementation - can be enhanced with a library later
    let markdown = html;
    
    // Replace <br> with newlines
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
    
    // Replace <p> tags with double newlines
    markdown = markdown.replace(/<p>/gi, '');
    markdown = markdown.replace(/<\/p>/gi, '\n\n');
    
    // Strip remaining HTML tags
    markdown = this.stripHTML(markdown);
    
    // Clean up excessive newlines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    
    return markdown.trim();
  }

  /**
   * Download a blob as a file
   * @param {Blob} blob - The blob to download
   * @param {string} filename - The filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Generate filename with timestamp
   * @param {string} extension - File extension (e.g., 'txt', 'md')
   * @returns {string} Filename
   */
  generateFilename(extension) {
    const date = new Date();
    const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `document-${timestamp}.${extension}`;
  }
}

export default new Export();

