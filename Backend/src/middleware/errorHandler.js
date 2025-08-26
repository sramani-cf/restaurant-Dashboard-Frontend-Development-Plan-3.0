const logger = require('../config/logger');
const config = require('../config');

/**
 * Custom error classes
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, false);
  }
}

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      return new ConflictError(`${field} already exists`);
      
    case 'P2014':
      // Invalid ID
      return new ValidationError('Invalid ID provided');
      
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError('Referenced resource does not exist');
      
    case 'P2025':
      // Record not found
      return new NotFoundError('Record not found');
      
    case 'P2011':
      // Null constraint violation
      const nullField = error.meta?.target || 'Required field';
      return new ValidationError(`${nullField} cannot be null`);
      
    case 'P2012':
      // Missing required value
      return new ValidationError('Missing required value');
      
    case 'P2013':
      // Missing argument
      return new ValidationError('Missing required argument');
      
    case 'P2015':
      // Related record not found
      return new NotFoundError('Related record not found');
      
    case 'P2016':
      // Query interpretation error
      return new ValidationError('Invalid query parameters');
      
    case 'P2017':
      // Records for relation are not connected
      return new ValidationError('Related records not properly connected');
      
    case 'P1001':
      // Database unreachable
      return new DatabaseError('Database connection failed');
      
    case 'P1002':
      // Database timeout
      return new DatabaseError('Database operation timed out');
      
    default:
      logger.error('Unhandled Prisma error:', { code: error.code, message: error.message });
      return new DatabaseError('Database operation failed');
  }
};

/**
 * Handle JSON Web Token errors
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Token not active');
  }
  return new AuthenticationError('Authentication failed');
};

/**
 * Handle Multer errors (file upload)
 */
const handleMulterError = (error) => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new ValidationError('File too large');
    case 'LIMIT_FILE_COUNT':
      return new ValidationError('Too many files');
    case 'LIMIT_FIELD_KEY':
      return new ValidationError('Field name too long');
    case 'LIMIT_FIELD_VALUE':
      return new ValidationError('Field value too long');
    case 'LIMIT_FIELD_COUNT':
      return new ValidationError('Too many fields');
    case 'LIMIT_UNEXPECTED_FILE':
      return new ValidationError('Unexpected file');
    default:
      return new ValidationError('File upload failed');
  }
};

/**
 * Log error details
 */
const logError = (error, req) => {
  const errorDetails = {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    userId: req?.user?.id,
    timestamp: new Date().toISOString(),
  };

  if (error.statusCode >= 500) {
    logger.error('Server Error:', errorDetails);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error:', errorDetails);
  } else {
    logger.info('Request Error:', errorDetails);
  }
};

/**
 * Send error response
 */
const sendErrorResponse = (res, error) => {
  const response = {
    error: error.name || 'Error',
    message: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
  };

  // Add additional details for validation errors
  if (error instanceof ValidationError && error.details) {
    response.details = error.details;
  }

  // Add stack trace in development
  if (config.nodeEnv === 'development' && error.stack) {
    response.stack = error.stack;
  }

  // Add request ID if available
  if (res.locals.requestId) {
    response.requestId = res.locals.requestId;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * Main error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  let processedError = error;

  // Convert non-AppError instances to AppError
  if (!(error instanceof AppError)) {
    // Handle specific error types
    if (error.code && error.code.startsWith('P')) {
      // Prisma error
      processedError = handlePrismaError(error);
    } else if (error.name && error.name.includes('JWT')) {
      // JWT error
      processedError = handleJWTError(error);
    } else if (error.code && error.code.startsWith('LIMIT_')) {
      // Multer error
      processedError = handleMulterError(error);
    } else if (error.name === 'ValidationError') {
      // Mongoose/Joi validation error
      processedError = new ValidationError(error.message);
    } else if (error.name === 'CastError') {
      // MongoDB ObjectId cast error
      processedError = new ValidationError('Invalid ID format');
    } else if (error.name === 'SyntaxError' && error.type === 'entity.parse.failed') {
      // JSON parse error
      processedError = new ValidationError('Invalid JSON format');
    } else {
      // Generic server error
      processedError = new AppError('Internal server error', 500, false);
    }
  }

  // Log the error
  logError(processedError, req);

  // Send response
  sendErrorResponse(res, processedError);
};

/**
 * Handle 404 errors (no route found)
 */
const notFoundHandler = (req, res) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  logError(error, req);
  sendErrorResponse(res, error);
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (error) => {
  logger.fatal('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  process.exit(1);
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (reason, promise) => {
  logger.fatal('Unhandled Promise Rejection:', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString(),
  });
  
  process.exit(1);
};

// Set up global error handlers
process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  
  // Error handlers
  errorHandler,
  notFoundHandler,
  handlePrismaError,
  handleJWTError,
  handleMulterError,
  
  // Utilities
  logError,
  sendErrorResponse,
};