# Restaurant Dashboard Backend API

A comprehensive restaurant management system backend built with Node.js, Express.js, Prisma, and PostgreSQL. This API provides complete functionality for managing restaurants, orders, reservations, inventory, staff, and real-time operations.

## 🚀 Features

### Core Features
- **User Management & Authentication** - JWT-based auth with refresh tokens, role-based access control
- **Restaurant Management** - Multi-restaurant support with staff assignments
- **Table Management** - Interactive floor plans with real-time table status
- **Menu Management** - Categories, items, pricing, and menu engineering analytics
- **Order Processing** - Full order lifecycle with kitchen display integration
- **Reservation System** - Advanced booking management with conflict prevention
- **Customer Management** - Customer profiles, loyalty programs, and visit history
- **Inventory Management** - Stock tracking, supplier management, and automated alerts
- **Staff Management** - Employee profiles, scheduling, and role assignments
- **Analytics & Reporting** - Comprehensive business intelligence and insights

### Advanced Features
- **Real-time Updates** - WebSocket integration for live kitchen displays and order updates
- **Security Hardening** - Rate limiting, CORS, helmet, and comprehensive validation
- **File Uploads** - Cloudinary integration for menu item images and documents
- **Caching System** - Redis integration for performance optimization
- **API Documentation** - Complete Swagger/OpenAPI documentation
- **Error Handling** - Comprehensive error handling with detailed logging
- **Database Migrations** - Prisma-managed database schema and migrations

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Caching**: Redis
- **File Storage**: Cloudinary
- **Real-time**: Socket.IO
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 13+ database
- Redis server (optional, for caching)
- npm or yarn package manager

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd Backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_dashboard"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key"

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🔐 Demo Accounts

After seeding the database, you can use these demo accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Super Admin | admin@restaurantdashboard.com | Admin123!@# | Full system access |
| Manager | manager@aura-restaurant.com | Manager123! | Restaurant management |
| Chef | chef@aura-restaurant.com | Staff123! | Kitchen operations |
| Server | server1@aura-restaurant.com | Staff123! | Service operations |

## 📖 API Documentation

### Interactive Documentation
When running in development mode, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

### API Endpoints Overview

| Module | Base Route | Description |
|--------|------------|-------------|
| Authentication | `/api/v1/auth` | User authentication and profile management |
| Users | `/api/v1/users` | User management (admin only) |
| Restaurants | `/api/v1/restaurants` | Restaurant operations |
| Tables | `/api/v1/restaurants/:id/tables` | Table and floor plan management |
| Menu | `/api/v1/restaurants/:id/menu` | Menu items and categories |
| Orders | `/api/v1/restaurants/:id/orders` | Order processing |
| Reservations | `/api/v1/restaurants/:id/reservations` | Reservation management |
| Customers | `/api/v1/restaurants/:id/customers` | Customer management |
| Inventory | `/api/v1/restaurants/:id/inventory` | Inventory and suppliers |
| Analytics | `/api/v1/restaurants/:id/analytics` | Reports and analytics |

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

#### Login Example

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@aura-restaurant.com",
    "password": "Manager123!"
  }'
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run dev:debug    # Start with debugging enabled

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (development)
npm run db:migrate   # Create and apply migrations
npm run db:seed      # Seed database with demo data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database and apply migrations

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier

# Testing
npm test             # Run tests in watch mode
npm run test:ci      # Run tests for CI

# Production
npm start            # Start production server
npm run build        # Build for production
```

### Database Schema

The system uses a comprehensive database schema with 15+ interconnected models:

- **User Management**: Users, RefreshTokens, RestaurantStaff
- **Restaurant Operations**: Restaurants, Tables, Categories, MenuItems
- **Order Management**: Orders, OrderItems
- **Reservations**: Reservations with table assignments
- **Customer Relations**: Customers, LoyaltyPoints
- **Inventory**: InventoryItems, Suppliers, PurchaseOrders
- **Analytics**: RestaurantAnalytics
- **System**: Notifications, SystemLogs

### Real-time Features

The API includes WebSocket support for real-time updates:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for order updates
socket.on('order-status-changed', (data) => {
  console.log('Order updated:', data);
});

// Join restaurant room
socket.emit('join-restaurant', { 
  restaurantId: 'restaurant-uuid' 
});
```

## 🛡 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Rate Limiting** with Redis backend
- **Request Validation** using Joi schemas
- **Security Headers** via Helmet
- **CORS Protection** with configurable origins
- **SQL Injection Protection** via Prisma ORM
- **Password Security** with bcrypt hashing

## 📊 Performance & Monitoring

### Health Checks

Monitor API health at `/health`:

```bash
curl http://localhost:5000/health
```

Response includes database and Redis connectivity status.

### Logging

Structured logging with Winston:
- Development: Console output with colors
- Production: File-based logging with rotation

### Caching

Redis integration for:
- Session management
- Rate limiting
- Application caching

## 🚀 Deployment

### Environment Variables

Production environment variables:

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-host:5432/db"
JWT_SECRET="production-jwt-secret"
REDIS_URL="redis://prod-redis:6379"
```

### Docker Support

Build and run with Docker:

```bash
docker build -t restaurant-api .
docker run -p 5000:5000 restaurant-api
```

### Database Migrations

For production deployments:

```bash
npm run db:migrate:prod
```

## 🧪 Testing

Run the test suite:

```bash
npm test          # Interactive mode
npm run test:ci   # CI mode with coverage
```

Tests include:
- Unit tests for utilities and services
- Integration tests for API endpoints
- Authentication flow tests
- Database operation tests

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint:fix`
6. Commit changes: `git commit -am 'Add feature'`
7. Push to branch: `git push origin feature-name`
8. Submit a pull request

### Code Style

- Follow ESLint and Prettier configurations
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL is running
   sudo systemctl status postgresql
   
   # Verify connection string in .env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

2. **Redis Connection Warning**
   - Redis is optional; the API will work without it
   - Install Redis: `sudo apt install redis-server` (Ubuntu)

3. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

4. **Prisma Issues**
   ```bash
   # Reset Prisma
   npx prisma generate
   npx prisma db push --force-reset
   npm run db:seed
   ```

### Database Issues

```bash
# Reset database completely
npm run db:reset

# Check database schema
npm run db:studio
```

## 📞 Support

For issues and questions:

1. Check the [API Documentation](http://localhost:5000/api-docs)
2. Review the troubleshooting section
3. Check existing GitHub issues
4. Create a new issue with details

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🔮 Roadmap

Future enhancements planned:
- [ ] Multi-language support
- [ ] Advanced reporting dashboards
- [ ] Integration with POS systems
- [ ] Mobile app API extensions
- [ ] Machine learning for demand forecasting
- [ ] Advanced loyalty program features
- [ ] Integration with delivery platforms

---

Built with ❤️ for the restaurant industry