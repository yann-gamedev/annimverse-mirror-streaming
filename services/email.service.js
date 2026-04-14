const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send welcome email
exports.sendWelcomeEmail = async (userEmail, username) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || `"ANNIMVERSE" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "🎉 Welcome to ANNIMVERSE!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #0f0f11; color: #e0e0e0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #8b5cf6; }
            .content { background: #1a1a1d; border-radius: 16px; padding: 30px; border: 1px solid rgba(139, 92, 246, 0.2); }
            .title { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 20px; }
            .message { font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 20px; }
            .button { display: inline-block; background: linear-gradient(90deg, #7c3aed, #2563eb); color: white; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
            .feature { background: rgba(139, 92, 246, 0.1); border-left: 3px solid #8b5cf6; padding: 15px; margin: 15px 0; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎬 ANNIMVERSE</div>
            </div>
            
            <div class="content">
              <h1 class="title">Welcome, ${username}! 🎉</h1>
              
              <p class="message">
                Terima kasih telah bergabung dengan ANNIMVERSE - platform streaming anime pribadi dengan sistem gamifikasi yang seru!
              </p>
              
              <p class="message">
                Sekarang kamu bisa:
              </p>
              
              <div class="feature">
                🎬 <strong>Menonton ribuan anime</strong> dengan kualitas tinggi dan tanpa iklan
              </div>
              
              <div class="feature">
                🏆 <strong>Dapatkan Badge & Trophy</strong> dari aktivitas menonton kamu
              </div>
              
              <div class="feature">
                🔥 <strong>Pertahankan Watching Streak</strong> dan raih level tertinggi
              </div>
              
              <div class="feature">
                📝 <strong>Request Anime</strong> yang kamu inginkan
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.BASE_URL || "https://annimverse.vercel.app"}/menu.html" class="button">Mulai Menonton Sekarang</a>
              </div>
              
              <p class="message" style="margin-top: 30px;">
                Jika ada pertanyaan, jangan ragu untuk menghubungi kami!
              </p>
              
              <p class="message">
                Happy watching! 🍿<br>
                <strong>Team ANNIMVERSE</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© 2024 ANNIMVERSE - Private Anime Streaming Platform</p>
              <p>Email ini dikirim otomatis, mohon tidak membalas.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return false;
  }
};

// Send password reset code
exports.sendPasswordResetEmail = async (userEmail, username, resetCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || `"ANNIMVERSE" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "🔐 Reset Password - ANNIMVERSE",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #0f0f11; color: #e0e0e0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #8b5cf6; }
            .content { background: #1a1a1d; border-radius: 16px; padding: 30px; border: 1px solid rgba(139, 92, 246, 0.2); }
            .title { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 20px; }
            .message { font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 20px; }
            .code-box { background: rgba(139, 92, 246, 0.2); border: 2px solid #8b5cf6; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0; }
            .code { font-size: 32px; font-weight: bold; color: #8b5cf6; letter-spacing: 8px; font-family: monospace; }
            .warning { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 8px; color: #fca5a5; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎬 ANNIMVERSE</div>
            </div>
            
            <div class="content">
              <h1 class="title">Reset Password</h1>
              
              <p class="message">
                Hi ${username},
              </p>
              
              <p class="message">
                Kami menerima permintaan untuk reset password akun kamu. Gunakan kode verifikasi di bawah ini:
              </p>
              
              <div class="code-box">
                <div class="code">${resetCode}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">Kode ini berlaku selama 15 menit</p>
              </div>
              
              <p class="message">
                Masukkan kode ini di halaman reset password untuk melanjutkan.
              </p>
              
              <div class="warning">
                ⚠️ <strong>Perhatian:</strong> Jika kamu tidak meminta reset password, abaikan email ini. Akun kamu tetap aman.
              </div>
              
              <p class="message">
                Salam,<br>
                <strong>Team ANNIMVERSE</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© 2024 ANNIMVERSE - Private Anime Streaming Platform</p>
              <p>Email ini dikirim otomatis, mohon tidak membalas.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Failed to send reset email:", error);
    return false;
  }
};

// Test email configuration
exports.testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return false;
  }
};
