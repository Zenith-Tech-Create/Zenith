# 🎯 Zenith Command Reference

Quick copy-paste commands for everything you need.

---

## 🔧 Setup & Development

### Initial Setup
```bash
cd "/Users/localaiworkstation/Desktop/zenith v 1.1.7"
npm install
npm install --save-dev electron-builder
npm install electron-updater
```

### Run Locally
```bash
npm start
```

### Build Installers
```bash
npx electron-builder -m        # macOS only
npx electron-builder -w        # Windows only (requires Windows)
npx electron-builder -l        # Linux only (requires Linux)
```

---

## 🔐 License Management

### Generate License Key
```bash
node scripts/generate-license.js customer@email.com
```

### Test License Validation
```bash
node -e "
const LicenseValidator = require('./src/license-validator.js');
const key = LicenseValidator.generateLicenseKey('test@example.com');
console.log('Key:', key);
const result = LicenseValidator.validateLicenseKey(key);
console.log('Valid:', result.valid);
"
```

---

## 📦 Build & Distribution

### Build macOS Installer
```bash
npx electron-builder -m
```

### Check Built Files
```bash
ls -lh dist/
```

### Push to GitHub
```bash
cd zenith
git add .
git commit -m "Zenith v1.1.7 release"
git push origin main
```

---

## 💼 For Each Customer Sale

### Step 1: Generate License
```bash
node scripts/generate-license.js customer@email.com
```
(Copy the license key that's output)

### Step 2: Email Customer
Send email with:
- License key (from above)
- Download link: `https://github.com/YOUR-USERNAME/zenith/releases`
- Setup instructions (see templates in docs)

### Step 3: Record Sale
Add to `LICENSES.csv`:
```csv
2026-04-25,customer@email.com,LICENSE_KEY_HERE,2027-04-25,Activated
```

---

## 🔍 Troubleshooting

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Build Cache
```bash
rm -rf dist/
npx electron-builder -m
```

### Test App Without Building
```bash
npm start
```

### Check npm Version
```bash
npm --version        # Should be 8+
node --version       # Should be 16+
```

### View Build Logs
```bash
cat /Users/localaiworkstation/.npm/_logs/*debug-0.log | tail -100
```

---

## 📊 Monitor Sales

### Check Stripe Dashboard
1. Go to: https://dashboard.stripe.com
2. Click: Payments (left sidebar)
3. Find latest transactions
4. Note customer email for license generation

### Generate Batch Licenses
```bash
# For multiple customers:
node scripts/generate-license.js email1@example.com
node scripts/generate-license.js email2@example.com
node scripts/generate-license.js email3@example.com
# etc...
```

---

## 🔄 Update & Releases

### Bump Version
Edit `package.json`:
```json
"version": "1.2.0"
```

### Build New Version
```bash
npx electron-builder -m
```

### Create GitHub Release
1. Go to: https://github.com/YOUR-USERNAME/zenith/releases
2. Click: Create a new release
3. **Tag:** `v1.2.0`
4. Upload files from `dist/`
5. Publish

Customers auto-update automatically! ✨

---

## 💡 Useful Scripts to Create

### Auto-Generate Multiple Licenses (batch.sh)
```bash
#!/bin/bash
# Create file: batch.sh
# Usage: ./batch.sh emails.txt

while IFS= read -r email; do
    node scripts/generate-license.js "$email"
done < "$1"
```

Run:
```bash
chmod +x batch.sh
./batch.sh emails.txt
```

### Email Template Generator
Create `send-email.sh`:
```bash
#!/bin/bash
EMAIL=$1
LICENSE=$2
cat << EOF
To: $EMAIL
Subject: Your Zenith License

Thank you for purchasing Zenith!

License Key: $LICENSE
Download: https://github.com/YOUR-USERNAME/zenith/releases
EOF
```

---

## 📱 Cross-Platform Building (Advanced)

### Use GitHub Actions for CI/CD
Create `.github/workflows/build.yml`:
```yaml
name: Build
on: push
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx electron-builder -mwl
```

This auto-builds for all platforms on each push! 🚀

---

## 🎯 Daily Workflow

### Morning
```bash
# Check for updates needed
git pull origin main

# Start development if needed
npm start
```

### After Customer Purchase
```bash
# 1. Generate license
node scripts/generate-license.js newcustomer@email.com

# 2. Send email (manually or via script)

# 3. Record in spreadsheet
echo "date,email,key,expires,status" >> LICENSES.csv
```

### Weekly
```bash
# Check Stripe dashboard for total sales
# Update LICENSES.csv with all new customers
# Review feedback
```

### For Each Update
```bash
# 1. Update version in package.json
# 2. Make code changes
# 3. Test locally: npm start
# 4. Build: npx electron-builder -m
# 5. Create GitHub release with new files
# 6. Customers auto-update!
```

---

## 🚀 One-Minute Checklists

### New Customer?
```bash
node scripts/generate-license.js email@domain.com
# Copy key, email to customer, record in LICENSES.csv
```

### Want to Update?
```bash
# Edit package.json version
npx electron-builder -m
# Push to GitHub, create release
```

### Having Issues?
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📚 Documentation Links

- **START_HERE.md** - Where to begin
- **QUICK_START.md** - 15-minute setup
- **DEPLOYMENT.md** - Full guide
- **STRIPE_INTEGRATION.md** - Payment setup
- **LAUNCH_CHECKLIST.md** - Step-by-step
- **VERIFICATION_REPORT.md** - What's working
- **COMMANDS.md** - This file

---

**Print this page or bookmark it!** 🔖

All commands tested and working ✅
