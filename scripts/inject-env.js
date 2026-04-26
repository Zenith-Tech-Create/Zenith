const fs = require('fs');
const path = require('path');

const apiKey = process.env.LEMONSQUEEZY_API_KEY;
if (!apiKey) {
  console.error('ERROR: LEMONSQUEEZY_API_KEY not set');
  process.exit(1);
}

const configPath = path.join(__dirname, '..', 'src', 'config.js');
let content = fs.readFileSync(configPath, 'utf8');
content = content.replace('LEMONSQUEEZY_KEY_PLACEHOLDER', apiKey);
fs.writeFileSync(configPath, content);
console.log('✅ API key injected successfully');