const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const cors = require('cors');
const compression = require('compression');
const config = require('../config');
const logger = require('../config/logger');
const redis = require('../config/redis');

/**
 * CORS configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.cors.origin;
    
    // Check if origin is allowed
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
};

/**
 * Rate limiting store using Redis
 */
const createRedisStore = () => {
  try {
    // Check if Redis is connected before creating store
    if (!redis.isConnected) {
      logger.warn('Redis store not available for rate limiting, using memory store');
      return undefined; // Will use default memory store
    }
    
    const RedisStore = require('rate-limit-redis');
    const client = redis.getClient();
    
    return new RedisStore({
      client: client,
      prefix: 'rate-limit:',
    });
  } catch (error) {
    logger.warn('Redis store not available for rate limiting, using memory store:', error);
    return undefined; // Will use default memory store
  }
};

/**
 * General rate limiting
 */
const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  store: createRedisStore(),
  skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/health' || req.path.startsWith('/static');
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit reached:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    });
    res.status(options.statusCode || 429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

/**
 * Strict rate limiting for authentication endpoints
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per window
  store: createRedisStore(),
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts. Please try again later.',
    retryAfter: 900, // 15 minutes
  },
  handler: (req, res, next, options) => {
    logger.warn('Authentication rate limit reached:', {
      ip: req.ip,
      path: req.path,
      email: req.body?.email,
      userAgent: req.get('User-Agent'),
    });
    res.status(options.statusCode || 429).json({
      error: 'Too many authentication attempts',
      message: 'Too many login attempts. Please try again later.',
      retryAfter: 900,
    });
  },
});

/**
 * Speed limiting - slow down responses after threshold
 */
const speedLimit = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window at full speed
  delayMs: () => 500, // Add 500ms delay per request after threshold
  maxDelayMs: 10000, // Maximum delay of 10 seconds
  store: createRedisStore(),
});

/**
 * Request size limiting
 */
const requestSizeLimit = (req, res, next) => {
  const maxSize = config.upload.maxFileSize;
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: `Request size exceeds maximum allowed size of ${maxSize} bytes`,
    });
  }
  
  next();
};

/**
 * IP whitelist/blacklist middleware
 */
const ipFilter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // In production, you might want to implement IP blacklisting
  const blacklistedIPs = process.env.BLACKLISTED_IPS?.split(',') || [];
  
  if (blacklistedIPs.includes(clientIp)) {
    logger.warn(`Blocked request from blacklisted IP: ${clientIp}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked',
    });
  }
  
  next();
};

/**
 * Request ID middleware for tracking
 */
const requestId = (req, res, next) => {
  const { v4: uuidv4 } = require('uuid');
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Security headers with Helmet
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  hidePoweredBy: true,
});

/**
 * Compression middleware
 */
const compressionMiddleware = compression({
  level: 6,
  threshold: 1024, // Only compress if >= 1KB
  filter: (req, res) => {
    // Don't compress if the request includes a Cache-Control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    
    // Use compression filter function
    return compression.filter(req, res);
  },
});

/**
 * API key authentication middleware
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'X-API-Key header is required for this endpoint',
    });
  }
  
  // In production, verify against a secure store
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key used:', {
      apiKey: apiKey.substring(0, 8) + '...',
      ip: req.ip,
      path: req.path,
    });
    
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
    });
  }
  
  next();
};

/**
 * Request logging for security monitoring
 */
const securityLogger = (req, res, next) => {
  // Log potentially suspicious requests
  const suspiciousPatterns = [
    /\.\.\//,           // Directory traversal
    /<script/i,         // XSS attempts
    /union.*select/i,   // SQL injection
    /exec\(/i,          // Code execution
    /eval\(/i,          // Code evaluation
  ];
  
  const url = req.originalUrl || req.url;
  const body = req.body ? JSON.stringify(req.body).substring(0, 1000) : '';
  const query = req.query ? JSON.stringify(req.query) : '';
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body) || pattern.test(query)
  );
  
  if (isSuspicious) {
    logger.warn('Suspicious request detected:', {
      ip: req.ip,
      method: req.method,
      url: url,
      userAgent: req.get('User-Agent'),
      body: body.substring(0, 200),
      query: query,
      headers: req.headers,
    });
  }
  
  next();
};

module.exports = {
  cors: cors(corsOptions),
  generalRateLimit,
  authRateLimit,
  speedLimit,
  requestSizeLimit,
  ipFilter,
  requestId,
  securityHeaders,
  compressionMiddleware,
  apiKeyAuth,
  securityLogger,
};