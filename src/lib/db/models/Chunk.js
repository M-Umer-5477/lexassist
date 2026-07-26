import mongoose from "mongoose";

const ChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    /**
     * The embedding vector array.
     * Gemini embedding-001 produces 768-dimensional vectors.
     * MongoDB Atlas Vector Search index must be created on this field.
     */
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      sectionHeader: { type: String, default: null },
      charStart: { type: Number, default: 0 },
      charEnd: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient retrieval
ChunkSchema.index({ documentId: 1, chunkIndex: 1 });
ChunkSchema.index({ userId: 1, documentId: 1 });

export default mongoose.models.Chunk || mongoose.model("Chunk", ChunkSchema);
