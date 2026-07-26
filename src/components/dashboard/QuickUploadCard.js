"use client";

import { useState, useRef } from "react";
import { UploadCloud, File, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function QuickUploadCard({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorText("Only PDF documents are supported.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorText("File size exceeds 20MB limit.");
      return;
    }

    setErrorText("");
    setIsUploading(true);
    setStatusText("Uploading document to cloud storage...");

    try {
      // Step 1: Upload PDF to S3 + DB metadata
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload document");
      }

      const docId = data.document.id;

      // Step 2: Automatically trigger ingestion & vector embedding pipeline
      setStatusText("Extracting PDF text, chunking & vectorizing with Gemini AI...");

      const processRes = await fetch(`/api/documents/${docId}/process`, {
        method: "POST",
      });

      const processData = await processRes.json();

      if (!processRes.ok) {
        throw new Error(processData.error || "Failed to process document");
      }

      setStatusText("Document successfully processed and indexed!");
      setTimeout(() => {
        setIsUploading(false);
        setStatusText("");
        if (onUploadSuccess) onUploadSuccess();
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorText(err.message || "An unexpected error occurred during upload.");
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`glass-card p-6 rounded-2xl border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center text-center ${
        isDragging
          ? "border-emerald-400 bg-emerald-500/10 scale-[0.99]"
          : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="application/pdf"
        className="hidden"
      />

      {isUploading ? (
        <div className="py-6 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{statusText}</p>
            <p className="text-xs text-slate-400 mt-1">Please keep this window open</p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            Upload Legal Document
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Drag and drop your PDF contract, brief, or case law file here (Max 20MB)
          </p>

          {errorText && (
            <div className="mt-3 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
          >
            <File className="w-4 h-4" />
            Browse PDF File
          </button>
        </>
      )}
    </div>
  );
}
