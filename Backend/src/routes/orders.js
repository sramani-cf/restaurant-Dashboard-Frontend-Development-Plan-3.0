const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const orderController = require('../controllers/orderController');
const {
  createOrderSchema,
  updateOrderSchema,
  getOrdersQuerySchema,
  orderAnalyticsQuerySchema,
  orderParamsSchema
} = require('../schemas/orderSchemas');

const router = express.Router({ mergeParams: true });

// Apply authentication and authorization middleware
router.use(authenticate);
router.use(authorizeRestaurant);

// Get all orders with filtering and pagination
router.get('/', 
  validate(getOrdersQuerySchema, 'query'),
  orderController.getOrders
);

// Create a new order
router.post('/', 
  validate(createOrderSchema, 'body'),
  orderController.createOrder
);

// Get order analytics
router.get('/analytics', 
  validate(orderAnalyticsQuerySchema, 'query'),
  orderController.getOrderAnalytics
);

// Get specific order
router.get('/:id', 
  validate(orderParamsSchema, 'params'),
  orderController.getOrder
);

// Update specific order
router.patch('/:id', 
  validate(orderParamsSchema, 'params'),
  validate(updateOrderSchema, 'body'),
  orderController.updateOrder
);

module.exports = router;