# OAuth Setup Guide

This guide will help you set up OAuth for Google Drive and Dropbox integration.

## Prerequisites

- A web server (for OAuth redirects)
- HTTPS in production (OAuth requires HTTPS)
- Accounts with Google Cloud and Dropbox Developer Console

## Google Drive Setup

### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: External (or Internal if using Google Workspace)
     - App name: "Minimal Text Editor"
     - User support email: Your email
     - Developer contact: Your email
     - Add scopes: `https://www.googleapis.com/auth/drive.file`
     - Save and continue through the steps

5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Minimal Text Editor Web Client"
   - Authorized redirect URIs: 
     - For development: `http://localhost:3000` (or your dev port)
     - For production: `https://yourdomain.com` (your actual domain)
   - Click "Create"
   - **Copy the Client ID** (you'll need this)

### Step 2: Configure the Application

1. Open `src/oauth-config.js`
2. Add your Google Client ID:
   ```javascript
   clientId: 'YOUR_GOOGLE_CLIENT_ID_HERE',
   ```

### Step 3: Test the Connection

1. Start your development server: `npm run dev`
2. Click the "Connect" button for Google Drive
3. You should be redirected to Google's OAuth consent screen
4. After authorizing, you'll be redirected back and connected

## Dropbox Setup

### Step 1: Create a Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose app type:
   - **Scoped access** (recommended for security)
   - **Full Dropbox** (or "App folder" for limited access)
4. Name your app: "Minimal Text Editor"
5. Click "Create app"
6. **Copy the App Key** (you'll need this)

### Step 2: Configure OAuth Redirect URI

1. In your Dropbox app settings, go to the "OAuth 2" section
2. Add redirect URIs:
   - For development: `http://localhost:3000` (or your dev port)
   - For production: `https://yourdomain.com` (your actual domain)
3. Save the changes

### Step 3: Configure the Application

1. Open `src/oauth-config.js`
2. Add your Dropbox App Key:
   ```javascript
   appKey: 'YOUR_DROPBOX_APP_KEY_HERE',
   ```

### Step 4: Test the Connection

1. Start your development server: `npm run dev`
2. Click the "Connect" button for Dropbox
3. You should be redirected to Dropbox's OAuth consent screen
4. After authorizing, you'll be redirected back and connected

## Security Notes

1. **Never commit OAuth credentials to version control**
   - Add `src/oauth-config.js` to `.gitignore` if you hardcode credentials
   - Better: Use environment variables in production

2. **HTTPS Required in Production**
   - OAuth requires HTTPS in production
   - Most hosting platforms (Netlify, Vercel, etc.) provide HTTPS automatically

3. **Token Storage**
   - Tokens are stored in `sessionStorage` (cleared when browser closes)
   - For production, consider more secure storage options

4. **PKCE Flow**
   - The implementation uses PKCE (Proof Key for Code Exchange)
   - This is the recommended approach for client-side OAuth
   - No backend server required

## Troubleshooting

### "OAuth is not configured" error
- Make sure you've added your Client ID/App Key in `src/oauth-config.js`
- Check that the values are correct (no extra spaces)

### "Redirect URI mismatch" error
- Ensure the redirect URI in your OAuth provider matches exactly
- Check for trailing slashes, http vs https, etc.
- The redirect URI is automatically set to your current origin

### "Token exchange failed" error
- Check browser console for detailed error messages
- Ensure your OAuth app is properly configured
- Verify that the required APIs/scopes are enabled

### Tokens not persisting
- Tokens are stored in `sessionStorage` (cleared on browser close)
- This is by design for security
- Users will need to reconnect after closing the browser

## Production Deployment

1. **Update OAuth Config**:
   - Set production redirect URIs in OAuth provider consoles
   - Update `redirectUri` in `oauth-config.js` if needed (it auto-detects)

2. **Environment Variables** (Recommended):
   - Use environment variables for client IDs in production
   - Update `oauth-config.js` to read from `import.meta.env` (Vite) or `process.env`

3. **HTTPS**:
   - Ensure your production site uses HTTPS
   - OAuth will not work over HTTP in production

4. **Test**:
   - Test OAuth flow in production before going live
   - Verify redirect URIs match exactly

## Example Configuration

```javascript
// src/oauth-config.js
export const OAUTH_CONFIG = {
  google: {
    clientId: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
    redirectUri: window.location.origin + window.location.pathname,
    scope: 'https://www.googleapis.com/auth/drive.file',
    // ... rest of config
  },
  dropbox: {
    appKey: 'abcdefghijklmnop',
    redirectUri: window.location.origin + window.location.pathname,
    // ... rest of config
  }
};
```

## Support

For issues or questions:
- Google Drive API: [Google Drive API Documentation](https://developers.google.com/drive/api)
- Dropbox API: [Dropbox API Documentation](https://www.dropbox.com/developers/documentation)

