#!/bin/bash

# Zenith - Automated Setup Script for macOS/Linux
# This script installs dependencies and starts the app

echo ""
echo "============================================"
echo "  ZENITH - Personal Life OS Setup"
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

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo "Please reinstall Node.js"
    exit 1
fi

echo "✓ npm is installed"
echo ""

# Install dependencies
echo "Installing dependencies... this may take a minute"
echo ""
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to install dependencies"
    echo ""
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
    exit 1
fi
