const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const customerController = require('../controllers/customerController');
const {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomersQuerySchema,
  customerAnalyticsQuerySchema,
  customerParamsSchema
} = require('../schemas/customerSchemas');

const router = express.Router({ mergeParams: true });

// Apply authentication and authorization middleware
router.use(authenticate);
router.use(authorizeRestaurant);

// Get all customers with filtering and pagination
router.get('/', 
  validate(getCustomersQuerySchema, 'query'),
  customerController.getCustomers
);

// Create a new customer
router.post('/', 
  validate(createCustomerSchema, 'body'),
  customerController.createCustomer
);

// Get customer analytics
router.get('/analytics', 
  validate(customerAnalyticsQuerySchema, 'query'),
  customerController.getCustomerAnalytics
);

// Get specific customer
router.get('/:id', 
  validate(customerParamsSchema, 'params'),
  customerController.getCustomer
);

// Update specific customer
router.patch('/:id', 
  validate(customerParamsSchema, 'params'),
  validate(updateCustomerSchema, 'body'),
  customerController.updateCustomer
);

module.exports = router;