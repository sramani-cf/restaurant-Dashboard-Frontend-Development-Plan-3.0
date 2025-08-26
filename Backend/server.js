require('dotenv').config();

const http = require('http');
const socketIo = require('socket.io');

const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/config/logger');
const database = require('./src/config/database');
const redis = require('./src/config/redis');
const socketHandler = require('./src/services/socketHandler');

/**
 * Initialize the server and all connections
 */
async function initializeServer() {
  try {
    logger.info('Starting Restaurant Dashboard API server...');
    
    // Connect to database
    logger.info('Connecting to database...');
    await database.connect();
    
    // Connect to Redis (optional - continue if fails)
    try {
      logger.info('Connecting to Redis...');
      await redis.connect();
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without Redis:', redisError.message);
    }
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Setup Socket.IO for real-time features
    const io = socketIo(server, {
      cors: {
        origin: config.websocket.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    
    // Initialize socket handlers
    socketHandler.initialize(io);
    
    // Start server
    const port = config.port;
    server.listen(port, () => {
      logger.info(`Server started successfully on port ${port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`API Base URL: http://localhost:${port}/api/${config.apiVersion}`);
      
      if (config.nodeEnv === 'development') {
        logger.info(`API Documentation: http://localhost:${port}/api-docs`);
        logger.info(`Health Check: http://localhost:${port}/health`);
      }
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
      
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Close HTTP server
        server.close(() => {
          logger.info('HTTP server closed');
        });
        
        // Close Socket.IO server
        io.close(() => {
          logger.info('Socket.IO server closed');
        });
        
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
    
    return server;
    
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Health check endpoint for process managers
process.on('message', (message) => {
  if (message === 'shutdown') {
    process.emit('SIGTERM');
  }
});

// Initialize server if this file is run directly
if (require.main === module) {
  initializeServer().catch((error) => {
    logger.error('Server initialization failed:', error);
    process.exit(1);
  });
}

module.exports = { initializeServer };