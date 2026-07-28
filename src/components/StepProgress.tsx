import React from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  stepMessage: string;
  status: "idle" | "generating" | "completed" | "error";
  errorMessage?: string;
  steps: { id: number; name: string }[];
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  stepMessage,
  status,
  errorMessage,
  steps,
}) => {
  const percentage = (() => {
    if (status === "completed") return 100;
    const w = 100 / steps.length;
    if (status === "error") return (currentStep - 1) * w;
    if (status === "generating") return (currentStep - 1) * w + w / 2;
    return 0;
  })();

  const statusLabel =
    status === "generating"
      ? "PROCESSING"
      : status === "error"
      ? "HALTED"
      : status === "completed"
      ? "COMPLETE"
      : "READY";

  const statusDot =
    status === "generating"
      ? "bg-[#e30613] animate-pulse"
      : status === "error"
      ? "bg-amber-500"
      : status === "completed"
      ? "bg-emerald-500"
      : "bg-zinc-400";

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#161616] animate-fadeIn">
      {/* ── Header bar ── */}
      <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`} />
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-500">
              Pipeline Status
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">
              {status === "generating"
                ? stepMessage
                : status === "error"
                ? "Generation halted — see error below"
                : status === "completed"
                ? `All ${steps.length} stages completed`
                : "Awaiting input"}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`text-[10px] font-bold tracking-widest px-2 py-1 border ${
            status === "generating"
              ? "text-[#e30613] border-[#e30613]/30 bg-[#e30613]/5"
              : status === "error"
              ? "text-amber-600 border-amber-500/30 bg-amber-500/5"
              : status === "completed"
              ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
              : "text-zinc-400 border-zinc-300 dark:border-zinc-700 bg-transparent"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* ── Progress bar (thin 2px line) ── */}
      <div className="pipeline-track">
        <div
          className="pipeline-fill"
          style={{ width: `${percentage}%` }}
        />
        {/* Scanning shimmer when generating */}
        {status === "generating" && (
          <div className="absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-scan" />
        )}
      </div>

      {/* ── Step list ── */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id || status === "completed";
          const isActive = status === "generating" && currentStep === step.id;
          const isFailed = status === "error" && currentStep === step.id;
          const isPending = !isCompleted && !isActive && !isFailed;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between px-5 py-3 transition-colors ${
                isActive ? "bg-zinc-50 dark:bg-white/[0.03]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Step number / icon */}
                <div
                  className={`w-6 h-6 flex items-center justify-center flex-shrink-0 text-[10px] font-black border ${
                    isCompleted
                      ? "border-emerald-500 text-emerald-500"
                      : isActive
                      ? "border-[#e30613] text-[#e30613]"
                      : isFailed
                      ? "border-amber-500 text-amber-500"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isFailed ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    String(step.id).padStart(2, "0")
                  )}
                </div>

                <span
                  className={`text-[13px] font-medium ${
                    isActive
                      ? "text-zinc-900 dark:text-zinc-100"
                      : isCompleted
                      ? "text-zinc-500 dark:text-zinc-400"
                      : isFailed
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {/* Right status pill */}
              <span
                className={`text-[10px] font-semibold tracking-wide uppercase ${
                  isCompleted
                    ? "text-emerald-500"
                    : isActive
                    ? "text-[#e30613]"
                    : isFailed
                    ? "text-amber-500"
                    : "text-zinc-300 dark:text-zinc-700"
                }`}
              >
                {isCompleted
                  ? "✓ Done"
                  : isActive
                  ? "Running"
                  : isFailed
                  ? "! Failed"
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Error message ── */}
      {status === "error" && errorMessage && (
        <div className="mx-5 mb-5 mt-4 p-4 border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold tracking-wider uppercase mb-1">
                Error Detail
              </p>
              <p className="text-xs font-mono leading-relaxed break-all">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
