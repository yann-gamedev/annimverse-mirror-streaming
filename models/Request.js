const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    animeTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    malId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    adminNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for vote count
requestSchema.virtual("voteCount").get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Ensure virtuals are included when converting to JSON
requestSchema.set("toJSON", { virtuals: true });
requestSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Request", requestSchema);
