@echo off
REM TalentTrack Face Verification System Startup Script (Windows)

echo.
echo Starting TalentTrack Face Verification System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
cd server
pip install -r requirements.txt
cd ..

REM Install Node dependencies
echo Installing Node.js dependencies...
cd server
call npm install
cd ..

REM Start DeepFace service
echo.
echo Starting DeepFace service on port 5000...
start "DeepFace Service" cmd /k "cd server && python deepface_service.py"

REM Wait for DeepFace to start
timeout /t 5 /nobreak >nul

REM Start Node.js backend
echo Starting Node.js backend on port 3001...
start "Backend API" cmd /k "cd server && node server.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo All services started!
echo.
echo Services running:
echo    - DeepFace API: http://localhost:5000
echo    - Backend API: http://localhost:3001
echo    - Frontend: http://localhost:5173
echo.
echo Close the terminal windows to stop services
echo.
pause
