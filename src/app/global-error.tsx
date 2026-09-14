"use client";
// ─────────────────────────────────────────────────────────────
// global-error.tsx
// Next.js App Router root global error boundary
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] text-zinc-100 font-sans">
        <div className="max-w-md w-full bg-[#161616] border border-zinc-800 rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">Application Error</h2>
            <p className="text-sm text-zinc-400">
              A critical error occurred. Please refresh the page to restart the application.
            </p>
          </div>

          {error?.message && (
            <div className="w-full text-left p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 break-all max-h-32 overflow-y-auto">
              {error.message}
            </div>
          )}

          <button
            onClick={() => reset()}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e30613] hover:bg-[#c00510] text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Application
          </button>
        </div>
      </body>
    </html>
  );
}
