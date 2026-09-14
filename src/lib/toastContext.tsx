"use client";
// ─────────────────────────────────────────────────────────────
// toastContext.tsx
// Lightweight Toast and Confirm Modal state management
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmState {
  isOpen: boolean;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  resolve: (value: boolean) => void;
}

interface ToastContextValue {
  toasts: ToastItem[];
  confirmState: ConfirmState | null;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  };
  dismissToast: (id: string) => void;
  resolveConfirm: (value: boolean) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const confirm = useCallback(
    (message: string, options?: ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setConfirmState({
          isOpen: true,
          message,
          title: options?.title || "Confirm Action",
          confirmText: options?.confirmText || "Confirm",
          cancelText: options?.cancelText || "Cancel",
          isDestructive: options?.isDestructive ?? true,
          resolve: (val: boolean) => {
            setConfirmState(null);
            resolve(val);
          },
        });
      });
    },
    []
  );

  const resolveConfirm = useCallback(
    (value: boolean) => {
      if (confirmState) {
        confirmState.resolve(value);
      }
      setConfirmState(null);
    },
    [confirmState]
  );

  const toast = {
    success: (msg: string, dur?: number) => addToast("success", msg, dur),
    error: (msg: string, dur?: number) => addToast("error", msg, dur || 5000),
    info: (msg: string, dur?: number) => addToast("info", msg, dur),
    warning: (msg: string, dur?: number) => addToast("warning", msg, dur),
    confirm,
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        confirmState,
        toast,
        dismissToast,
        resolveConfirm,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
