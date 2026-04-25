@echo off
REM Zenith - Download and Setup Script for Windows
REM This script downloads Zenith from GitHub and sets it up

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   ZENITH - Download and Setup
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

REM Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is not available!
    pause
    exit /b 1
)

echo ✓ PowerShell found
echo.

REM Create temporary directory for download
set TEMP_DIR=%TEMP%\zenith_setup
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

echo Downloading Zenith from GitHub...
echo.

REM Use PowerShell to download the latest release
powershell -Command "^
  try {^
    $url = 'https://api.github.com/repos/Zenith-Tech-Create/Zenith/releases/latest'; ^
    $response = Invoke-RestMethod -Uri $url -Headers @{'Accept'='application/vnd.github.v3+json'}; ^
    $downloadUrl = $response.zipball_url; ^
    $outputFile = '%TEMP_DIR%\zenith.zip'; ^
    Write-Host \"Downloading from: $downloadUrl\"; ^
    Invoke-WebRequest -Uri $downloadUrl -OutFile $outputFile; ^
    Write-Host \"Downloaded successfully!\"; ^
  } catch {^
    Write-Host \"Error downloading: $_\"; ^
    exit 1; ^
  }^
"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to download Zenith from GitHub
    echo.
    echo Make sure you have an internet connection and try again.
    echo.
    pause
    exit /b 1
)

echo ✓ Downloaded successfully!
echo.

REM Extract the zip file using PowerShell
echo Extracting files...
echo.

powershell -Command "^
  try {^
    $zipPath = '%TEMP_DIR%\zenith.zip'; ^
    $extractPath = '%TEMP_DIR%'; ^
    [System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem') | Out-Null; ^
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $extractPath); ^
    Write-Host \"Extracted successfully!\"; ^
  } catch {^
    Write-Host \"Error extracting: $_\"; ^
    exit 1; ^
  }^
"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to extract files
    echo.
    pause
    exit /b 1
)

echo ✓ Extracted successfully!
echo.

REM Find the extracted folder (GitHub creates a folder with repo-commit hash)
for /d %%i in ("%TEMP_DIR%\*") do (
    if not "%%i"=="%TEMP_DIR%" (
        set ZENITH_FOLDER=%%i
    )
)

if not defined ZENITH_FOLDER (
    echo ERROR: Could not find extracted Zenith folder
    pause
    exit /b 1
)

echo Installing dependencies...
echo.

REM Navigate to the folder and install dependencies
cd /d "%ZENITH_FOLDER%"
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
