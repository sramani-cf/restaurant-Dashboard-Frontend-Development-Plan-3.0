/**
 * Authentication client for handling OAuth and token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class AuthClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Initiate Google OAuth sign in
   */
  async signInWithGoogle() {
    // For server-side OAuth flow, we redirect to the backend OAuth endpoint
    const oauthUrl = `${this.baseURL}/auth/google`;
    window.location.href = oauthUrl;
  }

  /**
   * Sign up with Google OAuth
   */
  async signUpWithGoogle() {
    // Same as sign in - OAuth handles both cases
    return this.signInWithGoogle();
  }

  /**
   * Handle OAuth success callback
   */
  handleOAuthSuccess(searchParams) {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem('aura_access_token', accessToken);
      localStorage.setItem('aura_refresh_token', refreshToken);
      
      return {
        success: true,
        tokens: { accessToken, refreshToken }
      };
    }

    return {
      success: false,
      error: 'No tokens received from OAuth callback'
    };
  }

  /**
   * Get stored access token
   */
  getAccessToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aura_access_token');
    }
    return null;
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aura_refresh_token');
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  /**
   * Clear authentication tokens
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura_access_token');
      localStorage.removeItem('aura_refresh_token');
      localStorage.removeItem('aura_user');
    }
  }

  /**
   * Get current user from storage
   */
  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('aura_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  /**
   * Set current user in storage
   */
  setCurrentUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_user', JSON.stringify(user));
    }
  }
}

// Create and export singleton instance
export const authClient = new AuthClient();
export default authClient;