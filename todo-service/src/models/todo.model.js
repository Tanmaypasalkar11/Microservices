const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Text index for search
todoSchema.index({ title: "text", description: "text" });

// Compound index for fast user queries
todoSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Todo", todoSchema);
