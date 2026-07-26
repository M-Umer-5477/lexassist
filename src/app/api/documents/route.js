import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import DocumentModel from "@/lib/db/models/Document";
import { uploadToS3, generateS3Key } from "@/lib/s3";

/**
 * GET /api/documents — List user's documents
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const documents = await DocumentModel.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents — Upload a new document
 * Accepts multipart/form-data with a "file" field
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 20MB" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const s3Key = generateS3Key(session.user.id, file.name);
    const { url } = await uploadToS3(buffer, s3Key, file.type);

    // Save document metadata to MongoDB
    const document = await DocumentModel.create({
      userId: session.user.id,
      filename: file.name.replace(/\.pdf$/i, ""),
      originalName: file.name,
      s3Key,
      s3Url: url,
      fileSize: file.size,
      mimeType: file.type,
      status: "uploading",
    });

    return NextResponse.json(
      {
        message: "Document uploaded successfully",
        document: {
          id: document._id.toString(),
          filename: document.filename,
          status: document.status,
          fileSize: document.fileSize,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
