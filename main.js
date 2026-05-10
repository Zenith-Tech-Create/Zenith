const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

// Initialize persistent storage
const store = new Store();

// Global window references
let mainWindow = null;

// Seed default data on first launch
async function seedDefaultData() {
  if (store.get('initialized')) return; // Already initialized

  store.set('tasks', [
    { id: 1, text: 'Review project proposal', done: false, cat: 'Work', date: 'Today' },
    { id: 2, text: 'Buy groceries', done: false, cat: 'Personal', date: 'Today' },
    { id: 3, text: 'Pay electricity bill', done: false, cat: 'Finance', date: 'Today' },
    { id: 4, text: 'Schedule dentist appointment', done: false, cat: 'Health', date: 'Tomorrow' },
    { id: 5, text: 'Read 30 pages of book', done: false, cat: 'Personal', date: 'Tomorrow' },
  ]);
  store.set('habits', [
    { id: 1, name: 'Morning meditation', done: false, streak: 12 },
    { id: 2, name: 'Read for 30 min', done: false, streak: 5 },
    { id: 3, name: 'Exercise', done: false, streak: 8 },
    { id: 4, name: 'Drink 8 glasses of water', done: false, streak: 21 },
    { id: 5, name: 'No social media after 9pm', done: false, streak: 3 },
    { id: 6, name: 'Cold shower', done: false, streak: 7 },
  ]);
  store.set('goals', [
    { id: 1, name: 'Read 24 books this year', prog: 7, total: 24, unit: 'books', cat: 'Personal', col: '#1D9E75' },
    { id: 2, name: 'Save $10,000 emergency fund', prog: 6400, total: 10000, unit: '$', cat: 'Finance', col: '#378ADD' },
    { id: 3, name: 'Run 5K under 25 min', prog: 72, total: 100, unit: '%', cat: 'Fitness', col: '#D85A30' },
    { id: 4, name: 'Learn Spanish to B1 level', prog: 40, total: 100, unit: '%', cat: 'Learning', col: '#7F77DD' },
  ]);
  store.set('transactions', [
    { id: 1, type: 'exp', desc: 'Whole Foods', amt: 87.50, cat: 'Groceries', date: 'Today' },
    { id: 2, type: 'inc', desc: 'Freelance payment', amt: 1200, cat: 'Income', date: 'Yesterday' },
    { id: 3, type: 'exp', desc: 'Netflix', amt: 15.99, cat: 'Subscriptions', date: '2 days ago' },
  ]);
  store.set('workouts', [
    { id: 1, type: 'Running', dur: 35, cal: 380, date: 'Today' },
    { id: 2, type: 'Weight Training', dur: 50, cal: 420, date: 'Yesterday' },
    { id: 3, type: 'Cycling', dur: 45, cal: 510, date: '3 days ago' },
  ]);
  store.set('journal', [])
  store.set('notes', [
    { id: 1, title: 'Welcome to Notes', content: 'This is your notes app. Write anything here — ideas, plans, reminders.\\n\\nNotes auto-save as you type.', folder: 'Personal', created: new Date().toISOString(), updated: new Date().toISOString(), pinned: true },
    { id: 2, title: 'Work ideas', content: 'Things to explore this week:', folder: 'Work', created: new Date().toISOString(), updated: new Date().toISOString(), pinned: false },
    { id: 3, title: 'Shopping list', content: 'Milk\\nEggs\\nBread\\nCoffee', folder: 'Personal', created: new Date().toISOString(), updated: new Date().toISOString(), pinned: false },
  ])
  store.set('noteFolders', ['Personal', 'Work', 'Ideas'])
  store.set('events', [])
  store.set('nutrition', {
    goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
    log: []
  })
  store.set('initialized', true)
}

// ── Main Application Window ──────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#ffffff',
    show: false,
  })

  win.loadFile(path.join(__dirname, 'src', 'index.html'))

  win.once('ready-to-show', () => {
    win.show()
  })

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return win
}

// ── IPC handlers — renderer talks to main via these ──────────────────────────

ipcMain.handle('store:get', (_event, key) => {
  return store.get(key)
})

ipcMain.handle('store:set', (_event, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.handle('store:get-all', () => {
  return {
    tasks:        store.get('tasks', []),
    habits:       store.get('habits', []),
    goals:        store.get('goals', []),
    transactions: store.get('transactions', []),
    workouts:     store.get('workouts', []),
    journal:      store.get('journal', []),
    events:       store.get('events', []),
    nutrition:    store.get('nutrition', { goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 }, log: [] }),
    calConnections: store.get('calConnections', {}),
    apiKey:       store.get('apiKey', ''),
    events:       store.get('events', []),
    nutrition:    store.get('nutrition', { goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 }, log: [] }),
  }
})

ipcMain.handle('tasks:get-overdue', () => {
    console.log('--- Overdue Task Check (renderer-initiated) ---');
    try {
        const now   = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tasks = store.get('tasks', []);
        const due   = tasks.filter(task => {
            if (task.done) return false;
            const d = task.date;
            if (!d || d === 'Tomorrow' || d === 'This week') return false;
            if (d === 'Today') return true;
            const parsed  = new Date(d);
            if (isNaN(parsed.getTime())) return false;
            const taskDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
            return taskDay <= today;
        });
        console.log(`✅ Found ${due.length} due/overdue tasks.`);
        return due;
    } catch (error) {
        console.error('🚨 ERROR during overdue task check:', error);
        return [];
    }
});

// ── App lifecycle ───────────────────────────────────────────────────────

async function main() {
  // 1. Seed Data
  await seedDefaultData();

  // 2. Create the main window
  mainWindow = createWindow();

  // 3. Handle application closure/activation
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
}

// Start the entire application sequence asynchronously
app.whenReady().then(async () => {
    await main();

    // Auto-updater
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
        const { dialog } = require('electron');
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: 'A new version of Zenith is available. It will be downloaded in the background.',
            buttons: ['OK']
        });
    });

    autoUpdater.on('update-downloaded', () => {
        const { dialog } = require('electron');
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Ready',
            message: 'Update downloaded. Zenith will restart to apply the update.',
            buttons: ['Restart Now']
        }).then(() => {
            autoUpdater.quitAndInstall();
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('Auto-updater error:', err);
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})