/**
 * Hand-written Recursive Character Text Splitter
 * ================================================
 * Splits text into chunks for embedding, using a recursive approach
 * that tries to split on the most semantically meaningful boundaries first.
 *
 * Split hierarchy: paragraph → newline → sentence → space → character
 *
 * This is NOT a LangChain import — it demonstrates understanding of
 * how chunking works under the hood.
 */

const DEFAULT_SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""];

/**
 * Split text into overlapping chunks.
 * @param {string} text - The full text to split
 * @param {object} options
 * @param {number} options.chunkSize - Target chunk size in characters (default 750)
 * @param {number} options.chunkOverlap - Overlap between chunks in characters (default 150)
 * @param {string[]} options.separators - Ordered list of separators to try
 * @returns {string[]} Array of text chunks
 */
export function splitText(text, options = {}) {
  const {
    chunkSize = 750,
    chunkOverlap = 150,
    separators = DEFAULT_SEPARATORS,
  } = options;

  if (!text || text.trim().length === 0) return [];
  if (text.length <= chunkSize) return [text.trim()];

  return recursiveSplit(text, separators, chunkSize, chunkOverlap);
}

/**
 * Recursively split text using the separator hierarchy.
 */
function recursiveSplit(text, separators, chunkSize, chunkOverlap) {
  const finalChunks = [];

  // Find the best separator that exists in the text
  let separator = "";
  let nextSeparators = [];

  for (let i = 0; i < separators.length; i++) {
    if (separators[i] === "") {
      separator = "";
      nextSeparators = [];
      break;
    }
    if (text.includes(separators[i])) {
      separator = separators[i];
      nextSeparators = separators.slice(i + 1);
      break;
    }
  }

  // Split on the chosen separator
  const splits = separator ? text.split(separator) : [...text];

  // Merge small splits into chunks
  let currentChunks = [];
  let currentLength = 0;

  for (const split of splits) {
    const splitWithSep = split; // We handle separator re-insertion below
    const splitLen = splitWithSep.length + (separator ? separator.length : 0);

    // If adding this split would exceed chunk size, finalize current chunk
    if (currentLength + splitLen > chunkSize && currentChunks.length > 0) {
      const chunk = joinChunks(currentChunks, separator);

      if (chunk.length > chunkSize && nextSeparators.length > 0) {
        // Chunk is still too big — recursively split further
        const subChunks = recursiveSplit(
          chunk,
          nextSeparators,
          chunkSize,
          chunkOverlap
        );
        finalChunks.push(...subChunks);
      } else if (chunk.trim().length > 0) {
        finalChunks.push(chunk.trim());
      }

      // Calculate overlap: keep enough trailing chunks to maintain overlap
      while (currentLength > chunkOverlap && currentChunks.length > 1) {
        const removed = currentChunks.shift();
        currentLength -= removed.length + (separator ? separator.length : 0);
      }
    }

    currentChunks.push(splitWithSep);
    currentLength += splitLen;
  }

  // Handle remaining chunks
  if (currentChunks.length > 0) {
    const chunk = joinChunks(currentChunks, separator);
    if (chunk.length > chunkSize && nextSeparators.length > 0) {
      const subChunks = recursiveSplit(
        chunk,
        nextSeparators,
        chunkSize,
        chunkOverlap
      );
      finalChunks.push(...subChunks);
    } else if (chunk.trim().length > 0) {
      finalChunks.push(chunk.trim());
    }
  }

  return finalChunks;
}

/**
 * Join chunks with separator, avoiding double separators.
 */
function joinChunks(chunks, separator) {
  return chunks.filter((c) => c.length > 0).join(separator);
}

/**
 * Process a multi-page PDF text into chunks with page metadata.
 * @param {Array<{pageNumber: number, text: string}>} pages - Array of page objects
 * @param {object} options - Chunking options
 * @returns {Array<{text: string, pageNumber: number, chunkIndex: number, charStart: number, charEnd: number}>}
 */
export function chunkDocument(pages, options = {}) {
  const chunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    if (!page.text || page.text.trim().length === 0) continue;

    const pageChunks = splitText(page.text, options);
    let charOffset = 0;

    for (const chunkText of pageChunks) {
      const charStart = page.text.indexOf(chunkText, charOffset);
      const charEnd = charStart + chunkText.length;

      chunks.push({
        text: chunkText,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex,
        charStart: charStart >= 0 ? charStart : charOffset,
        charEnd: charStart >= 0 ? charEnd : charOffset + chunkText.length,
      });

      globalChunkIndex++;
      charOffset = charStart >= 0 ? charStart + 1 : charOffset + chunkText.length;
    }
  }

  return chunks;
}

/**
 * Detect potential section headers in text.
 * Used to enrich chunk metadata.
 * @param {string} text
 * @returns {string|null}
 */
export function detectSectionHeader(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Common legal doc patterns: "SECTION 1:", "Article III.", "1.2 Definitions"
    if (
      /^(SECTION|ARTICLE|CLAUSE|PART|SCHEDULE|EXHIBIT|APPENDIX)\s/i.test(
        trimmed
      ) ||
      /^\d+(\.\d+)*\s+[A-Z]/.test(trimmed) ||
      (trimmed.length < 80 &&
        trimmed.length > 3 &&
        trimmed === trimmed.toUpperCase())
    ) {
      return trimmed;
    }
  }
  return null;
}
