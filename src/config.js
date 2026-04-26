const path = require('path');

// Try to load from package.json metadata first (packaged app)
// Fall back to .env for development
let lemonsqueezyApiKey = '';

try {
  const pkg = require('../package.json');
  if (pkg.lemonsqueezyApiKey) {
    lemonsqueezyApiKey = pkg.lemonsqueezyApiKey;
  } else {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    lemonsqueezyApiKey = process.env.LEMONSQUEEZY_API_KEY || '';
  }
} catch (e) {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  lemonsqueezyApiKey = process.env.LEMONSQUEEZY_API_KEY || '';
}

module.exports = {
  lemonsqueezy: {
    apiKey: lemonsqueezyApiKey,
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