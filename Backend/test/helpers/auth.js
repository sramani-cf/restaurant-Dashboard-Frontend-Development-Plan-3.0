const jwt = require('jsonwebtoken');

/**
 * Generate a test JWT token for authentication in tests
 * @param {Object} user - User object containing id and role
 * @returns {string} - JWT token
 */
function generateTestToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret-key');
}

/**
 * Generate test tokens for different user types
 */
const generateTestTokens = {
  admin: () => generateTestToken({
    id: 'test-admin-id',
    email: 'admin@test.com',
    role: 'SUPER_ADMIN'
  }),
  
  manager: () => generateTestToken({
    id: 'test-manager-id',
    email: 'manager@test.com',
    role: 'MANAGER'
  }),
  
  staff: () => generateTestToken({
    id: 'test-staff-id',
    email: 'staff@test.com',
    role: 'STAFF'
  }),
  
  user: () => generateTestToken({
    id: 'test-user-id',
    email: 'user@test.com',
    role: 'USER'
  })
};

/**
 * Mock authentication middleware for testing
 * @param {Object} user - User to authenticate as
 * @returns {Function} - Express middleware function
 */
function mockAuth(user) {
  return (req, res, next) => {
    req.user = user;
    next();
  };
}

/**
 * Create a mock restaurant authorization middleware
 * @param {string} restaurantId - Restaurant ID to authorize
 * @returns {Function} - Express middleware function
 */
function mockRestaurantAuth(restaurantId) {
  return (req, res, next) => {
    req.params.restaurantId = restaurantId;
    next();
  };
}

module.exports = {
  generateTestToken,
  generateTestTokens,
  mockAuth,
  mockRestaurantAuth
};