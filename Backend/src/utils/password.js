const bcrypt = require('bcryptjs');
const config = require('../config');
const logger = require('../config/logger');

class PasswordManager {
  /**
   * Hash a plain text password
   */
  async hashPassword(plainPassword) {
    try {
      if (!plainPassword || typeof plainPassword !== 'string') {
        throw new Error('Invalid password provided');
      }

      const saltRounds = config.security.bcryptSaltRounds;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      
      return hashedPassword;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare plain text password with hashed password
   */
  async comparePassword(plainPassword, hashedPassword) {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      logger.error('Error comparing password:', error);
      throw new Error('Failed to compare password');
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    const errors = [];

    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    // Minimum length requirement
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length requirement (to prevent DoS attacks)
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // At least one number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak patterns
    const commonPatterns = [
      /(.)\1{3,}/, // 4 or more repeated characters
      /123456|654321/, // Sequential numbers
      /qwerty|asdfgh/, // Common keyboard patterns
      /password|123456|admin|letmein/i, // Common passwords
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns and is too weak');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password),
    };
  }

  /**
   * Calculate password strength score (0-100)
   */
  calculatePasswordStrength(password) {
    if (!password) return 0;

    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 4, 40);

    // Character type bonuses
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    // Variety bonus
    const uniqueChars = new Set(password.toLowerCase()).size;
    score += Math.min(uniqueChars * 2, 20);

    // Deductions for weak patterns
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
    if (/password|admin|user/i.test(password)) score -= 20; // Common words

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate a random password
   */
  generateRandomPassword(length = 12, options = {}) {
    const defaults = {
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true, // Exclude similar looking characters (0, O, l, 1, etc.)
    };

    const settings = { ...defaults, ...options };
    
    let charset = '';
    
    if (settings.includeLowercase) {
      charset += settings.excludeSimilar ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    
    if (settings.includeUppercase) {
      charset += settings.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    
    if (settings.includeNumbers) {
      charset += settings.excludeSimilar ? '23456789' : '0123456789';
    }
    
    if (settings.includeSymbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (!charset) {
      throw new Error('At least one character type must be included');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Ensure the password meets the minimum requirements
    const validation = this.validatePasswordStrength(password);
    if (!validation.isValid && validation.strength < 60) {
      // Regenerate if the password is too weak
      return this.generateRandomPassword(length, options);
    }

    return password;
  }

  /**
   * Check if password has been compromised (placeholder for future implementation)
   */
  async checkPasswordCompromised(password) {
    // This would typically integrate with services like HaveIBeenPwned
    // For now, just check against a basic list of common passwords
    const commonPasswords = [
      'password', '123456', '123456789', '12345', 'qwerty',
      'abc123', 'password123', 'admin', 'letmein', 'welcome',
      'monkey', '1234567890', 'dragon', 'master', 'hello',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }
}

module.exports = new PasswordManager();