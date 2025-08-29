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

## Development Mode Notes ⚠️ IMPORTANT
- Backend runs in development mode with authentication bypass
- Auth middleware creates fake user 'dev-user' for development
- Profile endpoint includes special handling for dev-user
- Uses real restaurant ID: 5de5ec81-b1a4-4b30-bf05-981b7ba50176
- Dev user has SUPER_ADMIN role with access to all restaurants
- Frontend UserContext properly handles development mode responses

## File Locations
- Database setup script: Backend/setup_db.sql
- Environment config: Backend/.env
- Investigation docs: postgresql-connection-fix/
- Loading issue docs: loading-issue-investigation/

## Critical Next.js App Router Notes ⚠️
- **IMPORTANT**: When using Context Providers in `app/layout.js`, the layout MUST have `'use client'` directive
- Without `'use client'`, hooks like useEffect won't run and context initialization will fail
- This can cause infinite loading states where context values remain null
- Always ensure parent components of client contexts are marked as client components

## Last Updated
2025-08-29 - Added critical Next.js App Router client component requirements
2025-08-29 - Fixed spatial manager infinite loading issue (layout.js missing 'use client')
2025-08-29 - Added development mode authentication bypass documentation