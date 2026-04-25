# Zenith — Personal Life OS

A desktop productivity app built with Electron.

---

## Setup Instructions

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
The Zenith window will open!

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

## Adding Your Anthropic API Key (for AI Assistant)
The AI assistant calls the Anthropic API. To use it:
1. Get an API key at https://console.anthropic.com
2. Open `main.js` and find the `webPreferences` section
3. The app currently uses the API directly — for a production app you'd want to store the key securely using `electron-store`

---

## Next Steps
- Add your app icon to `/assets/icon.ico` (Windows) and `/assets/icon.icns` (Mac)
- Customize the default data in `main.js` → `seedDefaultData()`
- Each module in `/src/modules/` is self-contained — easy to modify
