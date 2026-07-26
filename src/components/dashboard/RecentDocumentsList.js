"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  MessageSquare,
  Play,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  FileCode2,
} from "lucide-react";

export default function RecentDocumentsList({ documents = [], onRefresh, isLoading = false }) {
  const [processingId, setProcessingId] = useState(null);
  const [summarizingId, setSummarizingId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);

  const handleProcess = async (docId) => {
    setProcessingId(docId);
    try {
      const res = await fetch(`/api/documents/${docId}/process`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process document");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Processing error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSummarize = async (doc) => {
    if (doc.summary) {
      setActiveSummary({ title: doc.originalName, text: doc.summary });
      return;
    }

    setSummarizingId(doc._id);
    try {
      const res = await fetch(`/api/documents/${doc._id}/summarize`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");
      setActiveSummary({ title: doc.originalName, text: data.summary });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Summarization error: ${err.message}`);
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document and all vector embeddings?")) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document");
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStatusBadge = (status, processingError) => {
    switch (status) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Processing
          </span>
        );
      case "uploading":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Uploading
          </span>
        );
      case "failed":
      default:
        return (
          <span
            title={processingError || "Processing failed"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Recent Legal Documents
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            PDF files indexed for RAG vector search
          </p>
        </div>

        <Link
          href="/dashboard/documents"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          View All Documents →
        </Link>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading document repository...
        </div>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <FileCode2 className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No documents uploaded yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Upload your first legal contract or brief using the quick uploader above to begin asking AI questions.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 overflow-x-auto">
          {documents.slice(0, 6).map((doc) => (
            <div
              key={doc._id}
              className="p-4 hover:bg-slate-900/40 transition-colors flex items-center justify-between gap-4 min-w-[600px]"
            >
              {/* Document Icon & Title */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-slate-300 shrink-0">
                  <FileText className="w-5 h-5 text-emerald-400/80" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-200 truncate" title={doc.originalName}>
                    {doc.originalName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span>{doc.pageCount ? `${doc.pageCount} pages` : "Pages unknown"}</span>
                    <span>•</span>
                    <span>{doc.chunkCount ? `${doc.chunkCount} vector chunks` : "0 chunks"}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">{getStatusBadge(doc.status, doc.processingError)}</div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {doc.status !== "ready" && (
                  <button
                    onClick={() => handleProcess(doc._id)}
                    disabled={processingId === doc._id}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    title="Run AI Vector Ingestion"
                  >
                    {processingId === doc._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    Process
                  </button>
                )}

                {doc.status === "ready" && (
                  <>
                    <button
                      onClick={() => handleSummarize(doc)}
                      disabled={summarizingId === doc._id}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      title="AI Plain-English Summary"
                    >
                      {summarizingId === doc._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      Summary
                    </button>

                    <Link
                      href={`/dashboard/chat?docId=${doc._id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Ask AI
                    </Link>
                  </>
                )}

                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Summary Modal */}
      {activeSummary && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                AI Legal Summary — {activeSummary.title}
              </div>
              <button
                onClick={() => setActiveSummary(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
              {activeSummary.text}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setActiveSummary(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
