# CLAUDE.md - Project Configuration & Important Notes

## PostgreSQL Configuration ⚠️ CRITICAL
- **Port**: 5433 (NOT 5432 or 5434)
- **Host**: localhost
- **Database**: restaurant_dashboard_db
- **User**: root
- **Password**: Avalon@1001

## PostgreSQL Services
- PostgreSQL 17 (postgresql-x64-17): RUNNING on port 5433
- PostgreSQL 13 (postgresql-x64-13): RUNNING

## Database Setup Requirements
Before running the application, ensure:
1. PostgreSQL is running on port 5433
2. User 'root' exists with password 'Avalon@1001'
3. Database 'restaurant_dashboard_db' exists (owned by root)
4. Database 'restaurant_dashboard_test_db' exists (owned by root)

## Quick Diagnostic Commands
```bash
# Check PostgreSQL port
netstat -an | findstr LISTENING | findstr ":543"

# Check service status
sc query postgresql-x64-17

# Test database connection
cd Backend && npx prisma db push
```

## Common Issues & Solutions
1. **Socket not connected error**: Wrong port - verify with netstat
2. **Authentication failed**: User doesn't exist - run setup_db.sql
3. **Can't reach database**: Service not running - start PostgreSQL service

## Development Commands
```bash
# Start backend
cd Backend && npm run dev

# Run Prisma migrations
cd Backend && npx prisma migrate dev

# Generate Prisma client
cd Backend && npx prisma generate
```

## File Locations
- Database setup script: Backend/setup_db.sql
- Environment config: Backend/.env
- Investigation docs: postgresql-connection-fix/

## Last Updated
2025-08-27 - Fixed PostgreSQL port configuration (5434 → 5433)