"use client";
// ─────────────────────────────────────────────────────────────
// ToastContainer.tsx
// Floating toast notification stack + custom confirm modal dialog
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { useToast, ToastItem } from "@/lib/toastContext";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  HelpCircle,
} from "lucide-react";

function ToastMessage({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borderColors = {
    success: "border-emerald-500/30 dark:border-emerald-500/20",
    error: "border-red-500/30 dark:border-red-500/20",
    warning: "border-amber-500/30 dark:border-amber-500/20",
    info: "border-blue-500/30 dark:border-blue-500/20",
  };

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 w-80 sm:w-96 p-4 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl border ${borderColors[toast.type]} transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug break-words">
        {toast.message}
      </div>
      <button
        onClick={onDismiss}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-0.5 rounded-md"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, confirmState, dismissToast, resolveConfirm } = useToast();

  // Handle ESC key for confirm dialog
  useEffect(() => {
    if (!confirmState?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resolveConfirm(false);
      } else if (e.key === "Enter") {
        resolveConfirm(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmState, resolveConfirm]);

  return (
    <>
      {/* Floating Toasts */}
      <aside
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-full"
      >
        {toasts.map((item) => (
          <ToastMessage
            key={item.id}
            toast={item}
            onDismiss={() => dismissToast(item.id)}
          />
        ))}
      </aside>

      {/* Confirmation Modal */}
      {confirmState?.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => resolveConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  confirmState.isDestructive
                    ? "bg-red-500/10 text-red-500"
                    : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {confirmState.isDestructive ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {confirmState.title || "Confirm Action"}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => resolveConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {confirmState.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => resolveConfirm(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors shadow-xs ${
                  confirmState.isDestructive
                    ? "bg-[#e30613] hover:bg-[#c00510]"
                    : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                }`}
              >
                {confirmState.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
