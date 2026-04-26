/**
 * Configuration loader for Zenith
 * Loads environment variables and config
 */

const path = require('path');

// Load .env from the app root directory (where main.js is)
const { app } = require('electron');
const envPath = app.isPackaged 
  ? path.join(process.resourcesPath, '..', '.env')
  : path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

module.exports = {
  // Lemonsqueezy Configuration
  lemonsqueezy: {
    apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
    apiEndpoint: process.env.LEMONSQUEEZY_API_ENDPOINT || 'https://api.lemonsqueezy.com/v1/licenses/validate'
  },

  // App Configuration
  app: {
    isDev: process.env.NODE_ENV === 'development',
    debug: process.env.DEBUG === 'true'
  },

  // License Configuration
  license: {
    cacheEnabled: true,
    cacheExpiryDays: 365
  }
};
