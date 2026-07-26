import Link from "next/link";
import {
  Scale,
  Sparkles,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  Database,
  Brain,
  MessageSquare,
} from "lucide-react";

export const metadata = {
  title: "LexAssist — AI Legal Document Assistant & RAG Intelligence",
  description:
    "Analyze contracts, legal filings, and complex agreements using AI vector search and grounded LLM answers with exact page citations.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Navbar */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Scale className="w-5.5 h-5.5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              LexAssist
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RAG Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">AI Legal Intelligence</p>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Features
          </a>
          <a href="#pipeline" className="hover:text-emerald-400 transition-colors">
            RAG Pipeline
          </a>
          <a href="#security" className="hover:text-emerald-400 transition-colors">
            Enterprise Security
          </a>
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
            Workspace
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors border border-slate-800"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 pt-20 pb-16 max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="w-4 h-4" />
          Next-Gen RAG Engine Powered by Gemini 3.5 & MongoDB Vector Search
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.1]">
          AI-Powered Legal Document Intelligence with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Uncompromising Accuracy
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
          Upload contracts, legal briefs, and regulatory filings. Get instant, plain-English answers backed by exact page-level citations — zero hallucination, guaranteed.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 group"
          >
            <span>Open AI Dashboard Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            Create Free Account
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Recursive Section Header Chunking
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            MongoDB 768-Dim Vector Search
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Page & Paragraph Citations
          </div>
        </div>
      </section>

      {/* Interactive Mockup / Product Demo Card */}
      <section className="px-6 lg:px-12 py-12 max-w-6xl mx-auto w-full relative z-10">
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">
                LexAssist // Document RAG Inspection Session
              </span>
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              STATUS: READY
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Document Sidebar Mock */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Selected PDF Context</span>
                <FileText className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <p className="font-semibold text-slate-200 truncate">Master_Services_Agreement.pdf</p>
                <p className="text-[11px] text-slate-400 mt-1">42 Pages • 186 Chunks Indexed</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs">
                <p className="font-semibold text-slate-300 truncate">IP_Assignment_Clause.pdf</p>
                <p className="text-[11px] text-slate-500 mt-1">12 Pages • 48 Chunks Indexed</p>
              </div>
            </div>

            {/* Right Chat Mock */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-200">
                <p className="text-[11px] text-slate-500 font-mono mb-1">USER QUESTION:</p>
                <p className="font-semibold">
                  What is the limitation of liability cap and what are the exclusions under Section 8?
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  LexAssist RAG Answer:
                </div>
                <p className="leading-relaxed">
                  Under <strong>Section 8.1</strong>, total liability for either party is capped at the total fees paid in the preceding <strong>12-month period</strong>.
                </p>
                <p className="leading-relaxed">
                  Exclusions from this liability cap include breaches of confidentiality obligations (Section 12) and gross negligence or willful misconduct.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                    [Source: Master_Services_Agreement.pdf, Page 14]
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                    [Source: Master_Services_Agreement.pdf, Page 15]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAG Pipeline Breakdown */}
      <section id="pipeline" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Engine Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How LexAssist Delivers Legal Precision
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            A 4-step deterministic pipeline engineered specifically for legal text.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Legal Chunking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Handwritten recursive text splitter detects section headers (`SECTION`, `ARTICLE`, `CLAUSE`) to retain semantic context.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Vector Embeddings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates 768-dimensional vector embeddings using Google Gemini `gemini-embedding-001` and stores them in MongoDB Atlas.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Atlas $vectorSearch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Runs cosine similarity aggregation pre-filtered by user ID and document IDs for instant, secure context retrieval.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Grounded Q&A</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini 3.5 Flash generates answers strictly using retrieved context with exact source page citations and streaming response.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 lg:px-12 py-12 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200">LexAssist Legal AI</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/login" className="hover:text-emerald-400 transition-colors">
              Login
            </Link>
            <Link href="/register" className="hover:text-emerald-400 transition-colors">
              Register
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
          </div>

          <p className="text-center md:text-right">
            © 2026 LexAssist Inc. Document analysis only — Not legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
