"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RecentChatSessions from "@/components/dashboard/RecentChatSessions";
import { MessageSquare, Sparkles } from "lucide-react";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const sessionId = searchParams.get("sessionId");
  const initialQuery = searchParams.get("q");

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-400" />
          AI Legal Assistant Workspace
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ask questions across your processed legal documents with RAG vector retrieval and source citations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RecentChatSessions sessions={sessions} onRefresh={fetchSessions} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[420px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">RAG Assistant Interface Ready</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {initialQuery
                ? `Ready to analyze query: "${initialQuery}"`
                : docId
                ? `Document #${docId} selected for RAG chat analysis.`
                : "Select an active conversation from the list or pick a document from the dashboard to start."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading chat workspace...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
