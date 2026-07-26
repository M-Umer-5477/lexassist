"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, FileText, Check } from "lucide-react";

export default function QuickQueryBar({ documents = [] }) {
  const [query, setQuery] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const readyDocs = documents.filter((d) => d.status === "ready");

  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAsk = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const docIdsToUse =
      selectedDocIds.length > 0
        ? selectedDocIds
        : readyDocs.length > 0
        ? [readyDocs[0]._id]
        : [];

    const params = new URLSearchParams();
    params.set("q", query);
    if (docIdsToUse.length > 0) {
      params.set("docIds", docIdsToUse.join(","));
    }

    router.push(`/dashboard/chat?${params.toString()}`);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-slate-950/80 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-100 tracking-tight">
          Instant Legal AI Analysis
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          Ask questions across your processed documents
        </span>
      </div>

      <form onSubmit={handleAsk} className="flex flex-col md:flex-row gap-3">
        {/* Document Selector Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full md:w-56 px-3.5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-between gap-2 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                {selectedDocIds.length === 0
                  ? readyDocs.length > 0
                    ? `All Ready (${readyDocs.length})`
                    : "No Ready Documents"
                  : `${selectedDocIds.length} Document(s) Selected`}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>

          {isDropdownOpen && readyDocs.length > 0 && (
            <div className="absolute left-0 mt-2 w-72 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select Scope
              </div>
              {readyDocs.map((doc) => {
                const isSelected = selectedDocIds.includes(doc._id);
                return (
                  <button
                    key={doc._id}
                    type="button"
                    onClick={() => toggleDocSelection(doc._id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate pr-2">{doc.originalName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Input & Submit */}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What are the liability caps, indemnification terms, or governing law?"
            className="flex-1 px-4 py-3 rounded-xl glass-input text-xs font-medium placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={!query.trim() || readyDocs.length === 0}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            <span>Analyze</span>
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </div>
  );
}
