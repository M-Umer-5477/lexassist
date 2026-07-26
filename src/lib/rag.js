/**
 * RAG Orchestrator
 * ================
 * The core engine that ties together:
 * 1. Query embedding
 * 2. Vector search (retrieval)
 * 3. Prompt construction (augmentation)
 * 4. LLM response (generation)
 */

import { embedQuery } from "./embeddings.js";
import { vectorSearch } from "./vectorSearch.js";
import { buildPrompt, generateResponse, generateStreamingResponse } from "./llm.js";

/**
 * Execute a full RAG query pipeline.
 * @param {object} params
 * @param {string} params.question - User's question
 * @param {string|string[]} params.documentIds - Document(s) to search
 * @param {string} params.userId - User ID for access control
 * @param {number} params.topK - Number of chunks to retrieve (default 5)
 * @param {boolean} params.stream - Whether to stream the response (default false)
 * @returns {Promise<{answer: string, sources: Array}>}
 */
export async function ragQuery({ question, documentIds, userId, topK = 5, stream = false }) {
  // Step 1: Embed the user's question
  const queryVector = await embedQuery(question);

  // Step 2: Retrieve relevant chunks via vector search
  const retrievedChunks = await vectorSearch(queryVector, {
    documentIds,
    userId,
    limit: topK,
    minScore: 0.4,
  });

  if (retrievedChunks.length === 0) {
    return {
      answer:
        "I could not find any relevant information in the uploaded document(s) to answer your question. Please try rephrasing your question or ensure the document has been fully processed.",
      sources: [],
    };
  }

  // Step 3: Build the prompt with retrieved context
  const prompt = buildPrompt(question, retrievedChunks);

  // Step 4: Generate the answer
  const answer = await generateResponse(prompt);

  // Step 5: Format sources for citation
  const sources = retrievedChunks.map((chunk) => ({
    documentId: chunk.documentId.toString(),
    documentName: chunk.documentName,
    pageNumber: chunk.pageNumber,
    chunkText: chunk.text.slice(0, 200) + (chunk.text.length > 200 ? "..." : ""),
    relevanceScore: Math.round(chunk.score * 100) / 100,
  }));

  return { answer, sources };
}

/**
 * Execute a RAG query with streaming response.
 * Returns the sources immediately and streams the answer.
 * @param {object} params - Same as ragQuery
 * @returns {Promise<{stream: AsyncGenerator<string>, sources: Array}>}
 */
export async function ragQueryStream({ question, documentIds, userId, topK = 5 }) {
  // Step 1: Embed the user's question
  const queryVector = await embedQuery(question);

  // Step 2: Retrieve relevant chunks
  const retrievedChunks = await vectorSearch(queryVector, {
    documentIds,
    userId,
    limit: topK,
    minScore: 0.4,
  });

  if (retrievedChunks.length === 0) {
    return {
      stream: (async function* () {
        yield "I could not find any relevant information in the uploaded document(s) to answer your question. Please try rephrasing your question or ensure the document has been fully processed.";
      })(),
      sources: [],
    };
  }

  // Step 3: Build prompt
  const prompt = buildPrompt(question, retrievedChunks);

  // Step 4: Get streaming response
  const responseStream = generateStreamingResponse(prompt);

  // Step 5: Format sources
  const sources = retrievedChunks.map((chunk) => ({
    documentId: chunk.documentId.toString(),
    documentName: chunk.documentName,
    pageNumber: chunk.pageNumber,
    chunkText: chunk.text.slice(0, 200) + (chunk.text.length > 200 ? "..." : ""),
    relevanceScore: Math.round(chunk.score * 100) / 100,
  }));

  return { stream: responseStream, sources };
}
