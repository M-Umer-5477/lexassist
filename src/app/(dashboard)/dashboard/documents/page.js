"use client";

import { useEffect, useState, useCallback } from "react";
import RecentDocumentsList from "@/components/dashboard/RecentDocumentsList";
import QuickUploadCard from "@/components/dashboard/QuickUploadCard";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Legal Documents Library</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage all uploaded legal contracts, briefs, and filings indexed for AI retrieval.
        </p>
      </div>

      <QuickUploadCard onUploadSuccess={fetchDocuments} />
      <RecentDocumentsList documents={documents} onRefresh={fetchDocuments} isLoading={isLoading} />
    </div>
  );
}
