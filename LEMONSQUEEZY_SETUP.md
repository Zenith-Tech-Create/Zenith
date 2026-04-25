# 🍋 Lemonsqueezy Integration Setup Guide

This guide walks you through setting up Zenith to validate customer license keys purchased through Lemonsqueezy.

---

## 📋 **Overview**

Zenith now validates license keys through **Lemonsqueezy's API**:

✅ **Customers buy** on Lemonsqueezy  
✅ **Lemonsqueezy emails** them the license key  
✅ **Customers run** the Zenith setup script  
✅ **Zenith validates** the key online (or from cache if offline)  
✅ **App launches** and customer is happy!  

---

## 🔧 **Step 1: Get Your Lemonsqueezy API Key**

### In Lemonsqueezy Dashboard:

1. Go to **Settings** → **API Tokens**
2. Click **Create New Token**
3. Give it a name: `Zenith License Validation`
4. Select scope: **`license_validate`** (or full access)
5. Click **Create**
6. **Copy the token** (you'll only see it once!)

Your token looks like: `sk_test_xxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔑 **Step 2: Configure Zenith with API Key**

### On Your Development Machine:

1. Open the Zenith project folder
2. Find the `.env` file
3. Replace the empty value with your API key:

```bash
# .env
LEMONSQUEEZY_API_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANT:** Never commit `.env` to git (it's in `.gitignore` for security)

---

## 🧪 **Step 3: Test the Integration**

### Test in Development:

```bash
cd "/Users/localaiworkstation/Desktop/zenith v 1.1.7"
npm install  # Install dotenv package
npm start
```

The app should:
1. Load the API key from `.env`
2. Show the License Activation window
3. Accept a valid Lemonsqueezy license key
4. Validate it online
5. Launch the main app

### Generate a Test License Key:

In Lemonsqueezy:
1. Create a free test product
2. Process a test purchase (use test card: `4111 1111 1111 1111`)
3. Get a test license key
4. Paste it in Zenith's activation window

---

## 🛒 **Step 4: Set Up Lemonsqueezy for Customers**

### Create Your Zenith Product:

1. **Go to Lemonsqueezy Dashboard**
2. **Products** → **Create Product**
3. **Product Details:**
   - Name: `Zenith Personal Life OS`
   - Price: `$15.00`
   - Description:
     ```
     Complete personal life management system:
     - Task & goal management
     - Habit tracking
     - Fitness & nutrition logging
     - Finance tracking
     - AI assistant
     - Local data storage (no cloud sync)
     - 1-year license with update access
     ```

4. **License Keys:**
   - ✅ Enable "Automatically generate license keys on purchase"
   - Set expiration: 365 days

5. **Digital Files:**
   - Upload the setup scripts:
     - `Setup-Zenith-Windows.bat`
     - `Setup-Zenith.command`
     - `Setup-Zenith.sh`
     - `QUICK-SETUP.md`

6. **Email Template:**
   - Customize purchase confirmation email:
     ```
     Thank you for purchasing Zenith! 🎉
     
     Your License Key:
     [LICENSE_KEY]
     
     Getting Started:
     1. Download the setup script for your OS (attached)
     2. Double-click to run
     3. Enter your license key when prompted
     4. Zenith launches!
     
     Questions? Email support@zenith-app.com
     ```

---

## 📦 **Step 5: Distribute to Customers**

### When a Customer Purchases:

Lemonsqueezy automatically sends them:
- ✅ License key
- ✅ Download links to setup scripts
- ✅ QUICK-SETUP.md guide

They run the script and Zenith validates their key!

---

## 🔄 **How License Validation Works**

```
Customer enters key → Zenith sends to Lemonsqueezy API
                      ↓
                Lemonsqueezy validates
                      ↓
                Key is valid? → Cache it locally
                      ↓
                App launches!
                      
(If offline: Use cached validation instead)
```

### Offline Support:

- First launch: Validates online, caches result
- Subsequent launches: Uses cache (no internet needed)
- Cache expires: After 365 days (customer must renew license)

---

## 🆘 **Troubleshooting**

### "License validation failed"
- Check API key is correct in `.env`
- Make sure Lemonsqueezy API is up
- Verify customer key was generated in Lemonsqueezy
- Check internet connection

### "Connection timeout"
- Network issue, Zenith will use cached validation if available
- Customer should try again with internet

### "License expired"
- Customer's 365-day license is up
- They need to purchase renewal for $15

---

## 🚀 **Production Deployment**

### For Distribution:

1. **Don't distribute `.env` file** with your binary
2. Instead, add API key during build:
   ```bash
   export LEMONSQUEEZY_API_KEY=sk_prod_xxxxx
   npm run build
   ```

3. Or, embed in your installer setup

4. Test with real Lemonsqueezy API key (not test key)

---

## 📊 **Features**

✅ **Online validation** - Checks with Lemonsqueezy API  
✅ **Offline mode** - Uses local cache if no internet  
✅ **Automatic caching** - Validates once, works offline  
✅ **Expiration tracking** - Licenses expire after 365 days  
✅ **Error handling** - Clear messages if validation fails  
✅ **Security** - Keys never stored in plain text  

---

## 💡 **Next Steps**

1. ✅ Get Lemonsqueezy API key
2. ✅ Add it to `.env` file
3. ✅ Test with `npm start`
4. ✅ Create product in Lemonsqueezy
5. ✅ Upload setup files
6. ✅ Create checkout link
7. ✅ Share with customers!

---

## 📞 **Support**

**Lemonsqueezy Help:** https://help.lemonsqueezy.com  
**Zenith Support:** support@zenith-app.com

---

## 🎉 **You're Ready to Sell!**

Your Zenith app now validates customer licenses automatically through Lemonsqueezy.

**Customers get:**
- One-click installation
- Automatic license key delivery
- Offline license support
- Professional experience

**You get:**
- Automatic payment processing
- Automatic file delivery
- Automatic license management
- Time to focus on features! 💡

**Let's make some money!** 💰
