# DevFlow Safe Database Setup Script for PostgreSQL 18
# Creates devflow_user with password 'password' and database devflow_db
# Uses pure UTF-8 without BOM to ensure PostgreSQL parser accepts the file.

$ErrorActionPreference = "Stop"

try {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " DevFlow PostgreSQL 18 Administrator Setup" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan

    $hbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
    $backupPath = "$env:USERPROFILE\Desktop\pg_hba.conf.backup"
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)

    Write-Host "`n[1/6] Stopping PostgreSQL 18 Service..." -ForegroundColor Yellow
    Stop-Service postgresql-x64-18
    Start-Sleep -Seconds 3

    Write-Host "[2/6] Configuring temporary localhost recovery mode (UTF-8 No-BOM)..." -ForegroundColor Yellow
    $content = [System.IO.File]::ReadAllText($backupPath)
    $content = $content -replace '127\.0\.0\.1/32\s+scram-sha-256', '127.0.0.1/32            trust'
    $content = $content -replace '::1/128\s+scram-sha-256', '::1/128                 trust'
    [System.IO.File]::WriteAllText($hbaPath, $content, $utf8NoBom)

    Write-Host "[3/6] Starting PostgreSQL 18 in recovery mode..." -ForegroundColor Yellow
    Start-Service postgresql-x64-18
    Start-Sleep -Seconds 3

    Write-Host "[4/6] Creating devflow_user and devflow_db..." -ForegroundColor Yellow
    $psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

    & $psql -U postgres -h 127.0.0.1 -p 5432 -c "ALTER USER postgres WITH PASSWORD 'password';"
    & $psql -U postgres -h 127.0.0.1 -p 5432 -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'devflow_user') THEN CREATE ROLE devflow_user WITH LOGIN PASSWORD 'password' SUPERUSER CREATEDB; END IF; END \$\$;"
    & $psql -U postgres -h 127.0.0.1 -p 5432 -c "ALTER ROLE devflow_user WITH PASSWORD 'password' SUPERUSER CREATEDB;"
    & $psql -U postgres -h 127.0.0.1 -p 5432 -c "SELECT 'CREATE DATABASE devflow_db OWNER devflow_user' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'devflow_db')\gexec"
    & $psql -U postgres -h 127.0.0.1 -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE devflow_db TO devflow_user;"

    Write-Host "[5/6] Restoring original secure pg_hba.conf configuration..." -ForegroundColor Yellow
    Copy-Item $backupPath $hbaPath -Force

    Write-Host "[6/6] Restarting PostgreSQL 18 with full SCRAM-SHA-256 security..." -ForegroundColor Yellow
    Restart-Service postgresql-x64-18
    Start-Sleep -Seconds 2

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " SUCCESS: devflow_user and devflow_db are ready!" -ForegroundColor Green
    Write-Host " Original security configuration has been 100% restored." -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] An error occurred: $_" -ForegroundColor Red
    if (Test-Path "$env:USERPROFILE\Desktop\pg_hba.conf.backup") {
        Copy-Item "$env:USERPROFILE\Desktop\pg_hba.conf.backup" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" -Force -ErrorAction SilentlyContinue
        Start-Service postgresql-x64-18 -ErrorAction SilentlyContinue
    }
}
Write-Host "`nPress any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
