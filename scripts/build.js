#!/usr/bin/env node

/**
 * Build script for Zenith
 * Creates installers for Windows, macOS, and Linux
 * 
 * Usage:
 *   npm run build           (build all platforms)
 *   npm run build:win       (Windows only)
 *   npm run build:mac       (macOS only)
 *   npm run build:linux     (Linux only)
 */

const { build } = require('electron-builder');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const platform = args[0] || 'all';

const baseConfig = {
  appId: 'com.zenith.app',
  productName: 'Zenith',
  directories: {
    output: 'dist',
    buildResources: 'assets'
  },
  files: [
    'main.js',
    'preload.js',
    'src/**/*',
    'node_modules/**/*',
    'package.json'
  ],
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Zenith'
  },
  dmg: {
    contents: [
      { x: 110, y: 150, type: 'file' },
      { x: 240, y: 150, type: 'link', path: '/Applications' }
    ]
  }
};

const config = baseConfig;

const targets = {
  win: ['nsis'],
  mac: ['dmg', 'zip'],
  linux: ['AppImage', 'deb']
};

async function buildApp() {
  try {
    console.log(`🚀 Building Zenith for ${platform === 'all' ? 'all platforms' : platform}...`);
    
    let buildConfig = { ...baseConfig };
    
    if (platform === 'all') {
      // Build for all platforms
      buildConfig.win = { target: ['nsis'] };
      buildConfig.mac = { target: ['dmg', 'zip'] };
      buildConfig.linux = { target: ['AppImage', 'deb'] };
      await build(buildConfig);
    } else if (platform === 'mac') {
      // Build for macOS only
      buildConfig.mac = {
        target: ['dmg', 'zip'],
        icon: 'assets/electron.icns',
        category: 'public.app-category.productivity',
        hardenedRuntime: true,
        gatekeeperAssess: false
      };
      await build(buildConfig);
    } else if (platform === 'win') {
      // Build for Windows only
      buildConfig.win = {
        target: ['nsis'],
        certificateFile: process.env.WIN_CERT_FILE || null,
        certificatePassword: process.env.WIN_CERT_PASSWORD || null
      };
      await build(buildConfig);
    } else if (platform === 'linux') {
      // Build for Linux only
      buildConfig.linux = { target: ['AppImage', 'deb'] };
      await build(buildConfig);
    } else {
      console.error(`❌ Unknown platform: ${platform}`);
      console.error('Supported platforms: all, win, mac, linux');
      process.exit(1);
    }

    console.log('✅ Build completed successfully!');
    console.log('📦 Installers are in the dist/ directory');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildApp();
