const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Yang nulis komen
      required: true,
    },
    episode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Episode", // Komen di episode mana
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500, // Batasi panjang komen
    },
  },
  { timestamps: true },
); // Otomatis ada createdAt (Waktu komen)

module.exports = mongoose.model("Comment", commentSchema);
