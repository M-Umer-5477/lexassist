import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Branding */}
      <header className="p-6 relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Scale className="w-5.5 h-5.5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              LexAssist
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">Legal Intelligence Hub</p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted Workspace</span>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 relative z-10 border-t border-slate-900/60">
        <p>© 2026 LexAssist. AI-Powered Legal Assistant. Strictly for document analysis — Not legal advice.</p>
      </footer>
    </div>
  );
}
