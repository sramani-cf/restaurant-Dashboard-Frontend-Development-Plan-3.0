/**
 * Basic structure and configuration tests
 */

describe('Backend Structure Tests', () => {
  test('should load main configuration without errors', () => {
    const config = require('../src/config');
    
    expect(config).toBeDefined();
    expect(config.port).toBe(5000);
    expect(config.apiVersion).toBe('v1');
    expect(config.nodeEnv).toBeDefined();
  });

  test('should load database configuration', () => {
    const database = require('../src/config/database');
    
    expect(database).toBeDefined();
    expect(typeof database.connect).toBe('function');
    expect(typeof database.disconnect).toBe('function');
    expect(typeof database.healthCheck).toBe('function');
  });

  test('should load JWT utilities', () => {
    const jwt = require('../src/utils/jwt');
    
    expect(jwt).toBeDefined();
    expect(typeof jwt.generateAccessToken).toBe('function');
    expect(typeof jwt.generateRefreshToken).toBe('function');
    expect(typeof jwt.verifyAccessToken).toBe('function');
    expect(typeof jwt.verifyRefreshToken).toBe('function');
  });

  test('should load password utilities', () => {
    const password = require('../src/utils/password');
    
    expect(password).toBeDefined();
    expect(typeof password.hashPassword).toBe('function');
    expect(typeof password.comparePassword).toBe('function');
    expect(typeof password.validatePasswordStrength).toBe('function');
  });

  test('should load authentication middleware', () => {
    const auth = require('../src/middleware/auth');
    
    expect(auth).toBeDefined();
    expect(typeof auth.authenticate).toBe('function');
    expect(typeof auth.authorize).toBe('function');
    expect(typeof auth.authorizeRestaurant).toBe('function');
  });

  test('should load Express app without errors', () => {
    const app = require('../src/app');
    
    expect(app).toBeDefined();
    expect(typeof app).toBe('function'); // Express app is a function
  });
});

describe('Environment Configuration', () => {
  test('should have required environment variables set', () => {
    // These should be set from .env file
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
  });
});