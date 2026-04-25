# 🏗️ Zenith Build Guide

## Cross-Platform Building with GitHub Actions

This project uses GitHub Actions for automated CI/CD builds across all platforms.

### 📋 What Gets Built

When you push to `main` or create a tag, GitHub Actions automatically builds:

- **macOS**
  - ARM64 (Apple Silicon M1/M2/M3)
  - x64 (Intel)
  - Universal binary (works on both)
  
- **Windows**
  - x64 (32-bit support can be added)
  
- **Linux**
  - x64 AppImage
  - x64 .deb package

### 🚀 Local Development Builds

#### Prerequisites
```bash
# Install dependencies
npm install
```

#### Build Commands

```bash
# Build all platforms
npm run build

# Build for specific platform
npm run build:mac      # macOS (DMG + ZIP)
npm run build:win      # Windows (NSIS installer)
npm run build:linux    # Linux (AppImage + DEB)
```

#### macOS Specific (Local)

To build for both ARM64 and x64 on Apple Silicon:

```bash
# Build for ARM64 (native on M1/M2/M3)
npx electron-builder --mac dmg zip

# Build for x64 (emulated on Apple Silicon)
npx electron-builder --mac dmg zip -p always --arm64=false
```

To create a universal binary manually:
```bash
# After building both versions
lipo -create \
  dist/mac-arm64/Zenith.app/Contents/MacOS/Zenith \
  dist/mac-x64/Zenith.app/Contents/MacOS/Zenith \
  -output Zenith-universal
```

### 🔧 Configuration Files

#### `electron-builder.json`
Main build configuration for all platforms. Located in project root.

Key sections:
- `mac` - macOS DMG and ZIP settings
- `win` - Windows NSIS installer settings
- `linux` - Linux AppImage and DEB settings
- `dmg` - DMG layout configuration

#### `.github/workflows/build.yml`
GitHub Actions workflow that:
1. Checks out code
2. Sets up Node.js
3. Installs dependencies
4. Builds for each platform on appropriate runners
5. Uploads artifacts
6. Creates release (on tags)

### 📦 Output Files

After building, check `dist/` directory for installers:

```
dist/
├── Zenith-1.1.7-arm64.dmg          # macOS Apple Silicon
├── Zenith-1.1.7-arm64-mac.zip      # macOS Apple Silicon (portable)
├── Zenith-1.1.7-x64.dmg            # macOS Intel
├── Zenith-1.1.7-x64-mac.zip        # macOS Intel (portable)
├── Zenith Setup 1.1.7.exe          # Windows installer
├── Zenith-1.1.7.AppImage           # Linux portable
└── zenith-1.1.7-amd64.deb          # Linux DEB package
```

### 🔐 Signing & Notarization

#### macOS Code Signing (GitHub Actions)

For production releases, set up code signing:

1. **Create a signing certificate:**
   ```bash
   security find-identity -v -p codesigning
   ```

2. **Add to GitHub Secrets:**
   - `APPLE_TEAM_ID`
   - `APPLE_CERT_FILE` (base64 encoded .p12)
   - `APPLE_CERT_PASSWORD`

3. **Update workflow:**
   ```yaml
   env:
     APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
     CSC_LINK: ${{ secrets.APPLE_CERT_FILE }}
     CSC_KEY_PASSWORD: ${{ secrets.APPLE_CERT_PASSWORD }}
   ```

#### Windows Code Signing

For Windows, add to GitHub Secrets:
- `WIN_CERT_FILE` (base64 encoded .pfx)
- `WIN_CERT_PASSWORD`

### 🚀 Creating a Release

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "feat: New feature"
   git push origin main
   ```

2. **Create a git tag:**
   ```bash
   git tag -a v1.1.7 -m "Release version 1.1.7"
   git push origin v1.1.7
   ```

3. **GitHub Actions will:**
   - Build all platforms
   - Create a GitHub Release
   - Upload all installers
   - Generate release notes

### 📥 Download Releases

Releases are available at:
```
https://github.com/Zenith-Tech-Create/Zenith/releases
```

### 🔄 Auto-Update Configuration

Zenith includes electron-updater. Configure auto-updates:

1. **Update `electron-builder.json`:**
   ```json
   "publish": {
     "provider": "github",
     "owner": "Zenith-Tech-Create",
     "repo": "Zenith"
   }
   ```

2. **In your app code:**
   ```javascript
   import { autoUpdater } from 'electron-updater';
   
   autoUpdater.checkForUpdatesAndNotify();
   ```

### 🐛 Troubleshooting

#### "Program is not supported on mac"
- Check architecture: Apple menu → About This Mac
- ARM64 app won't work on Intel, and vice versa
- GitHub Actions builds both automatically

#### Build fails on Windows
- Ensure Node.js and dependencies are installed
- Check Windows Defender/antivirus isn't blocking builds
- Run `npm install` in project root

#### Large build size
- Typical sizes:
  - macOS DMG: 80-100 MB
  - Windows NSIS: 150-200 MB
  - Linux AppImage: 100-150 MB
- Can be reduced with:
  - Updating Electron to latest version
  - Removing unused dependencies
  - Using app-builder's compression options

### 📚 Resources

- [electron-builder docs](https://www.electron.build/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Electron documentation](https://www.electronjs.org/docs)

### 🎯 Next Steps

1. ✅ Ensure `.github/workflows/build.yml` is committed
2. ✅ Push to `main` branch
3. ✅ Tag a release with `git tag v1.1.7`
4. ✅ GitHub Actions automatically builds and publishes
5. ✅ Users download from GitHub Releases page

---

**Questions?** Check the GitHub Actions logs in Actions tab for detailed build output.
