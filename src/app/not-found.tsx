import React from "react";
import Link from "next/link";
import { FileQuestion, Home, FolderOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#0a0a0a]">
      <div className="max-w-md w-full bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 text-center flex flex-col items-center gap-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-black text-[#e30613] tracking-widest uppercase">
            404 — Page Not Found
          </span>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Resource Not Found
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The article, page, or resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full mt-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e30613] hover:bg-[#b8040f] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/articles"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
