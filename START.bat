@echo off
title Workout Analysis App Launcher
color 0A

echo.
echo ========================================
echo   WORKOUT ANALYSIS APP LAUNCHER
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js found
echo.

REM Check if Python is installed
echo [2/3] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo ⚠️  WARNING: Python not found!
    echo.
    echo Python is required for backend processing.
    echo The app will work in browser-only mode.
    echo.
    echo To enable backend: Install Python from https://python.org
    echo Then run: pip install opencv-python mediapipe numpy pandas
    echo.
    timeout /t 5 /nobreak
) else (
    echo ✅ Python found
    
    REM Check Python packages
    python -c "import cv2, mediapipe, numpy, pandas" >nul 2>&1
    if %errorlevel% neq 0 (
        color 0E
        echo ⚠️  WARNING: Python packages missing!
        echo.
        echo Installing required packages...
        pip install opencv-python mediapipe numpy pandas
        echo.
    ) else (
        echo ✅ Python packages ready
    )
)
echo.

REM Install dependencies if needed
echo [3/3] Checking dependencies...

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    echo.
)

if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
    echo.
)

echo ✅ All dependencies ready
echo.
echo ========================================
echo   STARTING SERVERS...
echo ========================================
echo.

REM Start backend server in new window
echo Starting Backend Server (Port 3001)...
start "Backend Server - Port 3001" cmd /k "cd server && node server.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend (Port 8080)...
start "Frontend - Port 8080" cmd /k "npm run dev"

REM Wait a bit
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ✅ APP STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 🌐 Frontend:  http://localhost:8080
echo 🔧 Backend:   http://localhost:3001
echo.
echo 📝 Two windows have opened:
echo    1. Backend Server (keep running)
echo    2. Frontend Dev Server (keep running)
echo.
echo 🚀 Open your browser and go to:
echo    http://localhost:8080
echo.
echo ⚠️  To stop the app:
echo    Close both server windows or press Ctrl+C in each
echo.
echo ========================================
echo.
echo Press any key to open browser...
pause >nul

REM Open browser
start http://localhost:8080

echo.
echo Browser opened! Enjoy your workout analysis!
echo.
echo You can close this window now.
echo The servers will keep running in their own windows.
echo.
pause
