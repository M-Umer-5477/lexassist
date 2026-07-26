import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import DocumentModel from "@/lib/db/models/Document";
import Chunk from "@/lib/db/models/Chunk";
import { getFromS3 } from "@/lib/s3";
import { chunkDocument, detectSectionHeader } from "@/lib/chunker";
import { embedBatch } from "@/lib/embeddings";

// pdf-parse needs to be imported dynamically to avoid Edge Runtime issues
let pdfParse;

/**
 * POST /api/documents/[id]/process — Process a document through the RAG pipeline
 *
 * Pipeline: Download from S3 → Extract text → Chunk → Embed → Store vectors
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    // Fetch the document
    const document = await DocumentModel.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.status === "ready") {
      return NextResponse.json(
        { error: "Document already processed" },
        { status: 400 }
      );
    }

    // Update status to processing
    document.status = "processing";
    await document.save();

    try {
      // Step 1: Download PDF from S3
      const pdfBuffer = await getFromS3(document.s3Key);

      // Step 2: Extract text from PDF
      if (!pdfParse) {
        pdfParse = (await import("pdf-parse")).default;
      }

      const pdfData = await pdfParse(pdfBuffer);

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error("Could not extract text from PDF. The file may be scanned or image-based.");
      }

      // Build page-level text (pdf-parse doesn't give per-page text reliably,
      // so we use the full text with estimated page breaks)
      const totalPages = pdfData.numpages || 1;
      const fullText = pdfData.text;
      const charsPerPage = Math.ceil(fullText.length / totalPages);

      const pages = [];
      for (let i = 0; i < totalPages; i++) {
        const start = i * charsPerPage;
        const end = Math.min(start + charsPerPage, fullText.length);
        const pageText = fullText.slice(start, end);
        if (pageText.trim()) {
          pages.push({ pageNumber: i + 1, text: pageText });
        }
      }

      // Step 3: Chunk the document
      const chunks = chunkDocument(pages, {
        chunkSize: 750,
        chunkOverlap: 150,
      });

      if (chunks.length === 0) {
        throw new Error("No text chunks could be generated from this document.");
      }

      // Step 4: Generate embeddings
      const chunkTexts = chunks.map((c) => c.text);
      const embeddings = await embedBatch(chunkTexts);

      // Step 5: Store chunks with embeddings in MongoDB
      const chunkDocs = chunks.map((chunk, i) => ({
        documentId: document._id,
        userId: session.user.id,
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        embedding: embeddings[i],
        metadata: {
          sectionHeader: detectSectionHeader(chunk.text),
          charStart: chunk.charStart,
          charEnd: chunk.charEnd,
        },
      }));

      // Delete any existing chunks for this document (in case of re-processing)
      await Chunk.deleteMany({ documentId: document._id });

      // Insert all chunks
      await Chunk.insertMany(chunkDocs);

      // Step 6: Update document status
      document.status = "ready";
      document.pageCount = totalPages;
      document.chunkCount = chunks.length;
      document.processingError = null;
      await document.save();

      return NextResponse.json({
        message: "Document processed successfully",
        stats: {
          pages: totalPages,
          chunks: chunks.length,
          totalChars: fullText.length,
        },
      });
    } catch (processingError) {
      // Mark document as failed
      document.status = "failed";
      document.processingError = processingError.message;
      await document.save();

      console.error("Processing pipeline error:", processingError);
      return NextResponse.json(
        { error: `Processing failed: ${processingError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in process route:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}
