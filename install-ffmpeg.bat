@echo off
title Install FFmpeg
color 0A

echo.
echo ========================================
echo   FFMPEG INSTALLATION HELPER
echo ========================================
echo.

REM Check if ffmpeg is already installed
ffmpeg -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ FFmpeg is already installed!
    echo.
    ffmpeg -version | findstr "version"
    echo.
    echo You're all set!
    pause
    exit /b 0
)

echo FFmpeg is not installed.
echo.
echo Choose installation method:
echo.
echo [1] Install using Chocolatey (if installed)
echo [2] Install using Winget (Windows 10/11)
echo [3] Manual installation instructions
echo [4] Skip (app will work without video conversion)
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" goto chocolatey
if "%choice%"=="2" goto winget
if "%choice%"=="3" goto manual
if "%choice%"=="4" goto skip

:chocolatey
echo.
echo Installing FFmpeg using Chocolatey...
choco install ffmpeg -y
if %errorlevel% equ 0 (
    echo ✅ FFmpeg installed successfully!
) else (
    echo ❌ Chocolatey not found or installation failed.
    echo Try method 2 or 3.
)
pause
exit /b 0

:winget
echo.
echo Installing FFmpeg using Winget...
winget install ffmpeg
if %errorlevel% equ 0 (
    echo ✅ FFmpeg installed successfully!
) else (
    echo ❌ Winget not found or installation failed.
    echo Try method 3.
)
pause
exit /b 0

:manual
echo.
echo ========================================
echo   MANUAL INSTALLATION STEPS
echo ========================================
echo.
echo 1. Download FFmpeg from:
echo    https://www.gyan.dev/ffmpeg/builds/
echo.
echo 2. Download: ffmpeg-release-essentials.zip
echo.
echo 3. Extract to: C:\ffmpeg
echo.
echo 4. Add to PATH:
echo    - Open System Properties (Win + Pause)
echo    - Advanced system settings
echo    - Environment Variables
echo    - Edit "Path" under System variables
echo    - Add: C:\ffmpeg\bin
echo    - Click OK
echo.
echo 5. Restart this terminal and run:
echo    ffmpeg -version
echo.
echo Opening download page in browser...
timeout /t 2 /nobreak >nul
start https://www.gyan.dev/ffmpeg/builds/
echo.
pause
exit /b 0

:skip
echo.
echo ⚠️  Skipping FFmpeg installation.
echo.
echo The app will still work, but:
echo - Videos may not play in browser
echo - Users will need to download videos
echo - Videos will play in VLC/Media Player
echo.
echo You can install FFmpeg later to enable
echo browser video playback.
echo.
pause
exit /b 0
