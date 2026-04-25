const crypto = require('crypto');
const Store = require('electron-store');

const store = new Store();
const SECRET_KEY = 'zenith-app-2024-secure'; // Used for HMAC validation

class LicenseValidator {
  /**
   * Generate a license key (run this server-side after Stripe payment)
   * @param {string} email - Customer email
   * @returns {string} - License key
   */
  static generateLicenseKey(email) {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(16).toString('hex');
    const data = `${email}:${timestamp}:${randomStr}`;
    
    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(data);
    const signature = hmac.digest('hex');
    
    // License key format: data:signature (base64 encoded)
    const licenseKey = Buffer.from(`${data}:${signature}`).toString('base64');
    return licenseKey;
  }

  /**
   * Validate a license key locally
   * @param {string} licenseKey - License key to validate
   * @returns {object} - { valid: boolean, email: string, message: string }
   */
  static validateLicenseKey(licenseKey) {
    try {
      // Decode the license key
      const decoded = Buffer.from(licenseKey, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      
      if (parts.length < 4) {
        return { valid: false, message: 'Invalid license key format.' };
      }

      const email = parts[0];
      const timestamp = parts[1];
      const randomStr = parts[2];
      const providedSignature = parts[3];
      
      // Reconstruct the data and signature
      const data = `${email}:${timestamp}:${randomStr}`;
      const hmac = crypto.createHmac('sha256', SECRET_KEY);
      hmac.update(data);
      const expectedSignature = hmac.digest('hex');
      
      // Validate signature
      if (providedSignature !== expectedSignature) {
        return { valid: false, message: 'License key is invalid or tampered with.' };
      }

      // Check if license has expired (optional: 365 days)
      const keyTimestamp = parseInt(timestamp, 10);
      const expirationTime = keyTimestamp + (365 * 24 * 60 * 60 * 1000);
      if (Date.now() > expirationTime) {
        return { valid: false, message: 'License key has expired.' };
      }

      return { 
        valid: true, 
        email: email, 
        message: `License validated for ${email}` 
      };
    } catch (error) {
      return { valid: false, message: `License validation error: ${error.message}` };
    }
  }

  /**
   * Store the activated license locally
   * @param {string} licenseKey - License key
   */
  static storeLicense(licenseKey) {
    store.set('license', {
      key: licenseKey,
      activatedAt: new Date().toISOString(),
    });
  }

  /**
   * Retrieve stored license
   * @returns {object|null} - License object or null
   */
  static getStoredLicense() {
    return store.get('license', null);
  }

  /**
   * Check if app is licensed
   * @returns {boolean} - True if valid license exists
   */
  static isLicensed() {
    const license = this.getStoredLicense();
    if (!license) return false;

    const validation = this.validateLicenseKey(license.key);
    return validation.valid;
  }

  /**
   * Clear the stored license (for testing or deactivation)
   */
  static clearLicense() {
    store.delete('license');
  }
}

module.exports = LicenseValidator;
