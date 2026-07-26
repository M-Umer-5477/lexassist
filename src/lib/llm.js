/**
 * Gemini LLM Client
 * =================
 * Uses @google/genai SDK with gemini-3.5-flash for answer generation.
 * Supports streaming for real-time response rendering.
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LLM_MODEL = "gemini-3.5-flash";

/**
 * The system prompt that instructs the LLM to act as a legal document assistant.
 * Critical: the model must ONLY use provided context and cite sources.
 */
const SYSTEM_PROMPT = `You are LexAssist, an AI-powered legal document assistant. Your role is to answer questions about legal documents accurately and helpfully.

STRICT RULES:
1. Answer ONLY using the provided document context below. Do NOT use your general knowledge.
2. If the answer is not in the context, say: "I could not find this information in the provided document(s)."
3. For every factual claim, cite the source using this format: [Source: Document Name, Page X]
4. Use clear, plain English. Avoid unnecessary legal jargon unless quoting the document.
5. When quoting directly from the document, use quotation marks and cite the source.
6. If a question is ambiguous, explain what you found and ask for clarification.
7. NEVER provide legal advice. You only analyze document content.
8. Structure your answers with headers and bullet points when appropriate for readability.

DISCLAIMER: You are an AI assistant that analyzes document content. Your responses are NOT legal advice. Always consult a qualified attorney for legal decisions.`;

/**
 * Build the RAG prompt with retrieved context chunks.
 * @param {string} question - User's question
 * @param {Array<{text: string, documentName: string, pageNumber: number}>} chunks - Retrieved chunks
 * @returns {string}
 */
export function buildPrompt(question, chunks) {
  const contextParts = chunks.map(
    (chunk, i) =>
      `[Context ${i + 1} — "${chunk.documentName}", Page ${chunk.pageNumber}]\n${chunk.text}`
  );

  const context = contextParts.join("\n\n---\n\n");

  return `DOCUMENT CONTEXT:
${context}

---

USER QUESTION: ${question}

Please answer the question using ONLY the document context above. Cite sources for each claim.`;
}

/**
 * Generate a response using the LLM (non-streaming).
 * @param {string} prompt - The full prompt with context
 * @returns {Promise<string>}
 */
export async function generateResponse(prompt) {
  const response = await ai.models.generateContent({
    model: LLM_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.2, // Low temperature for factual accuracy
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });

  return response.text;
}

/**
 * Generate a streaming response using the LLM.
 * Returns an async generator of text chunks.
 * @param {string} prompt - The full prompt with context
 * @returns {AsyncGenerator<string>}
 */
export async function* generateStreamingResponse(prompt) {
  const response = await ai.models.generateContentStream({
    model: LLM_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

/**
 * Generate a document summary.
 * @param {string} documentText - Concatenated document text (first ~5000 chars)
 * @param {string} documentName - Name of the document
 * @returns {Promise<string>}
 */
export async function generateSummary(documentText, documentName) {
  const summaryPrompt = `Provide a comprehensive plain-English summary of the following legal document: "${documentName}"

Document content:
${documentText.slice(0, 8000)}

Structure your summary as:
1. **Document Type**: What kind of document this is
2. **Parties Involved**: Who are the parties (if applicable)
3. **Key Terms**: The most important terms, conditions, or provisions
4. **Important Dates/Deadlines**: Any critical dates mentioned
5. **Notable Clauses**: Any unusual or particularly important clauses
6. **Summary**: A 2-3 paragraph plain-English overview

Remember: This is document analysis, NOT legal advice.`;

  const response = await ai.models.generateContent({
    model: LLM_MODEL,
    contents: summaryPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  return response.text;
}
