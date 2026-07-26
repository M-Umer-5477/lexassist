import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import ChatSession from "@/lib/db/models/ChatSession";
import ChatMessage from "@/lib/db/models/ChatMessage";
import { ragQueryStream } from "@/lib/rag";

/**
 * POST /api/chat — Send a message and get a RAG-powered response
 * Supports streaming via ReadableStream
 *
 * Body: { sessionId, question, documentIds }
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, question, documentIds } = await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (!documentIds || documentIds.length === 0) {
      return NextResponse.json(
        { error: "At least one document must be selected" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await ChatSession.findOne({
        _id: sessionId,
        userId: session.user.id,
      });
    }

    if (!chatSession) {
      chatSession = await ChatSession.create({
        userId: session.user.id,
        documentIds,
        title: question.slice(0, 80) + (question.length > 80 ? "..." : ""),
      });
    }

    // Save user message
    await ChatMessage.create({
      sessionId: chatSession._id,
      role: "user",
      content: question,
    });

    // Execute RAG query with streaming
    const { stream: ragStream, sources } = await ragQueryStream({
      question,
      documentIds,
      userId: session.user.id,
      topK: 6,
    });

    // Create a streaming response
    let fullAnswer = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send sources first as a JSON event
          const sourcesEvent = `data: ${JSON.stringify({ type: "sources", sources, sessionId: chatSession._id.toString() })}\n\n`;
          controller.enqueue(new TextEncoder().encode(sourcesEvent));

          // Stream the answer
          for await (const chunk of ragStream) {
            fullAnswer += chunk;
            const textEvent = `data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`;
            controller.enqueue(new TextEncoder().encode(textEvent));
          }

          // Save assistant message with sources
          await ChatMessage.create({
            sessionId: chatSession._id,
            role: "assistant",
            content: fullAnswer,
            sources: sources,
          });

          // Update session metadata
          chatSession.messageCount += 2;
          chatSession.lastMessageAt = new Date();
          await chatSession.save();

          // Send done event
          const doneEvent = `data: ${JSON.stringify({ type: "done" })}\n\n`;
          controller.enqueue(new TextEncoder().encode(doneEvent));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorEvent = `data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorEvent));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}
