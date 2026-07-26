/**
 * MongoDB Atlas Vector Search
 * ===========================
 * Performs semantic similarity search using $vectorSearch aggregation.
 *
 * PREREQUISITE: You must create a Vector Search index in MongoDB Atlas:
 * - Index name: "vector_index"
 * - Collection: "chunks"
 * - Field mapping: embedding (vector, 768 dimensions, cosine similarity)
 *
 * Atlas UI → Database → Search → Create Search Index → JSON Editor:
 * {
 *   "fields": [{
 *     "type": "vector",
 *     "path": "embedding",
 *     "numDimensions": 768,
 *     "similarity": "cosine"
 *   }]
 * }
 */

import mongoose from "mongoose";
import Chunk from "./db/models/Chunk.js";

/**
 * Search for the most semantically similar chunks to a query vector.
 * @param {number[]} queryVector - The query embedding vector (768 dims)
 * @param {object} options
 * @param {string|string[]} options.documentIds - Filter by document(s)
 * @param {string} options.userId - Filter by user (security)
 * @param {number} options.limit - Number of results (default 5)
 * @param {number} options.minScore - Minimum similarity score (default 0.5)
 * @returns {Promise<Array<{text: string, pageNumber: number, chunkIndex: number, documentId: string, score: number, documentName: string}>>}
 */
export async function vectorSearch(queryVector, options = {}) {
  const {
    documentIds,
    userId,
    limit = 5,
    minScore = 0.5,
  } = options;

  // Build pre-filter for $vectorSearch
  const filter = {};

  if (userId) {
    filter.userId = new mongoose.Types.ObjectId(userId);
  }

  if (documentIds) {
    const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
    if (ids.length === 1) {
      filter.documentId = new mongoose.Types.ObjectId(ids[0]);
    } else {
      filter.documentId = {
        $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
  }

  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryVector,
        numCandidates: limit * 10,
        limit: limit,
        filter: filter,
      },
    },
    {
      $project: {
        _id: 1,
        text: 1,
        pageNumber: 1,
        chunkIndex: 1,
        documentId: 1,
        metadata: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
    // Join with documents collection to get filename
    {
      $lookup: {
        from: "documents",
        localField: "documentId",
        foreignField: "_id",
        as: "document",
      },
    },
    {
      $unwind: {
        path: "$document",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        text: 1,
        pageNumber: 1,
        chunkIndex: 1,
        documentId: 1,
        score: 1,
        documentName: "$document.originalName",
        sectionHeader: "$metadata.sectionHeader",
      },
    },
  ];

  const results = await Chunk.aggregate(pipeline);

  // Filter by minimum score
  return results.filter((r) => r.score >= minScore);
}
