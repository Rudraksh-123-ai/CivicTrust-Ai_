@echo off
echo ======================================================
echo   Starting CivicTrust AI frontend and backend...
echo ======================================================

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is required to run both services.
    pause
    exit /b 1
)

start "CivicTrust AI" cmd /k "cd /d ""%~dp0"" && npm run dev"
timeout /t 2 /nobreak >nul
start http://127.0.0.1:3000
