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

const config = {
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
  win: {
    target: ['nsis'],
    certificateFile: process.env.WIN_CERT_FILE || null,
    certificatePassword: process.env.WIN_CERT_PASSWORD || null
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Zenith'
  },
  mac: {
    target: ['dmg', 'zip'],
    category: 'public.app-category.productivity',
    hardenedRuntime: true,
    gatekeeperAssess: false
  },
  dmg: {
    contents: [
      { x: 110, y: 150, type: 'file' },
      { x: 240, y: 150, type: 'link', path: '/Applications' }
    ]
  },
  linux: {
    target: ['AppImage', 'deb'],
    category: 'Utility'
  },
  publish: {
    provider: 'github',
    owner: process.env.GITHUB_OWNER || 'your-github-username',
    repo: process.env.GITHUB_REPO || 'zenith'
  }
};

const targets = {
  win: ['nsis'],
  mac: ['dmg', 'zip'],
  linux: ['AppImage', 'deb']
};

async function buildApp() {
  try {
    console.log(`🚀 Building Zenith for ${platform === 'all' ? 'all platforms' : platform}...`);
    
    if (platform === 'all') {
      // Build for all platforms
      await build({
        ...config,
        win: { target: targets.win },
        mac: { target: targets.mac },
        linux: { target: targets.linux }
      });
    } else if (['win', 'mac', 'linux'].includes(platform)) {
      // Build for specific platform
      const buildConfig = { ...config };
      buildConfig.win = { target: targets[platform] };
      buildConfig.mac = { target: targets[platform] };
      buildConfig.linux = { target: targets[platform] };
      
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
