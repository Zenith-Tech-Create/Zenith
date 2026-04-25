const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Store operations
  storeGet: (key) => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),
  storeGetAll: () => ipcRenderer.invoke('store:get-all'),

  // License operations
  validateLicense: (licenseKey) => ipcRenderer.invoke('license:validate', licenseKey),
  closeLicenseWindow: () => ipcRenderer.send('license:close-window'),
  openBuyLink: () => ipcRenderer.invoke('license:open-buy-link'),

  // Listen for system events
  onOverdueReminders: (callback) => ipcRenderer.on('system:overdue-reminders', (event, data) => callback(data)),
});
