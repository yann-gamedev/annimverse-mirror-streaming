const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 1. AMBIL DATA PROFIL
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. UPLOAD AVATAR
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Pilih foto dulu!" });
    const avatarUrl = `/storage/avatars/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarUrl },
      { new: true },
    ).select("-password");
    res.json({
      message: "Avatar berhasil diganti!",
      avatarUrl,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal upload", error: error.message });
  }
};

// 3. [BARU] UPDATE PROFIL (Nama, Email, Password)
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, password, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Update Info Dasar
    if (username) user.username = username;
    if (email) user.email = email;

    // Update Password (Jika ada request ganti password)
    if (password && newPassword) {
      // Cek password lama dulu
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Password lama salah!" });

      // Hash password baru
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Kembalikan data user tanpa password
    const userData = user.toObject();
    delete userData.password;

    res.json({ message: "Profil berhasil diperbarui!", user: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal update profil", error: error.message });
  }
};

// 4. GET USER STATS
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("stats");
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== PHASE 4: GAMIFICATION ==========

// 5. Get User's Earned Badges
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("badges");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      badges: user.badges,
      totalBadges: user.badges.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Get All Available Badges
exports.getAllBadges = async (req, res) => {
  try {
    const Badge = require("../models/Badge");
    const badges = await Badge.find().sort({
      category: 1,
      requirementValue: 1,
    });

    res.json({
      badges,
      total: badges.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Leaderboard - Top Users
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = "xp", limit = 20 } = req.query;

    let sortField = {};

    switch (type) {
      case "xp":
        sortField = { "stats.xp": -1 };
        break;
      case "level":
        sortField = { "stats.level": -1, "stats.xp": -1 };
        break;
      case "watchtime":
        sortField = { "stats.totalWatchTime": -1 };
        break;
      case "streak":
        sortField = { "stats.currentStreak": -1 };
        break;
      default:
        sortField = { "stats.xp": -1 };
    }

    const users = await User.find()
      .sort(sortField)
      .limit(parseInt(limit))
      .select("username avatar stats badges")
      .populate("badges");

    // Add ranking
    const rankedUsers = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      avatar: user.avatar,
      stats: user.stats,
      badgeCount: user.badges.length,
    }));

    res.json({
      leaderboard: rankedUsers,
      type,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
