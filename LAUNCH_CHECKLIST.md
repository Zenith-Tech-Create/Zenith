# 🎯 Zenith Launch Checklist

Complete this checklist to go from development to selling Zenith.

---

## Phase 1: Prepare (30 minutes)

- [ ] Read START_HERE.md
- [ ] Read QUICK_START.md or DEPLOYMENT.md
- [ ] Verify Node.js installed: `node --version`
- [ ] Verify npm installed: `npm --version`

---

## Phase 2: Dependencies (5 minutes)

```bash
cd "zenith v 1.1.7"
```

- [ ] Install base dependencies: `npm install`
- [ ] Install electron-builder: `npm install --save-dev electron-builder`
- [ ] Install electron-updater: `npm install electron-updater`

---

## Phase 3: Testing Locally (5 minutes)

- [ ] Run app: `npm start`
- [ ] App launches successfully: ✓
- [ ] All modules load without errors: ✓
- [ ] No console errors: ✓

---

## Phase 4: License System Test (5 minutes)

```bash
node scripts/generate-license.js test@example.com
```

- [ ] Command runs successfully
- [ ] License key generated
- [ ] Output shows email, key, date, expiration: ✓

---

## Phase 5: Build Installers (10 minutes)

```bash
npm run build
```

- [ ] Build completes without errors
- [ ] Check `dist/` folder exists
- [ ] Windows installer exists: `Zenith Setup 1.1.7.exe`
- [ ] macOS installer exists: `Zenith-1.1.7.dmg`
- [ ] Linux AppImage exists: `zenith-1.1.7.AppImage`
- [ ] Linux deb exists: `zenith_1.1.7_amd64.deb`

---

## Phase 6: GitHub Setup (10 minutes)

**Part A: Create Repository**
- [ ] Go to github.com/new
- [ ] Create repository named: `zenith`
- [ ] Make it **Public** (required for auto-updates)
- [ ] Add description: "Digital daily planner with task tracking"
- [ ] Click "Create repository"

**Part B: Upload Code**
```bash
git clone https://github.com/YOUR-USERNAME/zenith.git
cd zenith
# Copy all files from "zenith v 1.1.7" into this folder
git add .
git commit -m "Initial Zenith v1.1.7 release"
git push
```

- [ ] Code pushed to GitHub
- [ ] Repository shows files: ✓

**Part C: Create Release**
1. Go to github.com/YOUR-USERNAME/zenith/releases
2. Click "Create a new release"
3. Fill in:
   - **Tag version:** `v1.1.7`
   - **Release title:** `Zenith v1.1.7 - Initial Release`
   - **Description:** See template below
   - **Upload files:** Drag all 4 installers from `dist/`

**Release Description Template:**
```markdown
## Zenith v1.1.7 - Initial Release

Welcome to Zenith! 🎉

### What's Included
- Daily task tracking
- Goals & fitness logging
- Financial tracking
- Notes & journaling
- Habit tracking

### Downloads
Choose your operating system:

**🪟 Windows**
- [Zenith Setup 1.1.7.exe](https://github.com/YOUR-USERNAME/zenith/releases/download/v1.1.7/Zenith%20Setup%201.1.7.exe) (Recommended)

**🍎 macOS**
- [Zenith-1.1.7.dmg](https://github.com/YOUR-USERNAME/zenith/releases/download/v1.1.7/Zenith-1.1.7.dmg) (Intel & Apple Silicon)

**🐧 Linux**
- [zenith-1.1.7.AppImage](https://github.com/YOUR-USERNAME/zenith/releases/download/v1.1.7/zenith-1.1.7.AppImage) (AppImage)
- [zenith_1.1.7_amd64.deb](https://github.com/YOUR-USERNAME/zenith/releases/download/v1.1.7/zenith_1.1.7_amd64.deb) (Debian/Ubuntu)

### Installation & Activation
1. Download the installer for your OS
2. Run the installer
3. Launch Zenith
4. Enter your license key (from purchase email)
5. Start planning! ✨

### License
This is a commercial product. Each customer receives a unique license key.

### Support
Questions? Visit our support page or reply to your purchase email.
```

- [ ] Release published successfully
- [ ] All 4 installers visible: ✓
- [ ] Release page looks professional: ✓

---

## Phase 7: Stripe Setup (10 minutes)

**Part A: Create Account**
- [ ] Go to stripe.com
- [ ] Sign up for free account
- [ ] Verify email
- [ ] Access dashboard

**Part B: Create Product**
1. Dashboard → Products
2. Click "+ Add Product"
3. Fill in:
   - **Name:** `Zenith - License Key`
   - **Description:** `Digital license key for Zenith daily planner`
   - **Image:** (optional)
4. Click "Save product"

- [ ] Product created

**Part C: Create Price**
1. In product page, scroll to "Pricing"
2. Click "+ Add price"
3. Fill in:
   - **Price:** `15.00 USD`
   - **Billing period:** `One-time`
   - **Payment types:** `Card` (checked)
4. Click "Save price"

- [ ] Price created: $15.00 USD

**Part D: Create Payment Link**
1. In product page, find "Payment links"
2. Click "+ Create payment link"
3. Configure:
   - [x] Email (required for license delivery)
   - [x] Name
   - [ ] Address (optional)
4. Uncheck "Phone number"
5. Click "Create link"
6. Copy the link: `https://buy.stripe.com/...`

- [ ] Payment link created
- [ ] Link copied and saved

**Part E: Test Payment (Optional but Recommended)**
1. Open payment link in new tab
2. Enter test customer:
   - Email: `test@example.com`
   - Name: `Test Customer`
3. Card number: `4242 4242 4242 4242`
4. Expiry: `12/25` (or any future date)
5. CVC: `123`
6. Click "Pay"

- [ ] Test payment succeeds
- [ ] Payment appears in dashboard
- [ ] Status: "Succeeded"

---

## Phase 8: Prepare for Sales (10 minutes)

**Part A: Email Template**
Create a file `EMAIL_TEMPLATE.txt` with:

```
Subject: Your Zenith License - Download & Setup

Hello [CUSTOMER_NAME],

Thank you for purchasing Zenith! 🎉

Your unique license key is:
[LICENSE_KEY_HERE]

Download Zenith:
Windows: https://github.com/YOUR-USERNAME/zenith/releases/download/v1.1.7/Zenith%20Setup%201.1.7.exe
macOS:   https://github.com/YOUR-USERNAME/zenith/releases/download/v1.1.7/Zenith-1.1.7.dmg
Linux:   https://github.com/YOUR-USERNAME/zenith/releases/download/v1.1.7/zenith-1.1.7.AppImage

Setup Instructions:
1. Download the installer for your OS
2. Run the installer
3. Launch Zenith
4. Paste your license key when prompted
5. Done! Start planning with Zenith ✨

License Details:
- Valid for: 365 days
- Expires: [EXPIRATION_DATE]
- Support: Reply to this email

Best regards,
Zenith Team
```

- [ ] Email template created and saved

**Part B: License Tracking Spreadsheet**
Create `LICENSES.csv` with headers:

```csv
Date,Customer Email,License Key,Expiration Date,Status
```

- [ ] Spreadsheet created
- [ ] Ready to add sales

**Part C: Setup Instructions for Customers**
Create `CUSTOMER_SETUP.txt` with:

1. Download link (from GitHub releases)
2. Installation steps
3. License activation instructions
4. Support contact

- [ ] Instructions written and saved

---

## Phase 9: Go Live (Minimal)

- [ ] Stripe: Switch to LIVE MODE (dashboard settings)
  ⚠️ **Warning:** Real money will be charged!
- [ ] Update payment link with LIVE version
- [ ] Share payment link with customers
- [ ] Announce Zenith (social media, email list, etc.)

---

## Phase 10: First Sale! 🎉

When you get your first customer:

1. **Verify payment:**
   ```
   Dashboard → Payments → Find transaction
   Status should be "Succeeded"
   ```
   - [ ] Payment verified

2. **Generate license key:**
   ```bash
   node scripts/generate-license.js customer@email.com
   ```
   - [ ] License key generated

3. **Send email to customer:**
   - [ ] Use EMAIL_TEMPLATE.txt
   - [ ] Include license key
   - [ ] Include download links
   - [ ] Include setup instructions
   - [ ] Email sent successfully

4. **Record sale:**
   - [ ] Added to LICENSES.csv
   - [ ] Date, email, key, expiration recorded

5. **Celebrate!** 🎊
   - [ ] Your first Zenith customer!

---

## Phase 11: Ongoing (Monthly)

- [ ] Monitor Stripe dashboard
- [ ] Handle customer support emails
- [ ] Collect feedback
- [ ] Plan v1.2.0 features
- [ ] Generate licenses for new customers (using generate-license.js script)

---

## Phase 12: Future Updates

When you release v1.2.0:

1. Update `package.json` version to `1.2.0`
2. Run: `npm run build`
3. Create new GitHub Release with tag `v1.2.0`
4. Upload new installers
5. Existing customers auto-update automatically! ✨

- [ ] Update process documented

---

## 🎯 Final Status

| Phase | Status |
|-------|--------|
| 1. Prepare | ⬜ Start |
| 2. Dependencies | ⬜ |
| 3. Testing | ⬜ |
| 4. License Test | ⬜ |
| 5. Build | ⬜ |
| 6. GitHub | ⬜ |
| 7. Stripe | ⬜ |
| 8. Prep for Sales | ⬜ |
| 9. Go Live | ⬜ |
| 10. First Sale | ⬜ 🎉 |
| 11. Ongoing | ⬜ |
| 12. Updates | ⬜ |

---

## ✨ Summary

**Total Time:** ~90 minutes

**What You'll Have:**
- ✅ Zenith ready to sell
- ✅ Cross-platform installers
- ✅ License key system
- ✅ Stripe payment system
- ✅ GitHub distribution
- ✅ Auto-update capability
- ✅ First paying customers
- ✅ Recurring revenue stream

---

## 🚀 You're Ready!

Start with Phase 1 and work your way down. Refer back to the documentation (DEPLOYMENT.md, STRIPE_INTEGRATION.md, etc.) as needed.

**Good luck launching Zenith!** 🌟

---

**Questions?**
- See START_HERE.md for documentation links
- See DEPLOYMENT.md for detailed walkthrough
- See STRIPE_INTEGRATION.md for payment setup
- See QUICK_START.md for quick reference

**You've got this!** 💪
