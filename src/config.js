const path = require('path');

module.exports = {
  lemonsqueezy: {
    apiKey: 'LEMONSQUEEZY_KEY_PLACEHOLDER',
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