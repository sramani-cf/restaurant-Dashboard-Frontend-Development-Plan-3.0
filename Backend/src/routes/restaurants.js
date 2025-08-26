const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All restaurant routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', (req, res) => {
  res.json({ message: 'Get all restaurants - Coming soon' });
});

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'), (req, res) => {
  res.json({ message: 'Create restaurant - Coming soon' });
});

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', (req, res) => {
  res.json({ message: 'Get restaurant by ID - Coming soon' });
});

module.exports = router;