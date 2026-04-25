# Zenith Deployment & Distribution Guide

This guide walks you through deploying Zenith as a commercial product with license key validation, Stripe integration, and automated updates.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Building for Distribution](#building-for-distribution)
4. [License Key System](#license-key-system)
5. [Stripe Integration](#stripe-integration)
6. [GitHub Release Setup](#github-release-setup)
7. [Auto-Update System](#auto-update-system)
8. [Customer Distribution Workflow](#customer-distribution-workflow)

---

## 🎯 Overview

**Zenith Deployment Architecture:**

```
Customer Purchase → Stripe Payment → License Key Generated → Download Link Sent
                                             ↓
                              Customer Downloads Installer
                                             ↓
                              Runs Zenith, Activates License
                                             ↓
                              License Validated Locally
                                             ↓
                              App Unlocked, Auto-Updates Enabled
```

**Technology Stack:**
- **Distribution:** GitHub Releases (free, unlimited)
- **Payment:** Stripe ($15 per license)
- **License Validation:** Local (no backend required)
- **Auto-Updates:** electron-updater (checks GitHub Releases)
- **Code Protection:** electron-builder (bundles & obfuscates code)

---

## 🔧 Setup & Installation

### Prerequisites

1. **Node.js & npm** (v16+)
2. **GitHub Account** (for hosting releases)
3. **Stripe Account** (for payments)
4. **Git** (for version control)

### Step 1: Install Dependencies

```bash
cd "zenith v 1.1.7"
npm install
```

### Step 2: Install electron-builder and electron-updater

```bash
npm install --save-dev electron-builder
npm install electron-updater
```

### Step 3: Verify Scripts Work

```bash
# Test license key generation
node scripts/generate-license.js test@example.com

# You should see a license key output
```

---

## 📦 Building for Distribution

### Build for All Platforms

```bash
npm run build
```

This creates installers in the `dist/` directory:
- **Windows:** `Zenith Setup 1.1.7.exe`
- **macOS:** `Zenith-1.1.7.dmg`
- **Linux:** `zenith-1.1.7.AppImage` and `.deb`

### Build for Specific Platform

```bash
npm run build:win      # Windows only
npm run build:mac      # macOS only
npm run build:linux    # Linux only
```

### Build Artifacts

After building, you'll have:

```
dist/
├── Zenith Setup 1.1.7.exe              (Windows installer)
├── Zenith-1.1.7.dmg                    (macOS installer)
├── zenith-1.1.7.AppImage               (Linux AppImage)
├── zenith_1.1.7_amd64.deb              (Linux deb package)
└── builder-effective-config.json       (build metadata)
```

---

## 🔐 License Key System

### How It Works

1. **Generation:** When a customer purchases, you run:
   ```bash
   node scripts/generate-license.js customer@email.com
   ```
   This outputs a unique license key (e.g., `ZXgSBw5c2...`)

2. **Validation:** When the customer launches Zenith, they:
   - See the license activation window
   - Paste their license key
   - The app validates locally (no internet required after first activation)
   - License is stored encrypted on their machine

3. **Expiration:** Licenses valid for 365 days from generation

### Generate a License Key

```bash
node scripts/generate-license.js customer@example.com

# Output:
# ✅ License Key Generated
#
# 📧 Email:      customer@example.com
# 🔑 License:    ZXgSBw5c2Ty3qL9kM0pO...
# ⏰ Generated:   2024-04-25T06:07:00.000Z
# ⏳ Expires:     2025-04-25T06:07:00.000Z
```

### Store Generated Keys

Create a `licenses.csv` for record-keeping:

```csv
email,license_key,generated_date,expires_date,stripe_transaction
customer@example.com,ZXgSBw5c2Ty3qL9kM0pO...,2024-04-25,2025-04-25,ch_1234567890
```

---

## 💳 Stripe Integration

### Step 1: Set Up Stripe Product

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a Product: **Zenith - License Key**
3. Set Price: **$15.00 USD**
4. Enable recurring or one-time (one-time recommended for this model)

### Step 2: Create a Payment Form (Simple Option)

Use Stripe Payment Links (no coding required):

1. In Stripe Dashboard → Products → Zenith
2. Click "Create Payment Link"
3. Set to $15, one-time payment
4. Copy the link: `https://buy.stripe.com/...`

### Step 3: Automate License Key Delivery

**Option A: Manual (Simple)**
- Customer purchases → receives email with download link
- You manually generate license key: `node scripts/generate-license.js customer@email.com`
- Send license key via email manually

**Option B: Automated with Webhook (Advanced)**

Create a simple Node.js webhook server (using services like Replit, Render, or AWS Lambda free tier):

```javascript
// webhook.js - Handle Stripe payment completion
const crypto = require('crypto');
const nodemailer = require('nodemailer');

app.post('/stripe-webhook', (req, res) => {
  const event = req.body;

  if (event.type === 'charge.succeeded') {
    const email = event.data.object.billing_details.email;
    
    // Generate license key
    const licenseKey = generateLicenseKey(email);
    
    // Send email to customer
    sendEmail(email, licenseKey, downloadLink);
    
    res.json({ received: true });
  }
});
```

**For now, go with Option A (manual)** - it's simpler and works perfectly fine.

---

## 🚀 GitHub Release Setup

### Step 1: Create GitHub Repository

```bash
# Go to github.com/new
# Create repo: "zenith"
# Clone it locally

git clone https://github.com/your-username/zenith.git
cd zenith
```

### Step 2: Prepare Repository Structure

```bash
# Copy all Zenith files to the repo
cp -r "/Users/localaiworkstation/Desktop/zenith v 1.1.7/*" .

# Initialize git
git init
git add .
git commit -m "Initial Zenith release v1.1.7"
git branch -M main
git remote add origin https://github.com/your-username/zenith.git
git push -u origin main
```

### Step 3: Create GitHub Release

1. Go to https://github.com/your-username/zenith/releases
2. Click "Create a new release"
3. **Tag version:** `v1.1.7`
4. **Release title:** `Zenith v1.1.7`
5. **Description:**
   ```
   ## Release Notes
   
   ### Downloads
   - **Windows:** Zenith Setup 1.1.7.exe
   - **macOS:** Zenith-1.1.7.dmg
   - **Linux:** zenith-1.1.7.AppImage
   
   ### Installation
   1. Download your platform's installer
   2. Run the installer
   3. Open Zenith and enter your license key
   ```

6. **Upload files:**
   - Drag & drop the 4 installer files from `dist/`
   - Click "Publish release"

### Step 4: Update electron-builder Config

Edit `electron-builder.json`:

```json
"publish": {
  "provider": "github",
  "owner": "your-github-username",
  "repo": "zenith"
}
```

---

## 🔄 Auto-Update System

The app automatically checks GitHub Releases for updates and prompts users to install.

### How It Works

1. **On startup:** App checks latest release on GitHub
2. **Update available:** Shows notification to user
3. **Download & Install:** User clicks update
4. **Automatic restart:** App restarts with new version

### File: `main.js` (already configured)

The `electron-updater` is already set up in the main process to:
- Check for updates every 1 hour
- Notify user when update is available
- Download and stage the update
- Restart on next launch

### Testing Auto-Update

1. Build v1.1.7 and publish to GitHub
2. Make a small change to code
3. Bump version in `package.json` to `1.1.8`
4. Rebuild: `npm run build`
5. Publish new release to GitHub as `v1.1.8`
6. Launch v1.1.7 app → Should detect and offer update

---

## 👥 Customer Distribution Workflow

### For Each Sale:

#### Step 1: Customer Purchases on Stripe
- Customer clicks your payment link
- Completes $15 payment
- Receives order confirmation email

#### Step 2: Generate License Key
```bash
node scripts/generate-license.js customer@email.com
```

#### Step 3: Send Customer Email

**Email Template:**

```
Subject: Your Zenith License - Download & Setup

Hello,

Thank you for purchasing Zenith! 🎉

Your License Key: [PASTE_LICENSE_KEY_HERE]

Download Zenith for Your Platform:
- Windows: https://github.com/your-username/zenith/releases/download/v1.1.7/Zenith%20Setup%201.1.7.exe
- macOS:   https://github.com/your-username/zenith/releases/download/v1.1.7/Zenith-1.1.7.dmg
- Linux:   https://github.com/your-username/zenith/releases/download/v1.1.7/zenith-1.1.7.AppImage

Installation:
1. Download the installer for your operating system
2. Run the installer and follow the setup wizard
3. Launch Zenith
4. When prompted, enter your license key
5. Enjoy! ✨

Questions? Reply to this email or visit our support page.

License expires: [DATE_365_DAYS_FROM_NOW]

Best regards,
Zenith Team
```

#### Step 4: Record the Sale

Update `licenses.csv`:

```csv
customer@email.com,ZXgSBw5c2Ty3qL9kM0pO...,2024-04-25,2025-04-25,ch_1234567890
```

---

## 🎯 Release Checklist

Before each new release:

- [ ] Test app locally: `npm start`
- [ ] Update version in `package.json`
- [ ] Update version in `main.js` if needed
- [ ] Test license validation
- [ ] Run: `npm run build`
- [ ] Verify all 4 installers created in `dist/`
- [ ] Create GitHub Release with new version tag
- [ ] Upload all installer files
- [ ] Test auto-update (run old version, should detect new version)
- [ ] Update download links in email template

---

## 🐛 Troubleshooting

### "License key is invalid"
- Verify `SECRET_KEY` in `license-validator.js` matches `generate-license.js`
- Check the key wasn't corrupted during copy/paste
- Regenerate a new key for the customer

### Auto-update not working
- Verify GitHub repo is public
- Check `electron-builder.json` has correct owner/repo
- Check release tag format (e.g., `v1.1.8`)
- Restart the app to force check

### Build fails on macOS
- May need to install Xcode Command Line Tools: `xcode-select --install`
- Provide `-c` flag: `electron-builder --sign`

### Windows installer doesn't work
- Run as Administrator
- Disable antivirus temporarily (false positive)
- Ensure .NET Framework installed (usually already there)

---

## 📊 Version Strategy

Recommend semantic versioning:
- **v1.1.7** → Initial release
- **v1.1.8** → Bug fixes
- **v1.2.0** → New features
- **v2.0.0** → Major overhaul

Always increment before building and releasing.

---

## 💰 Revenue & Licensing

- **Price:** $15 per license
- **License Duration:** 365 days from purchase
- **Renewal:** Customers repurchase after expiration (or implement auto-renewal)
- **No limits:** Unlimited sales, customers, or concurrent licenses

---

## 🔒 Security Notes

1. **SECRET_KEY:** Keep `zenith-app-2024-secure` safe (don't share publicly)
2. **GitHub Token:** Never commit `.env` files with secrets
3. **Code Obfuscation:** electron-builder automatically minifies code
4. **License Validation:** Works offline after activation (no backend needed)

---

## ✅ You're Ready!

Your Zenith deployment system is complete. Next steps:

1. ✅ Build for all platforms
2. ✅ Create GitHub releases
3. ✅ Set up Stripe payment link
4. ✅ Share with customers
5. ✅ Generate licenses on each purchase
6. ✅ Monitor auto-updates

**Good luck selling Zenith!** 🚀

---

For questions or issues, refer to:
- [electron-builder docs](https://www.electron.build/)
- [electron-updater docs](https://www.electron.build/auto-update)
- [Stripe docs](https://stripe.com/docs)
