import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import ChatSession from "@/lib/db/models/ChatSession";

/**
 * GET /api/chat/sessions — List user's chat sessions
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const sessions = await ChatSession.find({ userId: session.user.id })
      .sort({ lastMessageAt: -1 })
      .populate("documentIds", "filename originalName")
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/sessions — Create a new chat session
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentIds, title } = await request.json();

    await dbConnect();

    const chatSession = await ChatSession.create({
      userId: session.user.id,
      documentIds: documentIds || [],
      title: title || "New Chat",
    });

    return NextResponse.json(
      { session: chatSession },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
