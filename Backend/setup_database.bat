@echo off
echo =====================================
echo PostgreSQL Database Setup Script
echo =====================================
echo.
echo This script will create:
echo - User: restaurant_user
echo - Database: restaurant_dashboard_db
echo - Test Database: restaurant_dashboard_test_db
echo.
echo You will need to enter the postgres superuser password.
echo.
pause

set PGPATH="C:\Program Files\PostgreSQL\17\bin"
set HOST=localhost
set PORT=5433

echo Creating user restaurant_user...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "CREATE USER restaurant_user WITH PASSWORD 'Avalon@1001';"

echo Creating database restaurant_dashboard_db...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "CREATE DATABASE restaurant_dashboard_db OWNER restaurant_user;"

echo Creating test database restaurant_dashboard_test_db...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "CREATE DATABASE restaurant_dashboard_test_db OWNER restaurant_user;"

echo Granting privileges...
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO restaurant_user;"
%PGPATH%\psql.exe -h %HOST% -p %PORT% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO restaurant_user;"

echo.
echo =====================================
echo Database setup complete!
echo =====================================
pause