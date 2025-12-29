/**
 * Cloud Sync functionality
 * Handles OAuth integration with Google Drive and Dropbox
 * Implements PKCE flow for secure client-side authentication
 */

import { OAUTH_CONFIG, isOAuthConfigured } from './oauth-config.js';
import { generatePKCE, storeCodeVerifier, getCodeVerifier } from './pkce.js';

class CloudSync {
  constructor() {
    this.googleToken = null;
    this.googleRefreshToken = null;
    this.dropboxToken = null;
    this.googleStatusEl = document.getElementById('google-status');
    this.dropboxStatusEl = document.getElementById('dropbox-status');
    this.googleSyncBtn = document.getElementById('google-sync');
    this.dropboxSyncBtn = document.getElementById('dropbox-sync');
    this.googleConnectBtn = document.getElementById('google-connect');
    this.dropboxConnectBtn = document.getElementById('dropbox-connect');

    // Check for OAuth callback
    this.handleOAuthCallback();
    
    // Load saved tokens
    this.loadTokens();
  }

  /**
   * Handle OAuth callback from redirect
   */
  handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      alert(`OAuth error: ${error}`);
      this.cleanupOAuthCallback();
      return;
    }

    if (code && state) {
      if (state === 'google') {
        this.exchangeGoogleToken(code);
      } else if (state === 'dropbox') {
        this.exchangeDropboxToken(code);
      }
    }
  }

  /**
   * Clean up OAuth callback from URL
   */
  cleanupOAuthCallback() {
    const url = new URL(window.location);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('error');
    window.history.replaceState({}, document.title, url.pathname);
  }

  /**
   * Load tokens from sessionStorage
   */
  loadTokens() {
    this.googleToken = sessionStorage.getItem('google_access_token');
    this.googleRefreshToken = sessionStorage.getItem('google_refresh_token');
    this.dropboxToken = sessionStorage.getItem('dropbox_access_token');
    this.updateUI();
  }

  /**
   * Update UI based on connection status
   */
  updateUI() {
    if (this.googleToken) {
      this.googleConnectBtn.textContent = 'Disconnect';
      this.googleSyncBtn.style.display = 'inline-block';
      this.googleStatusEl.textContent = 'Connected';
      this.googleStatusEl.className = 'cloud-status connected';
    } else {
      this.googleConnectBtn.textContent = 'Connect';
      this.googleSyncBtn.style.display = 'none';
      this.googleStatusEl.textContent = 'Not connected';
      this.googleStatusEl.className = 'cloud-status';
    }

    if (this.dropboxToken) {
      this.dropboxConnectBtn.textContent = 'Disconnect';
      this.dropboxSyncBtn.style.display = 'inline-block';
      this.dropboxStatusEl.textContent = 'Connected';
      this.dropboxStatusEl.className = 'cloud-status connected';
    } else {
      this.dropboxConnectBtn.textContent = 'Connect';
      this.dropboxSyncBtn.style.display = 'none';
      this.dropboxStatusEl.textContent = 'Not connected';
      this.dropboxStatusEl.className = 'cloud-status';
    }
  }

  /**
   * Connect to Google Drive using OAuth 2.0 PKCE flow
   */
  async connectGoogle() {
    if (this.googleToken) {
      // Disconnect
      sessionStorage.removeItem('google_access_token');
      sessionStorage.removeItem('google_refresh_token');
      this.googleToken = null;
      this.googleRefreshToken = null;
      this.updateUI();
      return;
    }

    // Check if OAuth is configured
    if (!isOAuthConfigured().google) {
      alert(
        'Google Drive OAuth is not configured.\n\n' +
        'Please add your Google OAuth Client ID in src/oauth-config.js\n\n' +
        'To get a Client ID:\n' +
        '1. Go to https://console.cloud.google.com/\n' +
        '2. Create a project or select existing\n' +
        '3. Enable Google Drive API\n' +
        '4. Create OAuth 2.0 credentials (Web application)\n' +
        '5. Add authorized redirect URI: ' + OAUTH_CONFIG.google.redirectUri
      );
      return;
    }

    try {
      // Generate PKCE pair
      const { verifier, challenge } = await generatePKCE();
      storeCodeVerifier(verifier);

      // Build authorization URL
      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.google.clientId,
        redirect_uri: OAUTH_CONFIG.google.redirectUri,
        response_type: 'code',
        scope: OAUTH_CONFIG.google.scope,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state: 'google',
        access_type: 'offline', // Request refresh token
        prompt: 'consent', // Force consent screen to get refresh token
      });

      // Redirect to Google OAuth
      window.location.href = `${OAUTH_CONFIG.google.authUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Google OAuth error:', error);
      alert('Failed to initiate Google Drive connection: ' + error.message);
    }
  }

  /**
   * Exchange authorization code for access token (Google)
   * @param {string} code - Authorization code
   */
  async exchangeGoogleToken(code) {
    const verifier = getCodeVerifier();
    if (!verifier) {
      alert('OAuth session expired. Please try again.');
      this.cleanupOAuthCallback();
      return;
    }

    try {
      const response = await fetch(OAUTH_CONFIG.google.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: OAUTH_CONFIG.google.clientId,
          code: code,
          redirect_uri: OAUTH_CONFIG.google.redirectUri,
          grant_type: 'authorization_code',
          code_verifier: verifier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Token exchange failed');
      }

      const data = await response.json();
      this.googleToken = data.access_token;
      this.googleRefreshToken = data.refresh_token;

      // Store tokens
      sessionStorage.setItem('google_access_token', this.googleToken);
      if (this.googleRefreshToken) {
        sessionStorage.setItem('google_refresh_token', this.googleRefreshToken);
      }

      this.updateUI();
      this.cleanupOAuthCallback();
      
      alert('Successfully connected to Google Drive!');
    } catch (error) {
      console.error('Token exchange error:', error);
      alert('Failed to connect to Google Drive: ' + error.message);
      this.cleanupOAuthCallback();
    }
  }

  /**
   * Connect to Dropbox using OAuth 2.0 PKCE flow
   */
  async connectDropbox() {
    if (this.dropboxToken) {
      // Disconnect
      sessionStorage.removeItem('dropbox_access_token');
      this.dropboxToken = null;
      this.updateUI();
      return;
    }

    // Check if OAuth is configured
    if (!isOAuthConfigured().dropbox) {
      alert(
        'Dropbox OAuth is not configured.\n\n' +
        'Please add your Dropbox App Key in src/oauth-config.js\n\n' +
        'To get an App Key:\n' +
        '1. Go to https://www.dropbox.com/developers/apps\n' +
        '2. Create new app (Scoped access, Full Dropbox)\n' +
        '3. Add redirect URI: ' + OAUTH_CONFIG.dropbox.redirectUri
      );
      return;
    }

    try {
      // Generate PKCE pair
      const { verifier, challenge } = await generatePKCE();
      storeCodeVerifier(verifier);

      // Build authorization URL
      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.dropbox.appKey,
        redirect_uri: OAUTH_CONFIG.dropbox.redirectUri,
        response_type: 'code',
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state: 'dropbox',
        token_access_type: 'offline', // Request refresh token
      });

      // Redirect to Dropbox OAuth
      window.location.href = `${OAUTH_CONFIG.dropbox.authUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Dropbox OAuth error:', error);
      alert('Failed to initiate Dropbox connection: ' + error.message);
    }
  }

  /**
   * Exchange authorization code for access token (Dropbox)
   * @param {string} code - Authorization code
   */
  async exchangeDropboxToken(code) {
    const verifier = getCodeVerifier();
    if (!verifier) {
      alert('OAuth session expired. Please try again.');
      this.cleanupOAuthCallback();
      return;
    }

    try {
      const response = await fetch(OAUTH_CONFIG.dropbox.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: OAUTH_CONFIG.dropbox.redirectUri,
          code_verifier: verifier,
          client_id: OAUTH_CONFIG.dropbox.appKey,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Token exchange failed');
      }

      const data = await response.json();
      this.dropboxToken = data.access_token;

      // Store token
      sessionStorage.setItem('dropbox_access_token', this.dropboxToken);

      this.updateUI();
      this.cleanupOAuthCallback();
      
      alert('Successfully connected to Dropbox!');
    } catch (error) {
      console.error('Token exchange error:', error);
      alert('Failed to connect to Dropbox: ' + error.message);
      this.cleanupOAuthCallback();
    }
  }

  /**
   * Sync content to Google Drive
   * @param {string} content - Content to sync
   */
  async syncToGoogle(content) {
    if (!this.googleToken) {
      alert('Please connect to Google Drive first');
      return false;
    }

    try {
      // Create a text file in Google Drive
      const fileName = `minimal-editor-${new Date().toISOString().split('T')[0]}.txt`;
      const fileContent = content.replace(/<[^>]*>/g, ''); // Strip HTML tags

      // Create file metadata
      const metadata = {
        name: fileName,
        mimeType: 'text/plain',
      };

      // Upload file using multipart upload
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const formData = `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="metadata"\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"\r\n` +
        `Content-Type: text/plain\r\n\r\n` +
        `${fileContent}\r\n` +
        `--${boundary}--`;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.googleToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const result = await response.json();
      alert('Successfully synced to Google Drive!');
      return true;
    } catch (error) {
      console.error('Google Drive sync error:', error);
      alert('Failed to sync to Google Drive: ' + error.message);
      return false;
    }
  }

  /**
   * Sync content to Dropbox
   * @param {string} content - Content to sync
   */
  async syncToDropbox(content) {
    if (!this.dropboxToken) {
      alert('Please connect to Dropbox first');
      return false;
    }

    try {
      // Create a text file in Dropbox
      const fileName = `/minimal-editor-${new Date().toISOString().split('T')[0]}.txt`;
      const fileContent = content.replace(/<[^>]*>/g, ''); // Strip HTML tags

      // Upload file using Dropbox API
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dropboxToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: fileName,
            mode: 'overwrite',
            autorename: true,
            mute: false,
          }),
        },
        body: fileContent,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_summary || 'Upload failed');
      }

      alert('Successfully synced to Dropbox!');
      return true;
    } catch (error) {
      console.error('Dropbox sync error:', error);
      alert('Failed to sync to Dropbox: ' + error.message);
      return false;
    }
  }

  /**
   * Initialize cloud sync event listeners
   */
  init() {
    this.googleConnectBtn.addEventListener('click', () => this.connectGoogle());
    this.dropboxConnectBtn.addEventListener('click', () => this.connectDropbox());
    
    this.googleSyncBtn.addEventListener('click', async () => {
      const content = document.getElementById('editor').innerHTML;
      await this.syncToGoogle(content);
    });

    this.dropboxSyncBtn.addEventListener('click', async () => {
      const content = document.getElementById('editor').innerHTML;
      await this.syncToDropbox(content);
    });
  }
}

export default CloudSync;
