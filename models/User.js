const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "", // Bisa kosong atau link default
    },
    bio: {
      type: String,
      default: "",
    },
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      autoplay: { type: Boolean, default: true },
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Anime",
      },
    ],
    // Statistik User & Gamifikasi (Disederhanakan)
    stats: {
      level: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
      totalWatchTime: { type: Number, default: 0 }, // menit
    },
    // Badges earned by user
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
    // Tracking for badge logic
    watchHistory: {
      watchedGenres: [{ type: String }], // Track unique genres watched
      todayEpisodesCount: { type: Number, default: 0 },
      lastEpisodeDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
