const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true,
    },
  },
  { timestamps: true },
);

// Satu user hanya boleh bookmark anime yang sama SEKALI
bookmarkSchema.index({ user: 1, anime: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
