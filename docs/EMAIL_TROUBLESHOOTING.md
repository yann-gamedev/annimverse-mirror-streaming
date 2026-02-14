# Email Configuration Troubleshooting Guide

## Issue: Gmail SMTP Connection Failed

### Option 1: Fix Gmail Authentication (Recommended)

**The app password you have is correct, but Gmail might be blocking the connection.**

#### Step-by-Step Fix:

1. **Enable 2-Step Verification** (if not already):
   - Go to: https://myaccount.google.com/security
   - Turn ON "2-Step Verification"

2. **Allow Less Secure Apps** (for older accounts):
   - Go to: https://myaccount.google.com/lesssecureapps
   - Turn this ON

3. **Unlock CAPTCHA** (important!):
   - Go to: https://accounts.google.com/DisplayUnlockCaptcha
   - Click "Continue" to allow access

4. **Check Gmail Settings**:
   - Go to Gmail → Settings → Forwarding and POP/IMAP
   - Make sure IMAP is enabled

5. **Test the connection again**:
   ```bash
   node test-email.js
   ```

### Option 2: Use Alternative Email Service

If Gmail continues to fail, you can use other free SMTP services:

#### **SendGrid** (Free 100 emails/day):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
SMTP_FROM=annimversea@gmail.com
```

#### **Mailgun** (Free 5,000 emails/month):
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=<your-mailgun-username>
SMTP_PASS=<your-mailgun-password>
SMTP_FROM=annimversea@gmail.com
```

### Option 3: Disable Email Features Temporarily

If you want to skip email for now:

1. The app will work without email - it just won't send welcome/reset emails
2. Password reset can be done manually via MongoDB
3. You can enable it later when ready

### Current Configuration Status

✅ App Password Created: `rrpztdgamtnbinoe`
✅ SMTP Settings configured
❌ Connection Failed

**Most Likely Issue**: Gmail is blocking the connection due to security settings.

**Quick Fix**: Try the CAPTCHA unlock link above, then test again!

---

## Testing Commands

```bash
# Test email configuration
node test-email.js

# Start server (works even if email is not configured)
node server.js
```

The application will continue to function normally. Email errors won't crash the server - they'll just log a warning.
