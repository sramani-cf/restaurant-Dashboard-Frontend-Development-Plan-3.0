const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);
router.use(authorizeRestaurant);

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Get dashboard analytics - Coming soon', restaurantId: req.params.restaurantId });
});

router.get('/sales', (req, res) => {
  res.json({ message: 'Get sales analytics - Coming soon', restaurantId: req.params.restaurantId });
});

module.exports = router;