const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('zenith', {
  // Store operations (for db.js)
  get: (key) => ipcRenderer.invoke('store:get', key),
  set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  loadAll: () => ipcRenderer.invoke('store:get-all'),

  // License operations
  validateLicense: (licenseKey) => ipcRenderer.invoke('license:validate', licenseKey),
  closeLicenseWindow: () => ipcRenderer.send('license:close-window'),
  openBuyLink: () => ipcRenderer.invoke('license:open-buy-link'),

  // Listen for system events
  onOverdueReminders: (callback) => ipcRenderer.on('system:overdue-reminders', (event, data) => callback(data)),

  // Tasks overdue check
  getOverdueTasks: () => ipcRenderer.invoke('tasks:get-overdue'),
});
