const path = require('path');

const API_KEY = 'LEMONSQUEEZY_KEY_PLACEHOLDER';

console.log('=== CONFIG.JS LOADED ===');
console.log('API Key:', API_KEY ? 'SET (' + API_KEY.substring(0, 4) + '...)' : 'EMPTY');

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