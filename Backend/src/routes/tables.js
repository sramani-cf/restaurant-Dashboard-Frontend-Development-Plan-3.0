const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// All table routes require authentication and restaurant access
router.use(authenticate);
router.use(authorizeRestaurant);

/**
 * @swagger
 * /restaurants/{restaurantId}/tables:
 *   get:
 *     summary: Get all tables for a restaurant
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', (req, res) => {
  res.json({ message: 'Get restaurant tables - Coming soon', restaurantId: req.params.restaurantId });
});

/**
 * @swagger
 * /restaurants/{restaurantId}/tables:
 *   post:
 *     summary: Create a new table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', (req, res) => {
  res.json({ message: 'Create table - Coming soon', restaurantId: req.params.restaurantId });
});

module.exports = router;