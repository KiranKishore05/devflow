@echo off
echo ========================================================
echo  DevFlow PostgreSQL 18 Administrator Setup
echo ========================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup-db.ps1"
echo.
pause
