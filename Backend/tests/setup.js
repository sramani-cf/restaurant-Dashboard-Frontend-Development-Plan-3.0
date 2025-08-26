/**
 * Jest test setup file
 * This file runs before each test suite
 */

// Load environment variables for testing
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

// Mock external services during testing
jest.mock('../src/config/redis', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  getClient: jest.fn().mockReturnValue({
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
  }),
}));

// Global test timeout
jest.setTimeout(30000);

// Global test hooks
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});

// Suppress console.log during tests (except for test output)
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    // Suppress info, warn, debug logs during tests
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    // Keep error logs for debugging
    error: console.error,
  };
}