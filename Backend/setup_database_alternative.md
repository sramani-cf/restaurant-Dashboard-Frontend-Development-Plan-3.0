# Alternative Database Setup Methods

## Method 1: Using pgAdmin (Easiest)
1. Open pgAdmin
2. Connect to PostgreSQL server on localhost:5433
3. Right-click on "Login/Group Roles" → Create → Login/Group Role
4. General tab: Name = `restaurant_user`
5. Definition tab: Password = `Avalon@1001`
6. Privileges tab: Check "Can login"
7. Click Save

Then create databases:
1. Right-click on "Databases" → Create → Database
2. Database name: `restaurant_dashboard_db`
3. Owner: `restaurant_user`
4. Click Save
5. Repeat for `restaurant_dashboard_test_db`

## Method 2: Using the batch file
Run the provided `setup_database.bat` file and enter the postgres password when prompted.

## Method 3: Manual SQL Commands
If you know the postgres password, run these commands one by one:
```sql
-- Connect to PostgreSQL first (you'll need the postgres password)
psql -h localhost -p 5433 -U postgres

-- Then run these SQL commands:
CREATE USER restaurant_user WITH PASSWORD 'Avalon@1001';
CREATE DATABASE restaurant_dashboard_db OWNER restaurant_user;
CREATE DATABASE restaurant_dashboard_test_db OWNER restaurant_user;
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO restaurant_user;
GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO restaurant_user;
\q
```

## Method 4: Try default passwords
Common default postgres passwords:
- postgres
- password
- admin
- Password123
- (blank/no password)

## Verification
After setup, test with:
```bash
cd Backend
npm run dev
```