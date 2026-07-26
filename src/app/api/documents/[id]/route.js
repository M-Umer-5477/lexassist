import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import DocumentModel from "@/lib/db/models/Document";
import Chunk from "@/lib/db/models/Chunk";
import { deleteFromS3 } from "@/lib/s3";

/**
 * GET /api/documents/[id] — Get a single document
 */
export async function GET(request, { params }) {
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
    }).lean();

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id] — Delete a document + S3 file + chunks
 */
export async function DELETE(request, { params }) {
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

    // Delete from S3
    try {
      await deleteFromS3(document.s3Key);
    } catch (s3Error) {
      console.error("S3 deletion error (continuing):", s3Error);
    }

    // Delete all chunks for this document
    await Chunk.deleteMany({ documentId: id });

    // Delete the document record
    await DocumentModel.deleteOne({ _id: id });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
