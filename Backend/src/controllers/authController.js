const database = require('../config/database');
const logger = require('../config/logger');
const redis = require('../config/redis');
const jwtManager = require('../utils/jwt');
const passwordManager = require('../utils/password');
const { AuthenticationError, ValidationError, ConflictError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

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
      
      // Create user
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
          createdAt: true,
        },
      });
      
      // Generate tokens
      const tokenPair = jwtManager.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
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
      
      logger.info('User registered successfully:', { userId: user.id, email: user.email });
      
      res.status(201).json({
        message: 'User registered successfully',
        user,
        tokens: tokenPair,
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
}

module.exports = new AuthController();