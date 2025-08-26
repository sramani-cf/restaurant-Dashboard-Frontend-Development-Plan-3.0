const express = require('express');
const database = require('../config/database');
const redis = require('../config/redis');
const config = require('../config');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                     redis:
 *                       type: object
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  
  // Check database health
  const dbHealth = await database.healthCheck();
  
  // Check Redis health
  let redisHealth;
  try {
    redisHealth = await redis.healthCheck();
  } catch (error) {
    redisHealth = {
      status: 'unavailable',
      error: error.message,
      timestamp,
    };
  }
  
  // Determine overall health status
  const isHealthy = dbHealth.status === 'healthy';
  const isDegraded = dbHealth.status === 'healthy' && redisHealth.status !== 'healthy';
  
  const healthStatus = {
    status: isHealthy ? (isDegraded ? 'degraded' : 'healthy') : 'unhealthy',
    timestamp,
    version: '1.0.0',
    environment: config.nodeEnv,
    uptime: Math.floor(uptime),
    dependencies: {
      database: dbHealth,
      redis: redisHealth,
    },
  };
  
  // Return appropriate status code
  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

/**
 * @swagger
 * /health/database:
 *   get:
 *     summary: Database health check
 *     description: Check the health status of the database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 *       503:
 *         description: Database is unhealthy
 */
router.get('/database', async (req, res) => {
  const dbHealth = await database.healthCheck();
  const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(dbHealth);
});

/**
 * @swagger
 * /health/redis:
 *   get:
 *     summary: Redis health check
 *     description: Check the health status of the Redis connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Redis is healthy
 *       503:
 *         description: Redis is unhealthy or unavailable
 */
router.get('/redis', async (req, res) => {
  try {
    const redisHealth = await redis.healthCheck();
    const statusCode = redisHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(redisHealth);
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check
 *     description: Check if the service is ready to receive traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check if essential services are available
    const dbHealth = await database.healthCheck();
    
    const isReady = dbHealth.status === 'healthy';
    
    if (isReady) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: 'Database is not healthy',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check
 *     description: Check if the service is alive (for Kubernetes liveness probe)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

module.exports = router;