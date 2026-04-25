# 🏗️ Zenith - Mac Architecture Guide

## The Issue
The "program is not supported on mac" error means the app architecture doesn't match your Mac's processor.

---

## 🔍 Check Your Mac Type

**Apple Menu** → **About This Mac**

Look for the processor type:

### ✅ Apple Silicon (M1, M2, M3, M4)
- Shows: "Apple M1 Pro" / "Apple M2 Max" / etc.
- **Use this file:** `Zenith-1.1.7-arm64.dmg`
- **Status:** ✅ Ready to use now!

### ❌ Intel (Core i5, i7, i9)
- Shows: "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz" / etc.
- **Status:** ⚠️ Need to build for x64 (in progress)

---

## 📥 Installation Instructions

### For Apple Silicon Macs (M1/M2/M3) - ✅ Ready Now

1. **Download:** `Zenith-1.1.7-arm64.dmg` (89 MB)
2. **Open:** Double-click the DMG file
3. **Install:** Drag `Zenith.app` to Applications folder
4. **Launch:** Open Applications → Double-click Zenith
5. **License:** Enter your license key on first run

### For Intel Macs - ⚠️ Building

The x64 (Intel) version needs to be built on an Intel Mac since cross-compilation is not supported by electron-builder.

**Options:**
1. **Wait for GitHub Actions build** (if using CI/CD)
2. **Build on an Intel Mac** (if available)
3. **Contact support** for pre-built x64 version

---

## 🔧 Technical Details

### ARM64 (Apple Silicon)
- **File:** `Zenith-1.1.7-arm64.dmg`
- **Size:** 89 MB
- **Architecture:** Mach-O 64-bit executable arm64
- **Compatible with:** M1, M2, M3, M4, M5 and newer
- **Status:** ✅ Built and tested

### x64 (Intel)
- **File:** `Zenith-1.1.7-x64.dmg` (coming soon)
- **Architecture:** Mach-O 64-bit executable x86_64
- **Compatible with:** Intel Core processors
- **Status:** ⏳ In development

---

## 🚀 Why This Happened

When we built the app, we built it on an Apple Silicon Mac (M1/M2/M3). This created an ARM64 binary, which only works on Apple Silicon Macs.

Building an Intel (x64) version requires either:
- Building on an Intel Mac (we don't have access to one)
- Using CI/CD services like GitHub Actions
- Using specialized cross-compilation tools

---

## 📞 Next Steps

**Tell me your Mac type, and I'll:**
- ✅ Give you the ARM64 version (if you have Apple Silicon)
- 🔨 Build the x64 version (if you have Intel)
- 📋 Set up CI/CD for future multi-architecture builds

---

## 💡 Future Solution

To support both architectures going forward:
1. Set up GitHub Actions workflow
2. Build for both arm64 and x64 automatically
3. Create universal binary (contains both architectures)
4. Users run the same DMG on any Mac

This is the industry standard for macOS apps (like VS Code, Discord, Figma, etc.).
