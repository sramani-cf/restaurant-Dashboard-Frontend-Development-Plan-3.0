const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const restaurantController = require('../controllers/restaurantController');
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdSchema
} = require('../schemas/restaurantSchemas');

const router = express.Router();

// All restaurant routes require authentication
router.use(authenticate);

// Get all restaurants user has access to
router.get('/', restaurantController.getRestaurants);

// Create a new restaurant (admin only)
router.post('/', 
  authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'),
  validate(createRestaurantSchema, 'body'),
  restaurantController.createRestaurant
);

// Get specific restaurant
router.get('/:id', 
  validate(restaurantIdSchema, 'params'),
  restaurantController.getRestaurant
);

// Update restaurant (owner only)
router.patch('/:id', 
  validate(restaurantIdSchema, 'params'),
  validate(updateRestaurantSchema, 'body'),
  restaurantController.updateRestaurant
);

module.exports = router;