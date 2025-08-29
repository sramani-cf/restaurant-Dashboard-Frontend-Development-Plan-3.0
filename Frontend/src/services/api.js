// API Service Layer for Restaurant Management System
class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
    this.apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1'
    this.timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async verifyEmail(verificationData) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    })
  }

  async resendVerificationCode(email) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async refreshToken(refreshToken) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async logout(refreshToken) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  // Google OAuth methods
  async verifyGoogleToken(token) {
    return this.request('/auth/google/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  // Get user profile (used after OAuth success)
  async getUserProfile(accessToken) {
    return this.request('/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  // Password reset methods
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  }

  // Helper method for making HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api/${this.apiVersion}${endpoint}`
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthToken() || '',
      },
      timeout: this.timeout,
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(response.status, errorData.message || 'Request failed', errorData)
      }

      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout')
      }
      throw error
    }
  }

  // Get authentication token from localStorage
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'aura_access_token')
    }
    return null
  }

  // Set authentication token
  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'aura_access_token', token)
    }
  }

  // Remove authentication token
  removeAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'aura_access_token')
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'aura_refresh_token')
    }
  }
}

// Custom API Error class
class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Create and export a singleton instance
const apiService = new ApiService()

export { ApiService, ApiError, apiService }