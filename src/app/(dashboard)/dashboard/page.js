"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  FilePlus,
  MessageSquarePlus,
  RefreshCw,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickUploadCard from "@/components/dashboard/QuickUploadCard";
import QuickQueryBar from "@/components/dashboard/QuickQueryBar";
import RecentDocumentsList from "@/components/dashboard/RecentDocumentsList";
import RecentChatSessions from "@/components/dashboard/RecentChatSessions";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [docsRes, sessionsRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/chat/sessions"),
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents || []);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const firstName = session?.user?.name
    ? session.user.name.split(" ")[0]
    : "Counselor";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Welcome Header Banner */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            LexAssist RAG Intelligence Active
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{firstName}</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Upload legal agreements, contracts, or court filings. LexAssist automatically chunks, embeds, and analyzes your documents with exact page-level source citations.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={handleManualRefresh}
            className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white transition-all ${
              isRefreshing ? "animate-spin text-emerald-400" : ""
            }`}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard/chat"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <MessageSquarePlus className="w-4 h-4 stroke-[2.5]" />
            New AI Chat
          </Link>
        </div>
      </div>

      {/* KPI Overview Metrics Cards */}
      <DashboardStats
        documents={documents}
        sessions={sessions}
        isLoading={isLoading}
      />

      {/* Instant Query Bar */}
      <QuickQueryBar documents={documents} />

      {/* Ingestion & Quick Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickUploadCard onUploadSuccess={fetchData} />
        </div>
        <div className="lg:col-span-2">
          <RecentChatSessions
            sessions={sessions}
            onRefresh={fetchData}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Recent Documents Table Section */}
      <RecentDocumentsList
        documents={documents}
        onRefresh={fetchData}
        isLoading={isLoading}
      />
    </div>
  );
}
