const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);
router.use(authorizeRestaurant);

// Get all inventory items
router.get('/', (req, res) => {
  res.json({
    message: 'Inventory management endpoint',
    restaurantId: req.params.restaurantId,
    data: {
      items: [],
      lowStockItems: [],
      totalValue: 0
    },
    note: 'Inventory management will be implemented in a future release'
  });
});

// Create new inventory item
router.post('/', (req, res) => {
  res.json({
    message: 'Create inventory item endpoint',
    restaurantId: req.params.restaurantId,
    note: 'Inventory management will be implemented in a future release'
  });
});

module.exports = router;