'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050b14] text-white p-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#0a1324] border border-red-500/30 text-center space-y-6 shadow-2xl">
        <div className="p-4 rounded-3xl bg-red-500/10 text-red-400 w-max mx-auto border border-red-500/20">
          <AlertCircle className="w-12 h-12 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Application Error Encountered</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            A critical error occurred while rendering the Vocal Reader application or initializing audio synthesis.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-red-300 overflow-x-auto text-left">
            {error.message || 'Unknown runtime error'}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
