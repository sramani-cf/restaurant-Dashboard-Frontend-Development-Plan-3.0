# Backend Project Structure

```
Backend/
├── server.js                          # Main entry point
├── package.json                       # Dependencies and scripts
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── .eslintrc.json                     # ESLint configuration
├── .prettierrc                        # Prettier configuration
├── .gitignore                         # Git ignore rules
├── README.md                          # Project documentation
├── STRUCTURE.md                       # This file
│
├── src/                               # Source code
│   ├── app.js                         # Express application setup
│   │
│   ├── config/                        # Configuration files
│   │   ├── index.js                   # Main configuration
│   │   ├── database.js                # Database connection
│   │   ├── redis.js                   # Redis connection
│   │   ├── logger.js                  # Winston logger setup
│   │   └── swagger.js                 # API documentation config
│   │
│   ├── controllers/                   # Request handlers
│   │   └── authController.js          # Authentication logic
│   │
│   ├── middleware/                    # Express middleware
│   │   ├── auth.js                    # Authentication middleware
│   │   ├── errorHandler.js            # Error handling
│   │   ├── security.js                # Security middleware
│   │   └── validation.js              # Input validation
│   │
│   ├── routes/                        # API route definitions
│   │   ├── auth.js                    # Authentication routes
│   │   ├── users.js                   # User management
│   │   ├── restaurants.js             # Restaurant operations
│   │   ├── tables.js                  # Table management
│   │   ├── menu.js                    # Menu operations
│   │   ├── orders.js                  # Order processing
│   │   ├── reservations.js            # Reservation management
│   │   ├── customers.js               # Customer management
│   │   ├── inventory.js               # Inventory operations
│   │   ├── analytics.js               # Analytics and reports
│   │   └── health.js                  # Health check endpoints
│   │
│   ├── services/                      # Business logic services
│   │   └── socketHandler.js           # WebSocket management
│   │
│   ├── utils/                         # Utility functions
│   │   ├── jwt.js                     # JWT token management
│   │   └── password.js                # Password utilities
│   │
│   └── models/                        # Data models (if needed)
│
├── prisma/                            # Database schema and migrations
│   ├── schema.prisma                  # Database schema
│   └── seed.js                        # Database seeding
│
├── tests/                             # Test files
│   ├── unit/                          # Unit tests
│   └── integration/                   # Integration tests
│
├── logs/                              # Application logs (created at runtime)
│
├── public/                            # Static files
│   └── uploads/                       # File uploads
│
├── uploads/                           # Alternative upload directory
│
└── node_modules/                      # Dependencies (auto-generated)
```

## Key Points

### Entry Point
- **Main entry**: `server.js` (root level)
- **Port**: 5000 (configurable via PORT environment variable)

### Source Organization
- **src/**: All source code
- **Clear separation**: Config, routes, controllers, middleware, services, utils
- **Modular structure**: Each feature has its own route and controller files

### Configuration
- **Environment**: `.env` for local, `.env.example` for template
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (optional)
- **Documentation**: Swagger/OpenAPI

### Development
- **Start**: `npm run dev` (uses nodemon for hot reload)
- **Production**: `npm start`
- **Database**: `npm run db:seed` to populate with demo data
- **Tests**: `npm test`

### API Structure
- **Base URL**: `http://localhost:5000/api/v1`
- **Documentation**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

This structure follows Node.js best practices with clear separation of concerns, scalable architecture, and maintainable code organization.