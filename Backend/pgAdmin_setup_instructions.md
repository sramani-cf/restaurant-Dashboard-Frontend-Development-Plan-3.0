# pgAdmin Setup Instructions (Using root user)

## Step-by-Step Guide

### 1. Open pgAdmin
- Launch pgAdmin from your Start menu or desktop

### 2. Connect to PostgreSQL Server
- In the left panel, expand "Servers"
- Right-click on your PostgreSQL server (or create a new connection)
- Connection details:
  - Host: localhost
  - Port: 5433
  - Username: postgres
  - Password: (your postgres password)

### 3. Create the 'root' User
1. Expand your server connection
2. Right-click on "Login/Group Roles"
3. Select "Create" → "Login/Group Role"
4. In the "General" tab:
   - Name: `root`
5. In the "Definition" tab:
   - Password: `Avalon@1001`
6. In the "Privileges" tab:
   - Can login?: Yes (checked)
   - Superuser?: No
   - Create roles?: No
   - Create databases?: Yes (optional)
7. Click "Save"

### 4. Create the Main Database
1. Right-click on "Databases"
2. Select "Create" → "Database"
3. In the "General" tab:
   - Database: `restaurant_dashboard_db`
   - Owner: `root` (select from dropdown)
4. Click "Save"

### 5. Create the Test Database
1. Right-click on "Databases" again
2. Select "Create" → "Database"
3. In the "General" tab:
   - Database: `restaurant_dashboard_test_db`
   - Owner: `root` (select from dropdown)
4. Click "Save"

### Alternative: Run SQL Directly
If you prefer, you can also:
1. Click on "Tools" → "Query Tool"
2. Paste and run this SQL:
```sql
CREATE USER root WITH PASSWORD 'Avalon@1001';
CREATE DATABASE restaurant_dashboard_db OWNER root;
CREATE DATABASE restaurant_dashboard_test_db OWNER root;
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO root;
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO root;
```

## Verification
After setup is complete, test your backend:
```bash
cd Backend
npm run dev
```

The server should start successfully without authentication errors!