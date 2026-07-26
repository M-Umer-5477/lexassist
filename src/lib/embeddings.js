/**
 * Gemini Embedding Client
 * =======================
 * Uses @google/genai SDK with gemini-embedding-001 model.
 * Supports batch embedding with retry logic.
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMBEDDING_MODEL = "gemini-embedding-001";
const MAX_BATCH_SIZE = 100; // Max texts per API call
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // ms

/**
 * Generate an embedding vector for a single text.
 * @param {string} text
 * @returns {Promise<number[]>} 768-dimensional vector
 */
export async function embedText(text) {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });
  return result.embeddings[0].values;
}

/**
 * Generate an embedding vector for a query (uses RETRIEVAL_QUERY task type).
 * @param {string} query
 * @returns {Promise<number[]>} 768-dimensional vector
 */
export async function embedQuery(query) {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: query,
    config: {
      taskType: "RETRIEVAL_QUERY",
    },
  });
  return result.embeddings[0].values;
}

/**
 * Generate embeddings for multiple texts in batches.
 * Includes retry logic with exponential backoff.
 * @param {string[]} texts - Array of texts to embed
 * @param {function} onProgress - Optional callback (batchIndex, totalBatches)
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
export async function embedBatch(texts, onProgress) {
  const allEmbeddings = [];

  // Split into batches
  const batches = [];
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    batches.push(texts.slice(i, i + MAX_BATCH_SIZE));
  }

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];

    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const batchEmbeddings = [];

        // Embed each text in the batch individually
        // (Gemini embedding API handles one content at a time)
        for (const text of batch) {
          const result = await ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
            config: {
              taskType: "RETRIEVAL_DOCUMENT",
            },
          });
          batchEmbeddings.push(result.embeddings[0].values);
        }

        allEmbeddings.push(...batchEmbeddings);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        console.error(
          `Embedding batch ${batchIdx + 1}/${batches.length} failed (attempt ${attempt + 1}):`,
          error.message
        );

        if (attempt < MAX_RETRIES - 1) {
          const delay = BASE_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (lastError) {
      throw new Error(
        `Failed to embed batch ${batchIdx + 1} after ${MAX_RETRIES} attempts: ${lastError.message}`
      );
    }

    if (onProgress) {
      onProgress(batchIdx + 1, batches.length);
    }
  }

  return allEmbeddings;
}
