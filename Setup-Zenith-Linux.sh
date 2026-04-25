#!/bin/bash

# Zenith - Download and Setup Script for macOS/Linux
# This script downloads Zenith from GitHub and sets it up

echo ""
echo "============================================"
echo "  ZENITH - Download and Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo ""
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please download and install Node.js from:"
    echo "  https://nodejs.org (download the LTS version)"
    echo ""
    echo "After installing Node.js, run this script again."
    echo ""
    exit 1
fi

# Get Node.js version
NODE_VERSION=$(node --version)
echo "✓ Node.js found: $NODE_VERSION"
echo ""

# Check if curl or wget is available
if command -v curl &> /dev/null; then
    DOWNLOADER="curl"
elif command -v wget &> /dev/null; then
    DOWNLOADER="wget"
else
    echo "ERROR: Neither curl nor wget is installed!"
    echo "Please install one of them and try again."
    exit 1
fi

echo "✓ Download tool found: $DOWNLOADER"
echo ""

# Create temporary directory for download
TEMP_DIR=$(mktemp -d)
ZENITH_ZIP="$TEMP_DIR/zenith.zip"

echo "Downloading Zenith from GitHub..."
echo ""

# Download the latest release using GitHub API
if [ "$DOWNLOADER" = "curl" ]; then
    curl -L -o "$ZENITH_ZIP" https://api.github.com/repos/Zenith-Tech-Create/Zenith/releases/latest \
        -H "Accept: application/vnd.github.v3+json" \
        --follow-location --max-redirs 5
    
    # Get the actual download URL from the JSON response
    DOWNLOAD_URL=$(curl -s https://api.github.com/repos/Zenith-Tech-Create/Zenith/releases/latest \
        -H "Accept: application/vnd.github.v3+json" | grep '"zipball_url"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$DOWNLOAD_URL" ]; then
        echo "ERROR: Could not find download URL"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    curl -L -o "$ZENITH_ZIP" "$DOWNLOAD_URL"
else
    # Using wget
    DOWNLOAD_URL=$(wget -q -O - https://api.github.com/repos/Zenith-Tech-Create/Zenith/releases/latest \
        -H "Accept: application/vnd.github.v3+json" | grep '"zipball_url"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$DOWNLOAD_URL" ]; then
        echo "ERROR: Could not find download URL"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    wget -O "$ZENITH_ZIP" "$DOWNLOAD_URL"
fi

if [ ! -f "$ZENITH_ZIP" ]; then
    echo ""
    echo "ERROR: Failed to download Zenith from GitHub"
    echo ""
    echo "Make sure you have an internet connection and try again."
    echo ""
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✓ Downloaded successfully!"
echo ""

# Extract the zip file
echo "Extracting files..."
echo ""

if ! unzip -q "$ZENITH_ZIP" -d "$TEMP_DIR"; then
    echo ""
    echo "ERROR: Failed to extract files"
    echo ""
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✓ Extracted successfully!"
echo ""

# Find the extracted folder (GitHub creates a folder with repo-commit hash)
ZENITH_FOLDER=$(find "$TEMP_DIR" -maxdepth 1 -type d ! -name "$TEMP_DIR" | head -1)

if [ -z "$ZENITH_FOLDER" ]; then
    echo "ERROR: Could not find extracted Zenith folder"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Navigate to the folder and install dependencies
cd "$ZENITH_FOLDER" || exit 1

echo "Installing dependencies... this may take a minute"
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to install dependencies"
    echo ""
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo ""
echo "✓ Dependencies installed successfully!"
echo ""

# Start the app
echo "Starting Zenith..."
echo ""

npm start

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to start Zenith"
    echo ""
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Cleanup temp directory after app closes
rm -rf "$TEMP_DIR"
