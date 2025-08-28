const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');

// Import configurations and utilities
const config = require('./config');
const logger = require('./config/logger');
const database = require('./config/database');
const redis = require('./config/redis');
const { passport } = require('./config/passport');

// Import middleware
const security = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { handleValidationErrors } = require('./middleware/validation');
const { authenticate } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const restaurantRoutes = require('./routes/restaurants');
const tableRoutes = require('./routes/tables');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const reservationRoutes = require('./routes/reservations');
const customerRoutes = require('./routes/customers');
const inventoryRoutes = require('./routes/inventory');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');

// Import controllers for direct use
const customerController = require('./controllers/customerController');

// Create Express application
const app = express();

// Trust proxy if behind reverse proxy (Nginx, etc.)
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware - applied first
app.use(security.securityHeaders);
app.use(security.requestId);
app.use(security.ipFilter);
app.use(security.securityLogger);

// Compression middleware
app.use(security.compressionMiddleware);

// CORS middleware
app.use(security.cors);

// Request parsing middleware
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: ['application/json', 'application/json; charset=utf-8']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 50,
}));

// Request size limiting
app.use(security.requestSizeLimit);

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting middleware
app.use(security.generalRateLimit);
app.use(security.speedLimit);

// Static files serving
app.use('/static', express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  etag: true,
  index: false,
}));

// Health check routes (no rate limiting)
app.use('/health', healthRoutes);

// API routes
const apiRouter = express.Router();

// Authentication routes with stricter rate limiting
apiRouter.use('/auth', security.authRateLimit, authRoutes);

// Protected API routes
apiRouter.use('/users', userRoutes);
apiRouter.use('/restaurants', restaurantRoutes);

// Development middleware for bypassing authentication in dev mode
const createDevAuthMiddleware = (mockRole = 'SUPER_ADMIN') => {
  return config.nodeEnv === 'development' ? 
    (req, res, next) => {
      // In development, try authentication first, but fallback to mock user if no auth
      if (!req.headers.authorization) {
        req.user = {
          id: 'dev-user',
          role: mockRole,
          restaurantStaff: mockRole === 'STAFF' ? [{ 
            restaurantId: 'dev-restaurant', 
            isActive: true,
            role: 'MANAGER'
          }] : []
        };
        return next();
      }
      // If auth header exists, use normal authentication
      authenticate(req, res, next);
    } : authenticate;
};

// Global customer search route (for multi-restaurant searches)
apiRouter.get('/customers/search', createDevAuthMiddleware(), customerController.globalSearchCustomers);

apiRouter.use('/restaurants/:restaurantId/tables', tableRoutes);
apiRouter.use('/restaurants/:restaurantId/menu', menuRoutes);
apiRouter.use('/restaurants/:restaurantId/orders', orderRoutes);
apiRouter.use('/restaurants/:restaurantId/reservations', reservationRoutes);
apiRouter.use('/restaurants/:restaurantId/customers', customerRoutes);
apiRouter.use('/restaurants/:restaurantId/inventory', inventoryRoutes);
apiRouter.use('/restaurants/:restaurantId/analytics', analyticsRoutes);

// Mount API router
app.use(`/api/${config.apiVersion}`, apiRouter);

// Swagger documentation route
if (config.nodeEnv === 'development') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Restaurant Dashboard API Documentation',
  }));
}

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Restaurant Dashboard API',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    documentation: config.nodeEnv === 'development' ? '/api-docs' : null,
  });
});

// Validation error handler
app.use(handleValidationErrors);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await database.disconnect();
    logger.info('Database connection closed');
    
    // Close Redis connection
    await redis.disconnect();
    logger.info('Redis connection closed');
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

module.exports = app;