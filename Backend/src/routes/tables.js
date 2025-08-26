const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const tableController = require('../controllers/tableController');
const {
  createTableSchema,
  updateTableSchema,
  getTablesQuerySchema,
  tableParamsSchema
} = require('../schemas/tableSchemas');

const router = express.Router({ mergeParams: true });

// All table routes require authentication and restaurant access
router.use(authenticate);
router.use(authorizeRestaurant);

// Get all tables for restaurant
router.get('/', 
  validate(getTablesQuerySchema, 'query'),
  tableController.getTables
);

// Create a new table
router.post('/', 
  validate(createTableSchema, 'body'),
  tableController.createTable
);

// Get table layout for floor plan
router.get('/layout', 
  tableController.getTableLayout
);

// Get specific table
router.get('/:id', 
  validate(tableParamsSchema, 'params'),
  tableController.getTable
);

// Update specific table
router.patch('/:id', 
  validate(tableParamsSchema, 'params'),
  validate(updateTableSchema, 'body'),
  tableController.updateTable
);

// Delete/deactivate table
router.delete('/:id', 
  validate(tableParamsSchema, 'params'),
  tableController.deleteTable
);

module.exports = router;