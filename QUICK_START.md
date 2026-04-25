# Zenith Deployment - Quick Start

Get Zenith ready to sell in 15 minutes.

---

## 🚀 5-Step Launch

### 1. Install Dependencies
```bash
cd "zenith v 1.1.7"
npm install
npm install --save-dev electron-builder
npm install electron-updater
```

### 2. Build Installers
```bash
npm run build
```
✅ Installers created in `dist/` folder

### 3. Create GitHub Repo
```bash
# Go to github.com/new, create "zenith" repo
git clone https://github.com/YOUR-USERNAME/zenith.git
cd zenith
cp -r "/Users/localaiworkstation/Desktop/zenith v 1.1.7/*" .
git add .
git commit -m "Zenith v1.1.7"
git push
```

### 4. Create GitHub Release
1. Go to github.com/YOUR-USERNAME/zenith/releases
2. Click "Create a new release"
3. Tag: `v1.1.7`
4. Upload 4 files from `dist/`:
   - `Zenith Setup 1.1.7.exe`
   - `Zenith-1.1.7.dmg`
   - `zenith-1.1.7.AppImage`
   - `zenith_1.1.7_amd64.deb`
5. Publish

### 5. Set Up Stripe Payment
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create Product: "Zenith - License Key" → $15
3. Create Payment Link → Share link with customers

---

## 💳 For Each Sale

When customer purchases:

```bash
node scripts/generate-license.js customer@email.com
```

Send customer:
- Download link (from GitHub Releases)
- License key

---

## 📥 Customer Installation

1. Download installer from GitHub
2. Run installer
3. Launch Zenith
4. Paste license key when prompted
5. Done! ✨

---

## 🔄 Deploy Updates

When you fix bugs or add features:

```bash
# 1. Update version
# Edit package.json: "version": "1.1.8"

# 2. Build
npm run build

# 3. Create new GitHub Release
# Tag: v1.1.8
# Upload new installers

# 4. Customers auto-update
# (electron-updater will detect new release)
```

---

## 📊 Dashboard Commands

```bash
npm start              # Run locally
npm run build          # Build all platforms
npm run build:win      # Windows only
npm run build:mac      # macOS only  
npm run build:linux    # Linux only
node scripts/generate-license.js EMAIL  # Generate key
```

---

## 🎯 What's Included

✅ License validation (local, no backend needed)
✅ Code obfuscation (source code protected)
✅ Cross-platform installers (Windows, macOS, Linux)
✅ Auto-update system (customers stay up-to-date)
✅ Stripe-ready (payment processing)

---

## 📖 More Details

See `DEPLOYMENT.md` for complete guide.

---

**You're ready to sell Zenith!** 🚀
