const Anime = require("../models/Anime");
const Episode = require("../models/Episode");
const User = require("../models/User");
const Badge = require("../models/Badge");

// ==========================================
// GET STATISTICS
// ==========================================
exports.getStats = async (req, res) => {
  try {
    // Cek apakah user yang request adalah admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const totalAnime = await Anime.countDocuments();
    const totalEpisodes = await Episode.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBadges = await Badge.countDocuments();

    res.json({
      totalAnime,
      totalEpisodes,
      totalUsers,
      totalBadges,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==========================================
// CREATE BADGE
// ==========================================
exports.createBadge = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const { code, name, description, icon, category, requirementValue } =
      req.body;

    if (!code || !name) {
      return res.status(400).json({ message: "Kode dan Nama wajib diisi!" });
    }

    // Cek apakah kode badge sudah ada
    const exists = await Badge.findOne({ code });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Badge dengan kode ini sudah ada!" });
    }

    const newBadge = await Badge.create({
      code,
      name,
      description,
      icon: icon || "medal",
      category: category || "WATCH",
      requirementValue: requirementValue || 1,
    });

    res.status(201).json({
      message: "Badge berhasil dibuat!",
      data: newBadge,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat badge", error: error.message });
  }
};

// ==========================================
// GET ALL USERS
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ==========================================
// UPDATE USER ROLE
// ==========================================
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role tidak valid!" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({
      message: "Role berhasil diubah!",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
