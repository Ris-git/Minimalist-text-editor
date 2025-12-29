/**
 * PKCE (Proof Key for Code Exchange) utilities
 * Implements OAuth 2.0 PKCE flow for secure client-side authentication
 */

/**
 * Generate a random string for code verifier
 * @param {number} length - Length of the string (default: 128)
 * @returns {string} Random string
 */
export function generateCodeVerifier(length = 128) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    verifier += charset[array[i] % charset.length];
  }
  
  return verifier;
}

/**
 * Generate code challenge from verifier using SHA256
 * @param {string} verifier - Code verifier
 * @returns {Promise<string>} Base64URL encoded code challenge
 */
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE pair (verifier and challenge)
 * @returns {Promise<{verifier: string, challenge: string}>}
 */
export async function generatePKCE() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  return { verifier, challenge };
}

/**
 * Store PKCE verifier temporarily (for token exchange)
 * @param {string} verifier - Code verifier
 */
export function storeCodeVerifier(verifier) {
  sessionStorage.setItem('oauth_code_verifier', verifier);
}

/**
 * Get and remove stored code verifier
 * @returns {string|null} Code verifier or null
 */
export function getCodeVerifier() {
  const verifier = sessionStorage.getItem('oauth_code_verifier');
  if (verifier) {
    sessionStorage.removeItem('oauth_code_verifier');
  }
  return verifier;
}

