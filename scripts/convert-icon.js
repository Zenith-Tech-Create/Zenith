#!/usr/bin/env node

/**
 * Convert PNG logo to icon formats for electron-builder
 * Converts zenith_icon_final.png to:
 * - macOS: electron.icns
 * - Windows: electron.ico
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.join(__dirname, '../assets');
const srcIcon = path.join(assetsDir, 'zenith_icon_final.png');
const macIcon = path.join(assetsDir, 'electron.icns');
const winIcon = path.join(assetsDir, 'electron.ico');

console.log('🎨 Converting Zenith logo to icon formats...\n');

// Check source file exists
if (!fs.existsSync(srcIcon)) {
  console.error(`❌ Source icon not found: ${srcIcon}`);
  process.exit(1);
}

console.log(`✅ Source icon found: ${srcIcon}`);
console.log(`📊 Image info:`, execSync(`file "${srcIcon}"`).toString().trim());

// Convert to Windows .ico
console.log('\n🪟 Converting to Windows .ico format...');
try {
  // Using sips to convert to multiple sizes and create .ico
  const tempDir = path.join(assetsDir, 'temp-ico');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Create different sizes needed for .ico
  const sizes = [16, 32, 48, 64, 128, 256];
  
  for (const size of sizes) {
    const tempFile = path.join(tempDir, `icon_${size}x${size}.png`);
    console.log(`  Creating ${size}x${size}...`);
    execSync(`sips -z ${size} ${size} "${srcIcon}" --out "${tempFile}"`, { stdio: 'pipe' });
  }

  // Convert largest size to .ico as placeholder
  const largestTemp = path.join(tempDir, 'icon_256x256.png');
  execSync(`sips -s format ico "${largestTemp}" --out "${winIcon}"`, { stdio: 'pipe' });

  console.log(`✅ Windows icon created: ${winIcon}`);
  
  // Cleanup temp files
  execSync(`rm -rf "${tempDir}"`);
} catch (error) {
  console.warn(`⚠️  Windows icon conversion had issues, but continuing...`);
  console.warn(`   Manual conversion recommended using online tool or ffmpeg`);
}

// Convert to macOS .icns
console.log('\n🍎 Converting to macOS .icns format...');
try {
  const tempDir = path.join(assetsDir, 'temp-icns');
  const iconsetDir = path.join(tempDir, 'Zenith.iconset');
  
  if (!fs.existsSync(iconsetDir)) {
    fs.mkdirSync(iconsetDir, { recursive: true });
  }

  // Create required icon sizes for macOS
  const sizeMap = [
    [16, '16x16'],
    [32, '16x16@2x'],
    [32, '32x32'],
    [64, '32x32@2x'],
    [128, '128x128'],
    [256, '128x128@2x'],
    [256, '256x256'],
    [512, '256x256@2x'],
    [512, '512x512'],
    [1024, '512x512@2x']
  ];

  for (const [size, name] of sizeMap) {
    const outFile = path.join(iconsetDir, `icon_${name}.png`);
    console.log(`  Creating ${name}...`);
    execSync(`sips -z ${size} ${size} "${srcIcon}" --out "${outFile}"`, { stdio: 'pipe' });
  }

  // Convert iconset to .icns
  console.log('  Creating .icns from iconset...');
  execSync(`iconutil -c icns "${iconsetDir}" -o "${macIcon}"`, { stdio: 'pipe' });

  console.log(`✅ macOS icon created: ${macIcon}`);

  // Cleanup temp files
  execSync(`rm -rf "${tempDir}"`);
} catch (error) {
  console.error(`❌ macOS icon conversion failed:`, error.message);
  process.exit(1);
}

console.log('\n✅ All icon conversions complete!\n');
console.log('📋 Summary:');
console.log(`  • macOS: ${macIcon}`);
console.log(`  • Windows: ${winIcon}`);
console.log('\n🚀 Ready for rebuild!');
