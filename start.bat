@echo off
echo ========================================
echo   Car Rental System - Starting Servers
echo ========================================
echo.

echo Starting Backend on port 5000...
start "Car Rental Backend" cmd /c "cd /d %~dp0backend && node src/index.js"

echo Starting Frontend on port 3000...
start "Car Rental Frontend" cmd /c "cd /d %~dp0backend\frontend && npx vite --port 3000"

echo.
echo ========================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul
