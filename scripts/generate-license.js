#!/usr/bin/env node

/**
 * License Key Generator
 * Run this after receiving a Stripe payment to generate a license key for the customer
 * 
 * Usage:
 *   node scripts/generate-license.js customer@email.com
 */

const crypto = require('crypto');

const SECRET_KEY = 'zenith-app-2024-secure'; // MUST match the SECRET_KEY in license-validator.js

function generateLicenseKey(email) {
  if (!email || !email.includes('@')) {
    console.error('❌ Please provide a valid email address');
    console.error('Usage: node scripts/generate-license.js customer@email.com');
    process.exit(1);
  }

  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(16).toString('hex');
  const data = `${email}:${timestamp}:${randomStr}`;
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  // License key format: data:signature (base64 encoded)
  const licenseKey = Buffer.from(`${data}:${signature}`).toString('base64');
  
  return { email, licenseKey, timestamp: new Date(timestamp).toISOString() };
}

// Main
const email = process.argv[2];
const result = generateLicenseKey(email);

console.log('\n✅ License Key Generated\n');
console.log(`📧 Email:      ${result.email}`);
console.log(`🔑 License:    ${result.licenseKey}`);
console.log(`⏰ Generated:   ${result.timestamp}`);
console.log(`⏳ Expires:     ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}`);
console.log('\n📋 Share this license key with the customer via email.\n');
