# Stripe Integration Guide for Zenith

Complete step-by-step guide to set up Stripe payments for Zenith licenses.

---

## 🎯 Overview

**Simple Flow:**
1. Customer clicks Stripe payment link → Pays $15
2. Stripe confirms payment ✓
3. You generate license key: `node scripts/generate-license.js customer@email.com`
4. Send customer download link + license key via email
5. Customer downloads, installs, activates

**No backend server needed.** You handle step 3-4 manually (or automate later with webhooks).

---

## 📋 Part 1: Set Up Stripe Account

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up (free account)
3. Fill in basic info
4. Verify email

### Step 2: Access Dashboard
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. You're now in test mode by default
3. Test mode = no real money charged (perfect for testing)

---

## 💳 Part 2: Create Product & Price

### Step 1: Create Product
1. Dashboard → **Products** (left sidebar)
2. Click **"+ Add Product"**
3. Fill in:
   - **Name:** `Zenith - License Key`
   - **Description:** `Digital license key for Zenith daily planner application`
   - **Image:** (optional - upload Zenith logo if you have one)
4. Click **"Save product"**

### Step 2: Create Price
1. You're now in the product page
2. Scroll to **"Pricing"** section
3. Click **"+ Add price"**
4. Fill in:
   - **Price:** `15.00 USD`
   - **Billing period:** `One-time` (not recurring)
   - **Payment types:** Check `Card`
5. Click **"Save price"**

### Result
You now have:
- Product: "Zenith - License Key"
- Price: $15.00 USD, one-time

---

## 🔗 Part 3: Create Payment Link

Payment Links are the easiest way to sell - no coding required!

### Step 1: Create Payment Link
1. Dashboard → Products
2. Find **"Zenith - License Key"**
3. Click on it
4. Scroll down to **"Payment links"**
5. Click **"+ Create payment link"**

### Step 2: Configure Link
In the payment link settings:

**Billing Details:**
- [x] Email ← IMPORTANT (collect customer email)
- [x] Name
- [x] Address (optional)

**Automatic Emails:**
- Stripe will send customer receipt automatically

**Success Page:**
- After payment, show: "Thank you! You'll receive your license key via email within minutes."
- (Or link to a custom page if you have one)

### Step 3: Copy Link
1. Click **"Copy"** button
2. Save this URL somewhere:
   ```
   https://buy.stripe.com/test_xxxxxxxxxxxxx
   ```

---

## 🛒 Part 4: Test the Payment

### Step 1: Use Test Card
1. Open your payment link in a new tab
2. Fill in customer info (use test email)
3. Card number: `4242 4242 4242 4242`
4. Expiry: any future date (e.g., `12/25`)
5. CVC: any 3 digits (e.g., `123`)
6. Click **"Pay"**

### Step 2: Verify Payment
1. Go to Dashboard → **Payments**
2. You should see the test transaction
3. Status should be **"Succeeded"** ✓

---

## 📧 Part 5: Handle Payments (Manual Process)

### For Each Real Sale:

**Step 1: Check Stripe Dashboard**
1. Dashboard → Payments
2. See new payment from customer
3. Note the customer's email

**Step 2: Generate License Key**
```bash
node scripts/generate-license.js customer@email.com
```

Example output:
```
✅ License Key Generated

📧 Email:      customer@email.com
🔑 License:    ZXgSBw5c2Ty3qL9kM0pO...
⏰ Generated:   2024-04-25T06:07:00.000Z
⏳ Expires:     2025-04-25T06:07:00.000Z
```

**Step 3: Send Email to Customer**

Use Gmail, Outlook, or any email service. Template:

```
Subject: Your Zenith License - Download & Setup

Hello,

Thank you for purchasing Zenith! 🎉

Your License Key:
ZXgSBw5c2Ty3qL9kM0pO...

Download Zenith for Your OS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪟 Windows:
https://github.com/your-username/zenith/releases/download/v1.1.7/Zenith%20Setup%201.1.7.exe

🍎 macOS:
https://github.com/your-username/zenith/releases/download/v1.1.7/Zenith-1.1.7.dmg

🐧 Linux:
https://github.com/your-username/zenith/releases/download/v1.1.7/zenith-1.1.7.AppImage

Installation Steps:
1. Download the installer for your operating system
2. Run the installer and follow the setup wizard
3. Launch Zenith
4. When asked for a license key, paste: ZXgSBw5c2Ty3qL9kM0pO...
5. Done! ✨

License Details:
- Valid for: 365 days
- Expires: 2025-04-25
- Email: customer@email.com

Need help? Reply to this email.

Best regards,
Zenith Team
```

**Step 4: Record Sale**
Keep a spreadsheet (Google Sheets, Excel, etc.):

| Date | Email | License Key | Expires | Status |
|------|-------|-------------|---------|--------|
| 2024-04-25 | customer@email.com | ZXgSBw5c2... | 2025-04-25 | Sent |

---

## 🤖 Part 6: Automate (Advanced - Optional)

Once you're comfortable with manual process, you can automate it.

### Option A: Use Zapier (No Coding)

1. Sign up at [zapier.com](https://zapier.com)
2. Create Zap: Stripe → Google Sheets → Email
3. When payment succeeds → Auto-send license

### Option B: Use Stripe Webhooks (Coding)

Create a simple Node.js webhook server:

```javascript
// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const LicenseValidator = require('./src/license-validator');

const app = express();
app.use(express.json());

// Stripe webhook endpoint
app.post('/webhook/stripe', async (req, res) => {
  const event = req.body;

  if (event.type === 'payment_intent.succeeded') {
    const email = event.data.object.billing_details.email;
    
    // Generate license key
    const licenseKey = LicenseValidator.generateLicenseKey(email);
    
    // Send email to customer
    await sendLicenseEmail(email, licenseKey);
    
    res.json({ received: true });
  }
});

async function sendLicenseEmail(email, licenseKey) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Your Zenith License - Download & Setup',
    html: `<p>Thank you for purchasing Zenith!</p>
           <p>Your License Key: <strong>${licenseKey}</strong></p>
           <p>Download: https://github.com/your-username/zenith/releases</p>`,
  });
}

app.listen(3000, () => console.log('Webhook server running'));
```

For now, stick with **manual process** (Step 1-4 above). It's simple and works perfectly.

---

## 🚀 Part 7: Go Live with Real Payments

When you're ready for real money:

### Step 1: Switch to Live Mode
1. Dashboard → **Settings** (gear icon)
2. Click **"Account"**
3. Find **"Live mode"** toggle
4. Switch to **ON**
5. Confirm

⚠️ **Warning:** Once you enable live mode, real money will be charged!

### Step 2: Update Payment Link
1. You'll need to create a new payment link in **Live** mode
2. Same process as before, but now it charges real money
3. Use the new live link

### Step 3: Get Real API Keys (if building custom integration)
1. Settings → **API Keys** (if you need them later)
2. You'll see Live and Test keys
3. Keep these secret!

---

## 📊 Monitoring Payments

### Dashboard Shortcuts
- **Payments:** See all transactions
- **Customers:** See repeat customers
- **Payouts:** See money transferred to your bank
- **Reports:** Generate sales reports

### Payout Schedule
- By default: Money transfers to your bank **every 2 days**
- Minimum: $1
- Fee: 2.9% + $0.30 per transaction

### Example:
- Customer pays: $15
- Stripe fee: $0.72 (2.9% + $0.30)
- You receive: $14.28

---

## ✅ Checklist

- [ ] Create Stripe account
- [ ] Create "Zenith - License Key" product
- [ ] Create $15 USD price
- [ ] Create Payment Link
- [ ] Test payment with test card
- [ ] Verify payment appears in Dashboard
- [ ] Set up email templates
- [ ] Create spreadsheet for license tracking
- [ ] Share payment link with customers

---

## 🆘 Common Issues

### "Payment failed"
- Using test card? Should be: `4242 4242 4242 4242`
- Expiry in future? (e.g., 12/25)
- CVC correct? (any 3 digits for test)

### "Can't find payment in dashboard"
- Make sure you're in **Test mode** (toggle at top)
- Refresh the page
- Check "Payments" tab

### "Customer didn't receive email"
- Stripe sends receipt automatically
- You need to send separate email with license key
- Check spam folder

### "License key not validating"
- Make sure `SECRET_KEY` in `license-validator.js` matches
- Check license key wasn't corrupted in copy/paste
- Regenerate new key for customer

---

## 💡 Tips

1. **Keep email professional** - You represent your product
2. **Include clear instructions** - Make it easy to activate
3. **Track licenses** - Keep spreadsheet for support
4. **Test everything** - Use test mode before going live
5. **Automate later** - Start manual, automate when volume grows

---

## 📚 More Resources

- [Stripe Payment Links Docs](https://stripe.com/docs/payments/payment-links)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard Guide](https://stripe.com/docs/dashboard)

---

**You're ready to accept payments!** 🚀

Start with the manual process (Part 5), and scale up as needed.

Good luck! 💰
