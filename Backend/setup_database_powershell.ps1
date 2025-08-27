# PostgreSQL Database Setup Script - No Password Required
# This script temporarily modifies PostgreSQL authentication to create the database

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Auto-Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check for admin rights
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.SecurityBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$pgPath = "C:\Program Files\PostgreSQL\17"
$pgData = "$pgPath\data"
$psqlPath = "$pgPath\bin\psql.exe"
$host = "localhost"
$port = "5433"

try {
    Write-Host "Step 1: Stopping PostgreSQL service..." -ForegroundColor Yellow
    Stop-Service -Name "postgresql-x64-17" -Force -ErrorAction Stop
    Start-Sleep -Seconds 2

    Write-Host "Step 2: Backing up pg_hba.conf..." -ForegroundColor Yellow
    Copy-Item "$pgData\pg_hba.conf" "$pgData\pg_hba.conf.backup" -Force

    Write-Host "Step 3: Creating temporary pg_hba.conf with trust authentication..." -ForegroundColor Yellow
    @"
# Temporary PostgreSQL Client Authentication Configuration
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
host    all             all             0.0.0.0/0               trust
"@ | Out-File -FilePath "$pgData\pg_hba.conf" -Encoding ASCII

    Write-Host "Step 4: Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service -Name "postgresql-x64-17"
    Start-Sleep -Seconds 5

    Write-Host "Step 5: Creating user and databases..." -ForegroundColor Yellow
    
    # Drop existing objects if they exist
    & $psqlPath -h $host -p $port -U postgres -c "DROP DATABASE IF EXISTS restaurant_dashboard_db;" 2>$null
    & $psqlPath -h $host -p $port -U postgres -c "DROP DATABASE IF EXISTS restaurant_dashboard_test_db;" 2>$null
    & $psqlPath -h $host -p $port -U postgres -c "DROP USER IF EXISTS root;" 2>$null
    
    # Create new user and databases
    & $psqlPath -h $host -p $port -U postgres -c "CREATE USER root WITH PASSWORD 'Avalon@1001';"
    & $psqlPath -h $host -p $port -U postgres -c "CREATE DATABASE restaurant_dashboard_db OWNER root;"
    & $psqlPath -h $host -p $port -U postgres -c "CREATE DATABASE restaurant_dashboard_test_db OWNER root;"
    & $psqlPath -h $host -p $port -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_db TO root;"
    & $psqlPath -h $host -p $port -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurant_dashboard_test_db TO root;"

    Write-Host "Step 6: Verifying setup..." -ForegroundColor Yellow
    & $psqlPath -h $host -p $port -U postgres -c "\du root"
    & $psqlPath -h $host -p $port -U postgres -c "\l restaurant_dashboard*"

    Write-Host "Step 7: Restoring original security settings..." -ForegroundColor Yellow
    Stop-Service -Name "postgresql-x64-17" -Force
    Start-Sleep -Seconds 2
    Copy-Item "$pgData\pg_hba.conf.backup" "$pgData\pg_hba.conf" -Force
    Remove-Item "$pgData\pg_hba.conf.backup"

    Write-Host "Step 8: Restarting PostgreSQL..." -ForegroundColor Yellow
    Start-Service -Name "postgresql-x64-17"
    Start-Sleep -Seconds 3

    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "DATABASE SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "User: root" -ForegroundColor Cyan
    Write-Host "Password: Avalon@1001" -ForegroundColor Cyan
    Write-Host "Databases: restaurant_dashboard_db, restaurant_dashboard_test_db" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now run: npm run dev" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to restore original config if something went wrong
    if (Test-Path "$pgData\pg_hba.conf.backup") {
        Write-Host "Restoring original configuration..." -ForegroundColor Yellow
        Stop-Service -Name "postgresql-x64-17" -Force -ErrorAction SilentlyContinue
        Copy-Item "$pgData\pg_hba.conf.backup" "$pgData\pg_hba.conf" -Force
        Remove-Item "$pgData\pg_hba.conf.backup"
        Start-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue
    }
}

Read-Host "Press Enter to exit"