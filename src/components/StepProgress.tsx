import React from "react";
import { CheckCircle2, Loader2, Circle, AlertCircle } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  stepMessage: string;
  status: "idle" | "generating" | "completed" | "error";
  errorMessage?: string;
  hasImageStep?: boolean;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  stepMessage,
  status,
  errorMessage,
  hasImageStep = true,
}) => {
  const steps = [
    { id: 1, name: "News Article Generator" },
    { id: 2, name: "SEO Asset Generator" },
    { id: 3, name: "Industry Impact Analysis" },
    { id: 4, name: "Interview Opportunities" },
    { id: 5, name: "Editorial Review Guidelines" },
    ...(hasImageStep ? [{ id: 6, name: "Header Banner Creative" }] : []),
  ];

  const calculatePercentage = () => {
    if (status === "completed") return 100;
    const stepsCount = steps.length;
    const stepWeight = 100 / stepsCount;
    if (status === "error") return (currentStep - 1) * stepWeight;
    if (status === "generating") {
      return (currentStep - 1) * stepWeight + (stepWeight / 2); // offset for the active step
    }
    return 0;
  };

  const percentage = calculatePercentage();

  return (
    <div className="w-full rounded-2xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Decorative top pulse */}
      {status === "generating" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {status === "generating"
              ? "Generating Editorial Package"
              : status === "error"
              ? "Generation Halted"
              : status === "completed"
              ? "Editorial Package Ready"
              : "Ready to Process"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {status === "generating"
              ? stepMessage
              : status === "error"
              ? "An error occurred during generation."
              : status === "completed"
              ? "All 5 stages completed successfully."
              : "Configure parameters on the left to begin."}
          </p>
        </div>
        
        {status === "generating" && (
          <div className="flex items-center gap-1 bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id || status === "completed";
          const isActive = status === "generating" && currentStep === step.id;
          const isFailed = status === "error" && currentStep === step.id;
          const isPending = !isCompleted && !isActive && !isFailed;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-900/50 border border-blue-500/20"
                  : isCompleted
                  ? "bg-zinc-50/50 dark:bg-zinc-950/20"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                ) : isFailed ? (
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-600 flex-shrink-0" />
                )}
                
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-zinc-900 dark:text-zinc-100"
                      : isCompleted
                      ? "text-zinc-700 dark:text-zinc-300"
                      : isFailed
                      ? "text-rose-500"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  Step {step.id}: {step.name}
                </span>
              </div>

              <div className="text-xs">
                {isCompleted && (
                  <span className="text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                    Completed
                  </span>
                )}
                {isActive && (
                  <span className="text-blue-500 font-medium animate-pulse bg-blue-500/10 px-2 py-0.5 rounded">
                    Running...
                  </span>
                )}
                {isFailed && (
                  <span className="text-rose-500 font-medium bg-rose-500/10 px-2 py-0.5 rounded">
                    Failed
                  </span>
                )}
                {isPending && (
                  <span className="text-zinc-400 dark:text-zinc-600">
                    Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {status === "error" && errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Error Occurred</div>
            <div className="mt-1 text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-mono">
              {errorMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
