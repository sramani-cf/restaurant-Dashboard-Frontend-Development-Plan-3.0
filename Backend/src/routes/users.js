const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (Admin only)
router.get('/', authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'), (req, res) => {
  res.json({
    message: 'User management endpoint',
    data: {
      users: [],
      totalUsers: 0,
      activeUsers: 0
    },
    note: 'User management will be implemented in a future release'
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  res.json({
    message: 'Get user details endpoint',
    userId: req.params.id,
    note: 'User management will be implemented in a future release'
  });
});

module.exports = router;