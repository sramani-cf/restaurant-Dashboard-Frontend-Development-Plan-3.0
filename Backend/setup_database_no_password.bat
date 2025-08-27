@echo off
echo =====================================
echo PostgreSQL Database Auto-Setup Script
echo NO PASSWORD REQUIRED
echo =====================================
echo.
echo This script will:
echo 1. Temporarily modify PostgreSQL to allow no-password access
echo 2. Create user 'root' with password 'Avalon@1001'
echo 3. Create databases
echo 4. Restore security settings
echo.
echo IMPORTANT: This script needs to run as Administrator!
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click on this file and select "Run as Administrator"
    pause
    exit /b 1
)

pause

set PGPATH=C:\Program Files\PostgreSQL\17
set PGDATA=%PGPATH%\data
set HOST=localhost
set PORT=5433

echo.
echo Step 1: Stopping PostgreSQL service...
net stop postgresql-x64-17

echo.
echo Step 2: Backing up pg_hba.conf...
copy "%PGDATA%\pg_hba.conf" "%PGDATA%\pg_hba.conf.backup" >nul

echo.
echo Step 3: Creating temporary pg_hba.conf with trust authentication...
echo # Temporary PostgreSQL Client Authentication Configuration > "%PGDATA%\pg_hba.conf"
echo # TYPE  DATABASE        USER            ADDRESS                 METHOD >> "%PGDATA%\pg_hba.conf"
echo local   all             all                                     trust >> "%PGDATA%\pg_hba.conf"
echo host    all             all             127.0.0.1/32            trust >> "%PGDATA%\pg_hba.conf"
echo host    all             all             ::1/128                 trust >> "%PGDATA%\pg_hba.conf"

echo.
echo Step 4: Starting PostgreSQL service...
net start postgresql-x64-17

:: Wait for service to fully start
timeout /t 3 /nobreak >nul

echo.
echo Step 5: Creating user and databases...
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "DROP USER IF EXISTS root;"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "CREATE USER root WITH PASSWORD 'Avalon@1001';"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "DROP DATABASE IF EXISTS restaurant_dashboard_db;"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "CREATE DATABASE restaurant_dashboard_db OWNER root;"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "DROP DATABASE IF EXISTS restaurant_dashboard_test_db;"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "CREATE DATABASE restaurant_dashboard_test_db OWNER root;"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO root;"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO root;"

echo.
echo Step 6: Verifying setup...
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "\du root"
"%PGPATH%\bin\psql.exe" -h %HOST% -p %PORT% -U postgres -c "\l restaurant_dashboard_db"

echo.
echo Step 7: Restoring original pg_hba.conf...
net stop postgresql-x64-17
copy "%PGDATA%\pg_hba.conf.backup" "%PGDATA%\pg_hba.conf" /Y >nul
del "%PGDATA%\pg_hba.conf.backup"

echo.
echo Step 8: Restarting PostgreSQL with original security...
net start postgresql-x64-17

echo.
echo =====================================
echo DATABASE SETUP COMPLETE!
echo =====================================
echo User: root
echo Password: Avalon@1001
echo Databases: restaurant_dashboard_db, restaurant_dashboard_test_db
echo.
echo You can now run: npm run dev
echo =====================================
pause