/**
 * OAuth Configuration
 * 
 * To use OAuth, you need to:
 * 1. Create OAuth apps in Google Cloud Console and Dropbox App Console
 * 2. Add your client IDs and redirect URIs here
 * 3. Add authorized redirect URIs in the OAuth provider consoles
 * 
 * IMPORTANT: In production, these should be environment variables, not hardcoded
 */

export const OAUTH_CONFIG = {
  google: {
    // Get this from Google Cloud Console
    // https://console.cloud.google.com/apis/credentials
    clientId: '', // Add your Google OAuth Client ID here
    
    // Redirect URI - must match what's configured in Google Cloud Console
    redirectUri: window.location.origin + window.location.pathname,
    
    // Scopes for Google Drive API
    scope: 'https://www.googleapis.com/auth/drive.file',
    
    // OAuth endpoints
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  
  dropbox: {
    // Get this from Dropbox App Console
    // https://www.dropbox.com/developers/apps
    appKey: '', // Add your Dropbox App Key here
    
    // Redirect URI - must match what's configured in Dropbox App Console
    redirectUri: window.location.origin + window.location.pathname,
    
    // OAuth endpoints
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
  }
};

// Check if OAuth is configured
export function isOAuthConfigured() {
  return {
    google: !!OAUTH_CONFIG.google.clientId,
    dropbox: !!OAUTH_CONFIG.dropbox.appKey
  };
}

