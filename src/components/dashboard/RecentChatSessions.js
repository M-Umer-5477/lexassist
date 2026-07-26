"use client";

import Link from "next/link";
import { MessageSquare, ArrowRight, Clock, FileText, Trash2 } from "lucide-react";

export default function RecentChatSessions({ sessions = [], onRefresh, isLoading = false }) {
  const handleDelete = async (sessionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete chat session");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Recent AI Research Chats
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active RAG conversation threads with source citations
          </p>
        </div>

        <Link
          href="/dashboard/chat"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          New AI Chat +
        </Link>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm flex-1 flex items-center justify-center">
          Loading conversation history...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
          <MessageSquare className="w-10 h-10 text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No chat sessions started yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Select an indexed document or ask a quick legal query to start a RAG chat session.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 flex-1 overflow-y-auto max-h-[420px]">
          {sessions.slice(0, 5).map((session) => (
            <Link
              key={session._id}
              href={`/dashboard/chat?sessionId=${session._id}`}
              className="p-4 hover:bg-slate-900/50 transition-colors flex items-center justify-between gap-4 group block"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                  {session.title || "Untitled Legal Conversation"}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDate(session.lastMessageAt || session.updatedAt)}
                  </span>
                  <span>•</span>
                  <span>{session.messageCount || 0} messages</span>
                </div>

                {session.documentIds && session.documentIds.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {session.documentIds.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 truncate max-w-[160px]"
                      >
                        <FileText className="w-3 h-3 text-cyan-400 shrink-0" />
                        {doc.originalName || doc.filename || "Document"}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(session._id, e)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Chat Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 flex items-center justify-center text-slate-400 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
