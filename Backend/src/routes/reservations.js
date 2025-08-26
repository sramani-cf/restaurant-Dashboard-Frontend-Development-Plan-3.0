const express = require('express');
const { authenticate, authorizeRestaurant } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);
router.use(authorizeRestaurant);

router.get('/', (req, res) => {
  res.json({ message: 'Get reservations - Coming soon', restaurantId: req.params.restaurantId });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create reservation - Coming soon', restaurantId: req.params.restaurantId });
});

module.exports = router;