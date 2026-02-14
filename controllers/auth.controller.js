const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const VerificationToken = require('../models/VerificationToken');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');

// 1. REGISTRASI USER BARU
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validasi input
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Semua kolom wajib diisi!" });
        }

        // Cek apakah email/username sudah dipakai
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Email atau Username sudah terdaftar!" });
        }

        // Enkripsi Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan ke Database Atlas
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            stats: { level: 1, xp: 0, currentStreak: 0 } // Default stats
        });

        // Send welcome email (async, don't wait)
        sendWelcomeEmail(email, username).catch(err =>
            console.error('Failed to send welcome email:', err)
        );

        res.status(201).json({
            message: "Registrasi Berhasil! Silakan Login.",
            user: { id: newUser._id, username: newUser.username }
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email tidak ditemukan!" });
        }

        // Cek kecocokan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password salah!" });
        }

        // Buat Token (Tiket Masuk)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: "Login Berhasil!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};

// 3. FORGOT PASSWORD - Request reset code
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not (security)
            return res.json({ message: 'If that email exists, a reset code has been sent.' });
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save verification token
        await VerificationToken.create({
            userId: user._id,
            email: user.email,
            code: resetCode,
            type: 'password_reset',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        });

        // Send email
        await sendPasswordResetEmail(email, user.username, resetCode);

        res.json({
            message: 'Reset code has been sent to your email',
            email: email // Return email for UI confirmation
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 4. RESET PASSWORD - Verify code and update password
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Email, code, and new password are required' });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Find valid token
        const token = await VerificationToken.findOne({
            email,
            code,
            type: 'password_reset',
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!token) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        // Find user
        const user = await User.findById(token.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        // Mark token as used
        token.used = true;
        await token.save();

        res.json({ message: 'Password has been reset successfully. You can now login.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};