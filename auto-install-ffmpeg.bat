@echo off
title Auto-Install FFmpeg
color 0A

echo.
echo ========================================
echo   AUTO-INSTALLING FFMPEG
echo ========================================
echo.

REM Check if ffmpeg is already installed
ffmpeg -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ FFmpeg is already installed!
    ffmpeg -version | findstr "version"
    pause
    exit /b 0
)

echo [1/4] Checking for Winget...
winget --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Winget found! Installing FFmpeg...
    winget install --id Gyan.FFmpeg -e --silent
    if %errorlevel% equ 0 (
        echo.
        echo ✅ FFmpeg installed successfully!
        echo.
        echo Please close and reopen your terminal, then run:
        echo    ffmpeg -version
        echo.
        pause
        exit /b 0
    )
)

echo [2/4] Checking for Chocolatey...
choco --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Chocolatey found! Installing FFmpeg...
    choco install ffmpeg -y
    if %errorlevel% equ 0 (
        echo.
        echo ✅ FFmpeg installed successfully!
        echo.
        pause
        exit /b 0
    )
)

echo [3/4] Downloading FFmpeg manually...
echo.

REM Create temp directory
set TEMP_DIR=%TEMP%\ffmpeg_install
mkdir "%TEMP_DIR%" 2>nul

REM Download using PowerShell
echo Downloading FFmpeg (this may take a minute)...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile '%TEMP_DIR%\ffmpeg.zip'}"

if not exist "%TEMP_DIR%\ffmpeg.zip" (
    echo ❌ Download failed!
    echo.
    echo Please install manually:
    echo 1. Go to: https://www.gyan.dev/ffmpeg/builds/
    echo 2. Download: ffmpeg-release-essentials.zip
    echo 3. Extract to C:\ffmpeg
    echo 4. Add C:\ffmpeg\bin to PATH
    pause
    exit /b 1
)

echo [4/4] Installing FFmpeg...

REM Extract
echo Extracting...
powershell -Command "Expand-Archive -Path '%TEMP_DIR%\ffmpeg.zip' -DestinationPath '%TEMP_DIR%' -Force"

REM Find the extracted folder
for /d %%i in ("%TEMP_DIR%\ffmpeg-*") do set FFMPEG_FOLDER=%%i

REM Move to C:\ffmpeg
if exist "C:\ffmpeg" (
    echo Removing old installation...
    rmdir /s /q "C:\ffmpeg"
)

echo Moving to C:\ffmpeg...
move "%FFMPEG_FOLDER%" "C:\ffmpeg"

REM Add to PATH
echo Adding to PATH...
setx PATH "%PATH%;C:\ffmpeg\bin" /M >nul 2>&1
if %errorlevel% neq 0 (
    REM Try user PATH if system PATH fails
    setx PATH "%PATH%;C:\ffmpeg\bin" >nul 2>&1
)

REM Cleanup
echo Cleaning up...
rmdir /s /q "%TEMP_DIR%"

echo.
echo ========================================
echo   ✅ INSTALLATION COMPLETE!
echo ========================================
echo.
echo FFmpeg has been installed to: C:\ffmpeg
echo.
echo ⚠️  IMPORTANT: You must restart your terminal!
echo.
echo After restarting, verify with:
echo    ffmpeg -version
echo.
echo Then restart your backend server:
echo    cd server
echo    node server.js
echo.
pause
