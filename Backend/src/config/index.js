require('dotenv').config();

const config = {
  // Server Configuration
  port: parseInt(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true,
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ],
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME,
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET,
  },

  // WebSocket Configuration
  websocket: {
    corsOrigin: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
    port: parseInt(process.env.WEBSOCKET_PORT) || 3002,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE,
  },
};

// Validate required configuration
const requiredConfig = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL',
];

const missingConfig = requiredConfig.filter(key => !process.env[key]);

if (missingConfig.length > 0) {
  console.error('Missing required environment variables:', missingConfig);
  process.exit(1);
}

// Environment-specific configurations
if (config.nodeEnv === 'production') {
  // Production-specific settings
  config.logging.level = 'warn';
} else if (config.nodeEnv === 'test') {
  // Test-specific settings
  config.logging.level = 'error';
  config.database.url = process.env.TEST_DATABASE_URL || config.database.url;
}

module.exports = config;