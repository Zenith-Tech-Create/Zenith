# Zenith — Personal Life OS 💡

A comprehensive desktop productivity app for task management, goal tracking, fitness logging, nutrition tracking, journaling, and AI-powered assistance.

**Zenith requires a license key to run.** Purchase a license at: https://zenith-app.com/buy ($15 one-time)

---

## Quick Start (Easiest Way)

### Option 1: Automated Setup (Recommended)

#### **Windows Users:**
1. Unzip the Zenith folder to your Desktop or Documents
2. **Double-click `Start-Here.bat`**
3. That's it! The app will install and launch automatically.

#### **macOS Users:**
1. Unzip the Zenith folder to your Desktop or Documents
2. **Double-click `Start-Here.command`**
3. That's it! The app will install and launch automatically.

---

## Manual Setup (If You Prefer)

### Prerequisites
You need **Node.js** installed on your computer.
Download it free at: https://nodejs.org (download the LTS version)

---

### Step 1 — Extract this folder
Unzip and place the `zenith` folder somewhere on your computer (e.g. your Desktop).

### Step 2 — Open a terminal in the folder
- **Windows**: Right-click inside the folder → "Open in Terminal" (or search for "Command Prompt")
- **Mac**: Right-click the folder → "New Terminal at Folder"

### Step 3 — Install dependencies
Type this and press Enter:
```
npm install
```
Wait for it to finish (may take a minute).

### Step 4 — Run the app
```
npm start
```
The Zenith window will open. On first launch, you'll be prompted to enter your license key.

**Don't have a license?** Purchase one at https://zenith-app.com/buy for $15 (includes lifetime updates).

---

## Build a .exe installer (Windows)
```
npm run build:win
```
Your installer will appear in the `/dist` folder.

## Build a .dmg installer (Mac)
```
npm run build:mac
```

---

## Project Structure
```
zenith/
├── main.js              ← Electron main process (window setup, data storage)
├── preload.js           ← Secure bridge between app and storage
├── package.json         ← Project config & dependencies
├── src/
│   ├── index.html       ← App shell (navigation structure)
│   ├── styles.css       ← All app styles
│   ├── app.js           ← Navigation controller
│   └── modules/
│       ├── db.js        ← Data layer (reads/writes to disk)
│       ├── dashboard.js ← Dashboard with charts
│       ├── tasks.js     ← Task manager
│       ├── habits.js    ← Habit tracker
│       ├── goals.js     ← Goal tracker
│       ├── calendar.js  ← Calendar view
│       ├── journal.js   ← Journal/notes
│       ├── finance.js   ← Finance tracker
│       ├── fitness.js   ← Fitness logger
│       └── ai.js        ← AI assistant
└── assets/
    └── (add icon.ico here for Windows icon)
```

---

## Features
✅ **Task Tracking** — Organize tasks by category and date
✅ **Goal Setting** — Track progress toward your goals  
✅ **Habit Tracking** — Build streaks and monitor daily habits  
✅ **Fitness Logging** — Log workouts and track calories burned  
✅ **Nutrition Tracking** — Monitor daily calories, protein, carbs, and fat  
✅ **Journal & Notes** — Write daily journal entries and organize notes  
✅ **Calendar View** — See your tasks and events on a calendar  
✅ **Finance Tracking** — Monitor income and expenses  
✅ **AI Assistant** — Get personalized productivity tips (requires Anthropic API key)

## AI Assistant Setup (Optional)
The AI assistant requires an Anthropic API key. To enable it:
1. Get a free API key at https://console.anthropic.com
2. When you first use the AI assistant in the app, paste your API key
3. The key is stored locally on your device

---

## License Verification
Zenith requires a valid license key to run. The license check happens when you open the app:

1. **On first launch**, a license activation window appears
2. **Enter your license key** from your purchase confirmation email
3. **Once activated**, the main Zenith app opens
4. License is stored locally and verified on future launches
5. License keys are valid for 1 year from activation date

To check or update your license key, restart the app and you'll be prompted to enter it again.

## Development & Customization
- Add your app icon to `/assets/icon.ico` (Windows) and `/assets/icon.icns` (Mac)
- Customize the default data in `main.js` → `seedDefaultData()`
- Each module in `/src/modules/` is self-contained — easy to modify
- License validation is handled in `/src/license-validator.js`

## Support
For license issues or questions, email: support@zenith-app.com
