const database = require('../config/database');
const logger = require('../config/logger');
const redis = require('../config/redis');
const jwtManager = require('../utils/jwt');
const passwordManager = require('../utils/password');
const { AuthenticationError, ValidationError, ConflictError } = require('../middleware/errorHandler');
const { generateVerificationCode, sendVerificationCode, sendPasswordResetEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, phone, username } = req.body;
      
      const prisma = database.getClient();
      
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(username ? [{ username }] : []),
          ],
        },
      });
      
      if (existingUser) {
        if (existingUser.email === email) {
          throw new ConflictError('Email address is already registered');
        }
        if (existingUser.username === username) {
          throw new ConflictError('Username is already taken');
        }
      }
      
      // Validate password strength
      const passwordValidation = passwordManager.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
      }
      
      // Hash password
      const hashedPassword = await passwordManager.hashPassword(password);
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + (parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_MINUTES) || 10) * 60 * 1000);
      
      // Create user with verification fields
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
          username: username || null,
          role: 'STAFF', // Default role
          status: 'ACTIVE',
          isEmailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationExpiry: verificationExpiry,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });
      
      // Send verification email
      const emailResult = await sendVerificationCode(
        user.email, 
        `${user.firstName} ${user.lastName}`.trim() || user.email,
        verificationCode
      );
      
      if (!emailResult.success) {
        logger.warn('Failed to send verification email:', emailResult.error);
      }
      
      logger.info('User registered successfully:', { 
        userId: user.id, 
        email: user.email,
        emailSent: emailResult.success 
      });
      
      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification code.',
        user,
        emailSent: emailResult.success,
        requiresEmailVerification: true,
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const prisma = database.getClient();
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          restaurantStaff: {
            select: {
              id: true,
              restaurantId: true,
              role: true,
              position: true,
              isActive: true,
            },
          },
        },
      });
      
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }
      
      if (user.status !== 'ACTIVE') {
        throw new AuthenticationError('Account is not active');
      }
      
      // Verify password
      const isPasswordValid = await passwordManager.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }
      
      // Clean expired refresh tokens for this user
      await prisma.refreshToken.deleteMany({
        where: {
          userId: user.id,
          expiresAt: { lt: new Date() },
        },
      });
      
      // Generate tokens
      const tokenPair = jwtManager.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantStaff?.[0]?.restaurantId, // Primary restaurant
      });
      
      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: tokenPair.refreshToken,
          userId: user.id,
          expiresAt: jwtManager.getTokenExpiration(tokenPair.refreshToken),
        },
      });
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      logger.info('User logged in successfully:', { userId: user.id, email: user.email });
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        tokens: tokenPair,
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }
      
      const prisma = database.getClient();
      
      // Verify refresh token
      let decoded;
      try {
        decoded = jwtManager.verifyRefreshToken(refreshToken);
      } catch (error) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }
      
      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          user: {
            include: {
              restaurantStaff: {
                select: {
                  id: true,
                  restaurantId: true,
                  role: true,
                  position: true,
                  isActive: true,
                },
              },
            },
          },
        },
      });
      
      if (!storedToken || storedToken.user.status !== 'ACTIVE') {
        throw new AuthenticationError('Invalid refresh token');
      }
      
      // Generate new token pair
      const newTokenPair = jwtManager.generateTokenPair({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
        restaurantId: storedToken.user.restaurantStaff?.[0]?.restaurantId,
      });
      
      // Update stored refresh token
      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: {
          token: newTokenPair.refreshToken,
          expiresAt: jwtManager.getTokenExpiration(newTokenPair.refreshToken),
        },
      });
      
      logger.info('Token refreshed successfully:', { userId: storedToken.user.id });
      
      res.json({
        message: 'Token refreshed successfully',
        tokens: newTokenPair,
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const accessToken = req.token; // From auth middleware
      
      const prisma = database.getClient();
      
      // Remove refresh token from database if provided
      if (refreshToken) {
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });
      }
      
      // Blacklist access token in Redis
      if (accessToken) {
        try {
          const tokenExpiration = jwtManager.getTokenExpiration(accessToken);
          const ttl = Math.floor((tokenExpiration - new Date()) / 1000);
          
          if (ttl > 0) {
            await redis.set(`blacklist:${accessToken}`, 'true', ttl);
          }
        } catch (redisError) {
          logger.warn('Failed to blacklist token in Redis:', redisError);
        }
      }
      
      logger.info('User logged out successfully:', { userId: req.user?.id });
      
      res.json({
        message: 'Logout successful',
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Logout from all devices
   */
  async logoutAll(req, res, next) {
    try {
      const userId = req.user.id;
      const prisma = database.getClient();
      
      // Remove all refresh tokens for this user
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
      
      logger.info('User logged out from all devices:', { userId });
      
      res.json({
        message: 'Logged out from all devices successfully',
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      const prisma = database.getClient();
      
      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      });
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      
      // Verify current password
      const isCurrentPasswordValid = await passwordManager.comparePassword(
        currentPassword,
        user.password
      );
      
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }
      
      // Validate new password strength
      const passwordValidation = passwordManager.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError('New password does not meet requirements', passwordValidation.errors);
      }
      
      // Check if new password is the same as current password
      const isSamePassword = await passwordManager.comparePassword(newPassword, user.password);
      if (isSamePassword) {
        throw new ValidationError('New password must be different from current password');
      }
      
      // Hash new password
      const hashedNewPassword = await passwordManager.hashPassword(newPassword);
      
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
      
      // Invalidate all existing refresh tokens (force re-login on all devices)
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
      
      logger.info('Password changed successfully:', { userId });
      
      res.json({
        message: 'Password changed successfully. Please login again on all devices.',
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const prisma = database.getClient();
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          restaurantStaff: {
            select: {
              id: true,
              restaurantId: true,
              role: true,
              position: true,
              department: true,
              isActive: true,
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      
      res.json({
        message: 'Profile retrieved successfully',
        user,
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone, username } = req.body;
      
      const prisma = database.getClient();
      
      // Check if username is already taken by another user
      if (username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username,
            NOT: { id: userId },
          },
        });
        
        if (existingUser) {
          throw new ConflictError('Username is already taken');
        }
      }
      
      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
          username: username || undefined,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          updatedAt: true,
        },
      });
      
      logger.info('Profile updated successfully:', { userId });
      
      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email with OTP code
   */
  async verifyEmail(req, res, next) {
    try {
      const { email, verificationCode } = req.body;
      
      if (!email || !verificationCode) {
        throw new ValidationError('Email and verification code are required');
      }
      
      const prisma = database.getClient();
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
          emailVerificationCode: true,
          emailVerificationExpiry: true,
        },
      });
      
      if (!user) {
        throw new ValidationError('Invalid email address');
      }
      
      if (user.isEmailVerified) {
        throw new ValidationError('Email is already verified');
      }
      
      if (!user.emailVerificationCode) {
        throw new ValidationError('No verification code found. Please request a new one.');
      }
      
      if (new Date() > user.emailVerificationExpiry) {
        throw new ValidationError('Verification code has expired. Please request a new one.');
      }
      
      if (user.emailVerificationCode !== verificationCode) {
        throw new ValidationError('Invalid verification code');
      }
      
      // Update user as verified
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          emailVerificationCode: null,
          emailVerificationExpiry: null,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          isEmailVerified: true,
          emailVerifiedAt: true,
          createdAt: true,
        },
      });
      
      // Generate tokens for the verified user
      const tokenPair = jwtManager.generateTokenPair({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      });
      
      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: tokenPair.refreshToken,
          userId: updatedUser.id,
          expiresAt: jwtManager.getTokenExpiration(tokenPair.refreshToken),
        },
      });
      
      // Update last login
      await prisma.user.update({
        where: { id: updatedUser.id },
        data: { lastLoginAt: new Date() },
      });
      
      logger.info('Email verified successfully:', { userId: updatedUser.id, email: updatedUser.email });
      
      res.json({
        message: 'Email verified successfully! Welcome to AURA 2030.',
        user: updatedUser,
        tokens: tokenPair,
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new ValidationError('Email is required');
      }
      
      const prisma = database.getClient();
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isEmailVerified: true,
        },
      });
      
      if (!user) {
        throw new ValidationError('User not found');
      }
      
      if (user.isEmailVerified) {
        throw new ValidationError('Email is already verified');
      }
      
      // Generate new verification code
      const verificationCode = generateVerificationCode();
      const verificationExpiry = new Date(Date.now() + (parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_MINUTES) || 10) * 60 * 1000);
      
      // Update user with new verification code
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationCode: verificationCode,
          emailVerificationExpiry: verificationExpiry,
        },
      });
      
      // Send verification email
      const emailResult = await sendVerificationCode(
        user.email, 
        `${user.firstName} ${user.lastName}`.trim() || user.email,
        verificationCode
      );
      
      if (!emailResult.success) {
        logger.warn('Failed to send verification email:', emailResult.error);
        throw new Error('Failed to send verification email. Please try again.');
      }
      
      logger.info('Verification code resent:', { userId: user.id, email: user.email });
      
      res.json({
        message: 'Verification code sent successfully. Please check your email.',
        emailSent: true,
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate Google OAuth authentication
   */
  async initiateGoogleAuth(req, res, next) {
    // This will be handled by passport middleware
    // The actual redirect is done by passport.authenticate('google')
    logger.info('Initiating Google OAuth authentication');
  }

  /**
   * Handle Google OAuth callback
   */
  async googleAuthCallback(req, res, next) {
    try {
      // At this point, passport has already authenticated the user
      // and req.user contains the user information
      
      if (!req.user) {
        logger.error('Google OAuth callback: No user found');
        const frontendOrigin = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:3000';
        return res.redirect(`${frontendOrigin}/auth/login?error=oauth_failed`);
      }

      const user = req.user;
      
      // Generate JWT tokens for the authenticated user
      const tokenPair = jwtManager.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token in database
      await database.getClient().refreshToken.create({
        data: {
          token: tokenPair.refreshToken,
          userId: user.id,
          expiresAt: jwtManager.getTokenExpiration(tokenPair.refreshToken),
        },
      });

      logger.info('Google OAuth successful:', { userId: user.id, email: user.email });

      // Redirect to frontend with tokens (for development)
      // In production, you might want to handle this differently
      const frontendOrigin = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:3000';
      const redirectUrl = new URL(`${frontendOrigin}/auth/oauth/success`);
      redirectUrl.searchParams.append('accessToken', tokenPair.accessToken);
      redirectUrl.searchParams.append('refreshToken', tokenPair.refreshToken);
      
      res.redirect(redirectUrl.toString());
      
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      const frontendOrigin = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:3000';
      res.redirect(`${frontendOrigin}/auth/login?error=oauth_callback_failed`);
    }
  }

  /**
   * Verify Google OAuth token from frontend
   */
  async verifyGoogleToken(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new ValidationError('Google token is required');
      }

      // You can use Google's OAuth library to verify the token
      // For now, we'll assume the token is valid and extract user info
      // In production, you should verify the token with Google's API

      logger.info('Google token verification - feature to be implemented');
      
      res.json({
        message: 'Google token verification endpoint',
        note: 'This endpoint can be used for client-side OAuth flow'
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google OAuth failure
   */
  async googleAuthFailure(req, res) {
    logger.error('Google OAuth authentication failed');
    const frontendOrigin = process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:3000';
    res.redirect(`${frontendOrigin}/auth/login?error=oauth_denied`);
  }

  /**
   * Request password reset
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      const prisma = database.getClient();
      
      // Find user by email - but don't reveal if email exists (security)
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      });
      
      // Always respond with success to prevent email enumeration
      // But only send email if user exists and is active
      if (user && user.status === 'ACTIVE') {
        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        
        // Store hashed token and expiry in database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordResetToken: hashedToken,
            passwordResetExpiry: resetExpiry,
          },
        });
        
        // Send reset email with unhashed token
        const emailResult = await sendPasswordResetEmail(
          user.email,
          `${user.firstName} ${user.lastName}`.trim() || user.email,
          resetToken
        );
        
        if (!emailResult.success) {
          logger.warn('Failed to send password reset email:', emailResult.error);
        }
        
        logger.info('Password reset requested:', { 
          userId: user.id, 
          email: user.email,
          emailSent: emailResult.success 
        });
      } else {
        logger.info('Password reset requested for non-existent or inactive user:', { email });
      }
      
      // Always return success response
      res.json({
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      
      const prisma = database.getClient();
      
      // Hash the provided token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Find user with matching token and valid expiry
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpiry: {
            gt: new Date(), // Token not expired
          },
          status: 'ACTIVE',
        },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });
      
      if (!user) {
        throw new ValidationError('Invalid or expired reset token');
      }
      
      // Validate new password strength
      const passwordValidation = passwordManager.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError('New password does not meet requirements', passwordValidation.errors);
      }
      
      // Check if new password is the same as current password
      const isSamePassword = await passwordManager.comparePassword(newPassword, user.password);
      if (isSamePassword) {
        throw new ValidationError('New password must be different from current password');
      }
      
      // Hash new password
      const hashedNewPassword = await passwordManager.hashPassword(newPassword);
      
      // Update password and clear reset token fields
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      });
      
      // Invalidate all existing refresh tokens (force re-login on all devices)
      await prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      });
      
      logger.info('Password reset completed:', { userId: user.id, email: user.email });
      
      res.json({
        message: 'Password has been reset successfully. Please login with your new password.',
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();