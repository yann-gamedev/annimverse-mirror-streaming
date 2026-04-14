const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema(
  {
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anime",
      required: true,
    },
    episodeNumber: { type: Number, required: true },
    title: { type: String, default: "Episode Baru" },
    gdriveId: { type: String, required: true },
    duration: { type: Number, default: 24 },
    views: { type: Number, default: 0 },

    // [BARU] Menyimpan daftar ID user yang me-like
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

episodeSchema.index({ anime: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model("Episode", episodeSchema);
