const crypto = require('crypto');
const Store = require('electron-store');
const https = require('https');
const config = require('./config');

const store = new Store();

/**
 * Lemonsqueezy License Validator
 * Validates license keys purchased through Lemonsqueezy
 * Works online and offline (caches validation results)
 */
class LemonsqueezyLicenseValidator {
  constructor() {
    // Get Lemonsqueezy API key from config
    this.lemonsqueezyApiKey = config.lemonsqueezy.apiKey;
    this.apiEndpoint = config.lemonsqueezy.apiEndpoint;
    
    // Debug logging
    if (!this.lemonsqueezyApiKey) {
      console.warn('⚠️  WARNING: LEMONSQUEEZY_API_KEY not set in .env file');
      console.warn('   Lemonsqueezy validation will not work until API key is configured');
    } else {
      console.log('✓ Lemonsqueezy API key loaded successfully');
    }
  }

  /**
   * Validate a Lemonsqueezy license key
   * First tries online validation, falls back to cached validation
   * @param {string} licenseKey - License key to validate
   * @returns {Promise<object>} - { valid: boolean, email: string, message: string, cached: boolean }
   */
  async validateLicenseKey(licenseKey) {
    try {
      // First, try online validation if API key is available
      if (this.lemonsqueezyApiKey) {
        const onlineResult = await this.validateOnline(licenseKey);
        if (onlineResult.valid) {
          // Cache the result for offline use
          this.cacheLicenseValidation(licenseKey, onlineResult);
          return { ...onlineResult, cached: false };
        }
      }

      // If online validation fails or no API key, try cached validation
      const cachedResult = this.validateFromCache(licenseKey);
      if (cachedResult.valid) {
        return { ...cachedResult, cached: true, warning: 'Using cached validation. Please connect to internet to verify.' };
      }

      // Both online and cache failed
      return {
        valid: false,
        message: 'License key is invalid. Please check your key and try again.',
        cached: false
      };
    } catch (error) {
      console.error('License validation error:', error);
      
      // Last resort: try cache
      const cachedResult = this.validateFromCache(licenseKey);
      if (cachedResult.valid) {
        return { 
          ...cachedResult, 
          cached: true, 
          warning: 'Using cached validation. Please connect to internet to verify.' 
        };
      }

      return { 
        valid: false, 
        message: `Validation error: ${error.message}`,
        cached: false
      };
    }
  }

  /**
   * Validate license key online via Lemonsqueezy License API
   * Uses form-urlencoded POST (not JSON) as per Lemonsqueezy License API spec
   * @param {string} licenseKey - License key
   * @returns {Promise<object>} - Validation result
   */
 async validateOnline(licenseKey) {
    console.log('=== LICENSE DEBUG ===');
    console.log('API Key present:', this.lemonsqueezyApiKey ? 'YES' : 'NO');
    console.log('API Key length:', this.lemonsqueezyApiKey.length);
    console.log('Endpoint:', this.apiEndpoint);
    console.log('License key:', licenseKey);
    console.log('===================');
    return new Promise((resolve, reject) => {
      // Lemonsqueezy License API requires form-urlencoded data
      const postData = `license_key=${encodeURIComponent(licenseKey)}`;

      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      };

      const req = https.request(this.apiEndpoint, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            // Lemonsqueezy License API response format
            // See: https://docs.lemonsqueezy.com/api/license-api/validate-license-key
            if (response.valid === true) {
              const meta = response.meta || {};
              const expiresAt = response.meta?.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
              
              return resolve({
                valid: true,
                email: meta.customer_email || 'customer@zenith.app',
                expiresAt: expiresAt,
                message: `License validated for ${meta.customer_email || 'your account'}`
              });
            } else {
              return resolve({
                valid: false,
                message: response.error || 'License key is invalid or has expired.'
              });
            }
          } catch (error) {
            reject(new Error(`Failed to parse API response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Validate license key from local cache (for offline use)
   * @param {string} licenseKey - License key
   * @returns {object} - Validation result
   */
  validateFromCache(licenseKey) {
    try {
      const cachedLicenses = store.get('cached_licenses', {});
      const hashedKey = this.hashKey(licenseKey);
      const cached = cachedLicenses[hashedKey];

      if (!cached) {
        return { valid: false, message: 'License not found in cache.' };
      }

      // Check if cached license has expired
      const expiresAt = new Date(cached.expiresAt);
      if (new Date() > expiresAt) {
        // Remove expired license from cache
        delete cachedLicenses[hashedKey];
        store.set('cached_licenses', cachedLicenses);
        return { valid: false, message: 'Cached license has expired.' };
      }

      return {
        valid: true,
        email: cached.email,
        expiresAt: cached.expiresAt,
        message: `License validated for ${cached.email} (offline)`
      };
    } catch (error) {
      return { valid: false, message: `Cache validation error: ${error.message}` };
    }
  }

  /**
   * Cache a successful license validation for offline use
   * @param {string} licenseKey - License key
   * @param {object} validationResult - Result from online validation
   */
  cacheLicenseValidation(licenseKey, validationResult) {
    try {
      const cachedLicenses = store.get('cached_licenses', {});
      const hashedKey = this.hashKey(licenseKey);

      cachedLicenses[hashedKey] = {
        email: validationResult.email,
        expiresAt: validationResult.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        cachedAt: new Date().toISOString()
      };

      store.set('cached_licenses', cachedLicenses);
    } catch (error) {
      console.error('Failed to cache license:', error);
    }
  }

  /**
   * Hash the license key for storage (don't store keys in plain text)
   * @param {string} licenseKey - License key
   * @returns {string} - Hashed key
   */
  hashKey(licenseKey) {
    return crypto.createHash('sha256').update(licenseKey).digest('hex');
  }

  /**
   * Store the activated license locally
   * @param {string} licenseKey - License key
   */
  storeLicense(licenseKey) {
    store.set('license', {
      key: this.hashKey(licenseKey), // Store hashed key for security
      activatedAt: new Date().toISOString(),
      plainKey: licenseKey // Store plain key separately for validation
    });
  }

  /**
   * Retrieve stored license key (hashed)
   * @returns {object|null} - License object or null
   */
  getStoredLicense() {
    return store.get('license', null);
  }

  /**
   * Check if app is licensed
   * @returns {Promise<boolean>} - True if valid license exists
   */
  async isLicensed() {
    const license = this.getStoredLicense();
    if (!license) return false;

    const validation = await this.validateLicenseKey(license.plainKey);
    return validation.valid;
  }

  /**
   * Clear the stored license (for testing or deactivation)
   */
  clearLicense() {
    store.delete('license');
  }

  /**
   * Clear cached licenses
   */
  clearCache() {
    store.delete('cached_licenses');
  }
}

module.exports = LemonsqueezyLicenseValidator;
