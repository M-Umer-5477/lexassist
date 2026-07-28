# LexAssist

LexAssist is a RAG-based legal assistant LLM for analyzing, summarizing, and answering questions over legal documents and contracts.

## Highlights

- Next.js app router frontend
- MongoDB Atlas vector search
- Google Gemini embeddings and chat
- Document upload and processing pipeline
- Auth, chat sessions, and document management

## Setup

1. Install dependencies.
2. Add the required environment variables.
3. Run the development server.

## Notes

This repository was merged with the GitHub README initial commit so the remote history can be pushed cleanly.<<<<<<< HEAD
# ⚖️ LexAssist — AI-Powered RAG Legal Intelligence & Document Assistant

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3.5_Flash-886FBF?style=for-the-badge&logo=googlegemini)](https://ai.google.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Vector_Search-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/products/platform/atlas-vector-search)
[![AWS S3](https://img.shields.io/badge/AWS_S3-Document_Storage-FF9900?style=for-the-badge&logo=amazons3)](https://aws.amazon.com/s3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**LexAssist** is a full-stack, enterprise-grade **Retrieval-Augmented Generation (RAG)** platform designed to analyze, summarize, and answer complex questions over legal documents, contracts, and compliance files. 

Built to demonstrate **production-ready LLM engineering**, LexAssist bypasses heavy black-box frameworks (like LangChain) to implement a **custom, hand-crafted RAG pipeline** featuring page-aware recursive text splitting, dual-task Gemini embeddings, multi-tenant vector search pre-filtering in MongoDB Atlas, and real-time Server-Sent Events (SSE) response streaming with exact source citations.

---

## 🌟 Key Features & Engineering Highlights

- 🧠 **Custom Hand-Crafted RAG Engine**: Fully custom chunker, prompt builder, embedding pipeline, and vector query orchestrator written from scratch for total control over token density, page mapping, and latency.
- 📄 **Page-Aware Document Processing**: Extracts multi-page text from PDFs via `pdf-parse`, preserving exact page numbers, section headers, and character offsets for precise auditability.
- 📐 **Dual-Task Vector Embeddings**: Uses `@google/genai` with `gemini-embedding-001` (768 dimensions), utilizing `RETRIEVAL_DOCUMENT` for document indexing and `RETRIEVAL_QUERY` for prompt vectorization.
- 🔍 **MongoDB Atlas Vector Search (`$vectorSearch`)**: Executes high-dimensional Cosine Similarity search with pre-filtering by `userId` and `documentId` for multi-tenant security and zero data leakage.
- ⚡ **Real-Time Token Streaming (SSE)**: Streams generated responses in real-time using `ReadableStream` and Next.js 16 Server-Sent Events for instant UI rendering.
- 📌 **Grounded Citations & Anti-Hallucination**: Implements strict system prompt rules requiring the LLM (`gemini-3.5-flash`) to answer strictly from context and provide clickable `[Source: Doc, Page X]` citations with similarity scores.
- 📊 **Automated Contract Summarization**: Generates structured 6-point summaries (Parties, Key Terms, Critical Dates, Notable Clauses) for fast legal risk assessment.
- ☁️ **Cloud Document Vault (AWS S3)**: Secure document storage using S3 presigned URLs, keeping raw files isolated while storing embeddings in MongoDB Atlas.

---

## 🏗️ System Architecture & RAG Pipeline Flow

```
[ User Upload (PDF) ]
         │
         ▼
 1. Page Parsing (pdf-parse)  ──► Preserves Page Numbers & Section Headers
         │
         ▼
 2. Recursive Chunker         ──► 750 Char Chunks / 150 Char Overlap
         │
         ▼
 3. Batch Embeddings          ──► Google Gemini API (gemini-embedding-001)
         │                         Task: RETRIEVAL_DOCUMENT (768-dim)
         ▼
 4. Atlas Vector Storage      ──► MongoDB Atlas Index ("vector_index")
                                   Pre-filtered by userId & documentId

──────────────────────────────────────────────────────────────────────────

[ User Question ] ──► 5. Embed Query (gemini-embedding-001 - RETRIEVAL_QUERY)
                             │
                             ▼
                      6. MongoDB $vectorSearch (Cosine Similarity, Top-K)
                             │
                             ▼
                      7. Prompt Context Augmentation + Citation Metadata
                             │
                             ▼
                      8. Grounded Generation (gemini-3.5-flash @ temp: 0.2)
                             │
                             ▼
                      9. SSE Streaming Response ──► Client UI Render
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend & App Framework** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, Shadcn UI |
| **LLM & AI Orchestration** | Google Gemini API (`@google/genai`), `gemini-3.5-flash`, `gemini-embedding-001` |
| **Vector DB & Search** | MongoDB Atlas Vector Search (`$vectorSearch` pipeline, 768-dim Cosine Similarity) |
| **Database & Auth** | MongoDB, Mongoose v9, NextAuth.js v5 (Auth.js Beta) with MongoDB Adapter |
| **Cloud Storage** | AWS S3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) |
| **Text Processing** | Node `pdf-parse`, Custom Hand-written Recursive Text Splitter |

---

## 🔬 Deep Dive into the RAG Pipeline Implementation

### 1. Custom Recursive Text Chunker (`src/lib/chunker.js`)
Instead of relying on external libraries, LexAssist implements a hand-crafted recursive splitter with a natural break hierarchy (`\n\n` ➔ `\n` ➔ sentence ➔ word):
- **Chunk Size**: 750 characters (~120–150 tokens) for ideal legal clause density.
- **Chunk Overlap**: 150 characters to prevent loss of context across section boundaries.
- **Section Detection**: Regex heuristic parser for legal section headers (e.g., `SECTION 1:`, `ARTICLE III`, `1.2 Definitions`).

### 2. Multi-Tenant Vector Search (`src/lib/vectorSearch.js`)
Performs similarity retrieval using MongoDB's `$vectorSearch` aggregation stage:
```javascript
const pipeline = [
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: queryVector, // 768-dimensional vector
      numCandidates: limit * 10,
      limit: limit,
      filter: { userId: new mongoose.Types.ObjectId(userId), documentId: ... }
    }
  },
  {
    $lookup: { from: "documents", localField: "documentId", foreignField: "_id", as: "document" }
  }
];
```

### 3. Strict Context Grounding & Citation System (`src/lib/llm.js`)
System prompt constraints force the LLM to act as a grounded assistant:
- Zero external knowledge usage — answers solely based on retrieved context chunks.
- Mandatory per-claim inline citation format: `[Source: Document Name, Page X]`.
- Low temperature setting (`0.2`) to eliminate hallucination in critical legal analysis.

---

## 🔐 Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lexassist?retryWrites=true&w=majority

# Authentication
AUTH_SECRET=your-random-auth-secret
NEXTAUTH_URL=http://localhost:3000

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=lexassist-documents

# Google Gemini AI Key
GEMINI_API_KEY=your-google-gemini-api-key
```

---

## 📊 MongoDB Atlas Vector Search Index Setup

Create a Vector Search index named `vector_index` on the `chunks` collection in MongoDB Atlas:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

---

## ⚡ Quick Start & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lexassist.git
   cd lexassist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Disclaimer

*LexAssist is an AI document assistant developed for information extraction and contract analysis. It does not provide formal legal advice or replace professional legal counsel.*

---

## 👤 Author & Contact

Developed by **Umer** — LLM & Full-Stack Engineer  
- GitHub: [https://github.com/M-Umer_5477]
=======
# lexassist
A RAG based legal Assistant LLM
>>>>>>> origin/main
