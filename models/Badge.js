const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  // Kode unik badge, misal: 'first_watch', 'streak_7'
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true, // Contoh: "Pendatang Baru"
  },
  description: {
    type: String,
    required: true, // Contoh: "Menonton episode anime pertama kali"
  },
  icon: {
    type: String,
    // Nama icon dari library Lucide, misal 'baby', 'flame', 'crown'
    default: "medal",
  },
  category: {
    type: String,
    enum: ["WATCH", "STREAK", "SOCIAL", "SPECIAL"],
    default: "WATCH",
  },
  // Syarat XP atau jumlah tontonan (opsional, buat logika nanti)
  requirementValue: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Badge", badgeSchema);
