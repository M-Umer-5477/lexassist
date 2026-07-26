"use client";

import { FileText, CheckCircle2, Layers, MessageSquare, Clock, AlertTriangle } from "lucide-react";

export default function DashboardStats({ documents = [], sessions = [], isLoading = false }) {
  const readyDocs = documents.filter((d) => d.status === "ready").length;
  const processingDocs = documents.filter((d) => d.status === "processing" || d.status === "uploading").length;
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);
  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || 0), 0);

  const stats = [
    {
      label: "Total Documents",
      value: documents.length,
      subtext: `${readyDocs} ready for AI analysis`,
      icon: FileText,
      color: "from-blue-500/20 to-indigo-500/10",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      label: "Ready & Vectorized",
      value: readyDocs,
      subtext: `${processingDocs > 0 ? `${processingDocs} processing in pipeline` : "100% indexed"}`,
      icon: CheckCircle2,
      color: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
    {
      label: "Indexed Chunks",
      value: totalChunks.toLocaleString(),
      subtext: `Across ${totalPages.toLocaleString()} total pages`,
      icon: Layers,
      color: "from-purple-500/20 to-pink-500/10",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      label: "AI Conversations",
      value: sessions.length,
      subtext: "Active legal research sessions",
      icon: MessageSquare,
      color: "from-cyan-500/20 to-teal-500/10",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden bg-gradient-to-br ${stat.color} border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 ${stat.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-3xl font-extrabold tracking-tight text-white">
                {stat.value}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {stat.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
