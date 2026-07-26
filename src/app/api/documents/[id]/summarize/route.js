import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import DocumentModel from "@/lib/db/models/Document";
import Chunk from "@/lib/db/models/Chunk";
import { generateSummary } from "@/lib/llm";

/**
 * POST /api/documents/[id]/summarize — Generate a summary for a document
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

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

    if (document.status !== "ready") {
      return NextResponse.json(
        { error: "Document must be processed before summarization" },
        { status: 400 }
      );
    }

    // Return cached summary if available
    if (document.summary) {
      return NextResponse.json({ summary: document.summary });
    }

    // Get the first chunks of the document to build context
    const chunks = await Chunk.find({ documentId: id })
      .sort({ chunkIndex: 1 })
      .limit(15)
      .lean();

    const documentText = chunks.map((c) => c.text).join("\n\n");

    // Generate summary
    const summary = await generateSummary(documentText, document.originalName);

    // Cache the summary
    document.summary = summary;
    await document.save();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error summarizing document:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
