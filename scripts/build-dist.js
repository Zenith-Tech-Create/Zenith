#!/usr/bin/env node

/**
 * Build script for Zenith - Production Distribution
 * Creates installers for macOS and Windows only
 */

const { build } = require('electron-builder');
const path = require('path');

async function buildForMacOS() {
  console.log('🏗️  Building Zenith for macOS...');
  try {
    await build({
      config: {
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
        mac: {
          target: ['zip'],
          category: 'public.app-category.productivity',
          hardenedRuntime: false,
          gatekeeperAssess: false,
          sign: false
        }
      },
      mac: ['zip']
    });
    console.log('✅ macOS build completed!');
  } catch (error) {
    console.error('❌ macOS build failed:', error.message);
    throw error;
  }
}

async function buildForWindows() {
  console.log('🏗️  Building Zenith for Windows...');
  try {
    await build({
      config: {
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
          target: ['portable', 'nsis'],
          certificateFile: process.env.WIN_CERT_FILE || null,
          certificatePassword: process.env.WIN_CERT_PASSWORD || null
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: 'Zenith'
        }
      },
      win: ['portable', 'nsis']
    });
    console.log('✅ Windows build completed!');
  } catch (error) {
    console.error('❌ Windows build failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Building Zenith Distribution Files');
    console.log('=====================================\n');
    
    await buildForMacOS();
    console.log('');
    await buildForWindows();
    
    console.log('\n✅ All builds completed successfully!');
    console.log('📦 Check the dist/ folder for installers\n');
  } catch (error) {
    console.error('\n❌ Build process failed');
    process.exit(1);
  }
}

main();
