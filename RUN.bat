@echo off
title Workout Analysis App
color 0A

echo.
echo ========================================
echo   STARTING WORKOUT ANALYSIS APP
echo ========================================
echo.

REM Start backend server in new window
echo Starting Backend Server (Port 3001)...
start "Backend Server - Port 3001" cmd /k "cd server && node server.js"

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend (Port 8080)...
start "Frontend - Port 8080" cmd /k "npm run dev"

REM Wait a bit
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ✅ APP STARTED!
echo ========================================
echo.
echo 🌐 Frontend:  http://localhost:8080
echo 🔧 Backend:   http://localhost:3001
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul

REM Open browser
start http://localhost:8080

echo.
echo ✅ Done! You can close this window.
echo    The servers are running in separate windows.
echo.
pause
