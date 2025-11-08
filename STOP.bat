@echo off
title Stop Workout Analysis App
color 0C

echo.
echo ========================================
echo   STOPPING WORKOUT ANALYSIS APP
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ All servers stopped successfully!
) else (
    echo ℹ️  No running servers found.
)

echo.
echo ========================================
echo   CLEANUP COMPLETE
echo ========================================
echo.
pause
