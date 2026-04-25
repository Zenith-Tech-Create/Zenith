# Zenith Distribution Strategy

## Overview

Zenith is now distributed as **closed-source, single-file executables** with license key validation via Lemonsqueezy.

---

## Current Status

### ✅ What's Complete

- **macOS Executable**: `Zenith-1.1.7-arm64-mac.zip` (86 MB) - Ready for distribution
- **License Validation**: Integrated with Lemonsqueezy API
- **GitHub Repository**: Now PRIVATE (source code hidden from public)
- **.env File**: Contains your Lemonsqueezy API key (not tracked in git)

### ⏳ What Needs To Be Built

- **Windows Executable**: Needs to be built on Windows machine or via CI/CD
- **Distribution Website**: Where users download the executable + enter license key

---

## Distribution Flow

```
┌─────────────────────────────────────────┐
│ User visits your website                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ User downloads Zenith executable        │
│ (Zenith-1.1.7.exe or Zenith-1.1.7.app) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ User runs Zenith for the first time     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ License Dialog Appears                  │
│ "Enter your license key"                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ App validates key with Lemonsqueezy API │
│ using LEMONSQUEEZY_API_KEY from .env    │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    ✅ VALID      ❌ INVALID
        │             │
        ▼             ▼
     RUNS         ERROR MESSAGE
   (Zenith)       (Exit App)
```

---

## File Locations for Distribution

| File | Location | Size | Purpose |
|------|----------|------|---------|
| `Zenith-1.1.7-arm64-mac.zip` | `/dist/` | 86 MB | macOS executable for distribution |
| `Zenith-1.1.7.exe` | `/dist/` (needs build) | TBD | Windows executable for distribution |
| `.env` | Root directory | Local only | Contains API key (NOT in git) |

---

## How to Build for Each Platform

### macOS Build (Already Done ✅)

```bash
npm run build:mac
# Creates: dist/Zenith-1.1.7-arm64-mac.zip
```

### Windows Build (Cross-compile Issue)

**On M1/M2 Mac:**
The Windows build fails because Wine (x86) cannot run on ARM64. Options:

1. **Option A: Use Windows Machine** (Recommended)
   ```bash
   npm run build:win
   ```

2. **Option B: Use GitHub Actions CI/CD**
   - Set up a GitHub Actions workflow
   - Runs on Windows runner
   - Automatically builds and uploads

3. **Option C: Use a VPS/Cloud Build Service**
   - Use a Windows cloud VM to run the build

### Which to Choose?

- **For now**: Use a Windows machine to build once, upload to your website
- **For future updates**: Set up GitHub Actions for automated builds on every release

---

## Website Distribution Setup

### What Your Website Needs

1. **Download Page**
   - Link to: `Zenith-1.1.7-arm64-mac.zip` (macOS)
   - Link to: `Zenith-1.1.7.exe` (Windows) - **Once built**
   - System requirements listed
   - File sizes shown

2. **License Key Entry**
   - Users buy license from Lemonsqueezy link
   - Lemonsqueezy provides license key to customer
   - User enters license when running Zenith for first time

3. **License Verification Flow** (Already Implemented)
   - App calls Lemonsqueezy API with license key
   - Lemonsqueezy confirms if key is valid
   - If valid → App starts; if invalid → Error

---

## File Structure

```
zenith v 1.1.7/
├── dist/
│   ├── Zenith-1.1.7-arm64-mac.zip     ← macOS (Ready to distribute)
│   ├── latest-mac.yml                  ← Auto-update config
│   └── [Windows files when built]      ← Windows (Needs build)
│
├── src/                                ← Source code (NOT distributed)
├── main.js                             ← Electron entry (NOT distributed)
├── .env                                ← API key (Local only, NOT in git)
├── .gitignore                          ← Protects .env
├── package.json
└── [other source files]
```

---

## Security Checklist

- ✅ GitHub repo is now PRIVATE (source code hidden)
- ✅ .env file with API key is protected by .gitignore
- ✅ License validation integrated (requires valid key)
- ✅ Only executables are distributed (no source code)
- ⚠️ To do: Code signing for macOS (optional but recommended)
- ⚠️ To do: Code signing for Windows (optional but recommended)

---

## Next Steps

1. **Build Windows Executable**
   - [ ] On a Windows machine, run: `npm run build:win`
   - [ ] Or: Set up GitHub Actions workflow
   - [ ] Upload `Zenith-1.1.7.exe` from `dist/`

2. **Create Website Distribution Page**
   - [ ] Host the .zip and .exe files
   - [ ] Create download page with system requirements
   - [ ] Link to Lemonsqueezy for license purchase

3. **Test the Flow**
   - [ ] Download macOS .zip
   - [ ] Extract and run `Zenith.app`
   - [ ] Enter test license key from Lemonsqueezy
   - [ ] Verify app launches successfully

4. **Optional: Code Signing**
   - [ ] macOS: Get Developer Certificate ($99/year)
   - [ ] Windows: Get Code Signing Certificate
   - [ ] This removes "Unknown Developer" warnings

---

## Lemonsqueezy Integration

Your API key is stored in `.env`:
```
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

The app uses this key to validate licenses when users enter them.

**Important**: Never commit `.env` to git or distribute it with the app. The validation happens on the client, but the key is only used to verify license keys against Lemonsqueezy.

---

## Distribution Checklist

- ✅ Source code is private on GitHub
- ✅ macOS executable built
- ⏳ Windows executable (needs build)
- ⏳ Website with download links
- ⏳ License key validation flow (UI for dialog)
- ⏳ Testing on both platforms
- ⏳ Code signing (optional)

---

## Questions?

- **How do I host the files?** Use any file hosting (AWS S3, Dropbox, your own server)
- **How do I sell licenses?** Lemonsqueezy handles all payments and key generation
- **Can I update the app?** Yes, rebuild the executable and upload the new version

Good luck with your product launch! 🚀
