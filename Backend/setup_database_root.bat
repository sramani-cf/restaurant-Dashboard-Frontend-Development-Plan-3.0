@echo off
echo =====================================
echo PostgreSQL Database Setup Script
echo =====================================
echo.
echo This script will create:
echo - User: root (with password: Avalon@1001)
echo - Database: restaurant_dashboard_db
echo - Test Database: restaurant_dashboard_test_db
echo.
echo You will need to enter the postgres superuser password.
echo.
pause

set PGPATH="C:\Program Files\PostgreSQL\17\bin"
set HOST=localhost
set PORT=5433

echo.
echo Step 1: Creating user 'root' with password 'Avalon@1001'...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "CREATE USER root WITH PASSWORD 'Avalon@1001';"

echo.
echo Step 2: Creating database 'restaurant_dashboard_db'...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "CREATE DATABASE restaurant_dashboard_db OWNER root;"

echo.
echo Step 3: Creating test database 'restaurant_dashboard_test_db'...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "CREATE DATABASE restaurant_dashboard_test_db OWNER root;"

echo.
echo Step 4: Granting all privileges...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO root;"
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO root;"

echo.
echo =====================================
echo Database setup complete!
echo You can now run: npm run dev
echo =====================================
pause