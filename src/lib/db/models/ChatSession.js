import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    title: {
      type: String,
      default: "New Chat",
      trim: true,
      maxlength: 200,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ChatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionSchema);
