import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import ChatSession from "@/lib/db/models/ChatSession";
import ChatMessage from "@/lib/db/models/ChatMessage";

/**
 * GET /api/chat/sessions/[id] — Get all messages in a session
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const chatSession = await ChatSession.findOne({
      _id: id,
      userId: session.user.id,
    })
      .populate("documentIds", "filename originalName")
      .lean();

    if (!chatSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const messages = await ChatMessage.find({ sessionId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ session: chatSession, messages });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/sessions/[id] — Delete a session and its messages
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const chatSession = await ChatSession.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    await ChatMessage.deleteMany({ sessionId: id });
    await ChatSession.deleteOne({ _id: id });

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
