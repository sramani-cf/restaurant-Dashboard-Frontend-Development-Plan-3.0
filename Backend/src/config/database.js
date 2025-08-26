const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      errorFormat: 'colorless',
    });

    // Set up event listeners for logging
    this.prisma.$on('error', (e) => {
      logger.error('Prisma Error:', e);
    });

    this.prisma.$on('warn', (e) => {
      logger.warn('Prisma Warning:', e);
    });

    this.prisma.$on('info', (e) => {
      logger.info('Prisma Info:', e);
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        logger.debug(`Query: ${e.query}`, {
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });
    }
  }

  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
      return true;
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  getClient() {
    return this.prisma;
  }
}

module.exports = new Database();