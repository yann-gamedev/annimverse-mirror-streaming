const Badge = require("../models/Badge");
const UserBadge = require("../models/UserBadge");

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ requirementThreshold: 1 });
    res.json(badges);
  } catch (err) {
    console.error("❌ Error fetching badges:", err.message);
    res.status(500).json({ message: "Gagal mengambil data badge." });
  }
};

// @desc    Get badges for a specific user
// @route   GET /api/users/:id/badges
// @access  Public
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find all UserBadges for this user and populate the actual Badge info
    const userBadges = await UserBadge.find({ user: userId })
      .populate("badge")
      .sort({ unlockedAt: -1 });
      
    res.json(userBadges);
  } catch (err) {
    console.error("❌ Error fetching user badges:", err.message);
    res.status(500).json({ message: "Gagal mengambil badge user." });
  }
};
