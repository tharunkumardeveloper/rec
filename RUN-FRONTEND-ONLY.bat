@echo off
title Workout Analysis App (Browser Mode)
color 0A

echo.
echo ========================================
echo   WORKOUT ANALYSIS APP
echo   Browser-Only Mode (No Backend)
echo ========================================
echo.

echo Starting Frontend...
start "Frontend - Port 8080" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✅ APP STARTED!
echo ========================================
echo.
echo 🌐 Frontend:  http://localhost:8080
echo.
echo ⚡ Running in BROWSER MODE:
echo    - Processing happens in your browser
echo    - No backend server needed
echo    - Works offline
echo    - Faster and lighter
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul

start http://localhost:8080

echo.
echo ✅ Done! You can close this window.
echo.
pause
