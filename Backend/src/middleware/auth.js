const jwtManager = require('../utils/jwt');
const database = require('../config/database');
const logger = require('../config/logger');
const redis = require('../config/redis');

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authorization header provided',
      });
    }

    const token = jwtManager.extractTokenFromHeader(authHeader);
    
    // Check if token is blacklisted (logout/revoked tokens)
    try {
      const isBlacklisted = await redis.exists(`blacklist:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          error: 'Token revoked',
          message: 'This token has been revoked',
        });
      }
    } catch (redisError) {
      logger.warn('Redis check failed for token blacklist:', redisError);
      // Continue without Redis check if Redis is unavailable
    }

    // Verify token
    const decoded = jwtManager.verifyAccessToken(token);
    
    // Fetch user data from database
    const prisma = database.getClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isEmailVerified: true,
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
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        error: 'Account inactive',
        message: 'Your account has been deactivated',
      });
    }

    // Add user info to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Access token expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please refresh your token.',
      });
    }
    
    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid',
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Unable to authenticate request',
    });
  }
};

/**
 * Authorization middleware to check user roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource',
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${userRole}`);
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Restaurant-specific authorization middleware
 */
const authorizeRestaurant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to access this resource',
    });
  }

  const restaurantId = req.params.restaurantId || req.body.restaurantId;
  
  if (!restaurantId) {
    return res.status(400).json({
      error: 'Restaurant ID required',
      message: 'Restaurant ID must be provided',
    });
  }

  // Super admins can access any restaurant
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Check if user has access to this restaurant
  const hasAccess = req.user.restaurantStaff?.some(
    staff => staff.restaurantId === restaurantId && staff.isActive
  );

  if (!hasAccess) {
    logger.warn(`Unauthorized restaurant access attempt by user ${req.user.id} for restaurant ${restaurantId}`);
    return res.status(403).json({
      error: 'Restaurant access denied',
      message: 'You do not have access to this restaurant',
    });
  }

  // Add restaurant info to request
  const restaurantStaff = req.user.restaurantStaff.find(
    staff => staff.restaurantId === restaurantId
  );
  req.restaurantAccess = restaurantStaff;

  next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(); // Continue without authentication
    }

    const token = jwtManager.extractTokenFromHeader(authHeader);
    const decoded = jwtManager.verifyAccessToken(token);
    
    const prisma = database.getClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Log error but continue without authentication
    logger.debug('Optional authentication failed:', error.message);
    next();
  }
};

/**
 * Rate limiting by user ID
 */
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(); // Skip rate limiting if not authenticated
    }

    try {
      const key = `rate_limit:${req.user.id}`;
      const current = await redis.get(key) || 0;
      
      if (current >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }
      
      await redis.set(key, current + 1, Math.ceil(windowMs / 1000));
      next();
    } catch (error) {
      logger.warn('Rate limiting error:', error);
      next(); // Continue if Redis is unavailable
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeRestaurant,
  optionalAuthenticate,
  rateLimitByUser,
};