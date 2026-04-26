const path = require('path');
const fs = require('fs');
const os = require('os');

const API_KEY = 'LEMONSQUEEZY_KEY_PLACEHOLDER';

// Write debug log to home directory
const logPath = os.homedir() + '/zenith-debug.log';
fs.writeFileSync(logPath, '=== ZENITH CONFIG ===\n', { flag: 'a' });
fs.writeFileSync(logPath, 'API Key status: ' + (API_KEY !== 'LEMONSQUEEZY_KEY_PLACEHOLDER' ? 'SET' : 'PLACEHOLDER NOT REPLACED') + '\n', { flag: 'a' });
fs.writeFileSync(logPath, 'API Key first 4 chars: ' + API_KEY.substring(0, 4) + '\n', { flag: 'a' });

module.exports = {
  lemonsqueezy: {
    apiKey: API_KEY,
    apiEndpoint: 'https://api.lemonsqueezy.com/v1/licenses/validate'
  },
  app: {
    isDev: process.env.NODE_ENV === 'development',
    debug: process.env.DEBUG === 'true'
  },
  license: {
    cacheEnabled: true,
    cacheExpiryDays: 365
  }
};