@echo off
REM Zenith - Automated Setup Script for Windows
REM This script installs dependencies and starts the app

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   ZENITH - Personal Life OS Setup
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo   https://nodejs.org (download the LTS version)
    echo.
    echo After installing Node.js, run this script again.
    echo.
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js found: !NODE_VERSION!
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo Please reinstall Node.js
    pause
    exit /b 1
)

echo ✓ npm is installed
echo.

REM Install dependencies
echo Installing dependencies... this may take a minute
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Dependencies installed successfully!
echo.

REM Start the app
echo Starting Zenith...
echo.
call npm start

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start Zenith
    echo.
    pause
    exit /b 1
)

pause
