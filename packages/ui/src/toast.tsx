"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "./cn";

export type ToastTone = "success" | "info" | "error";

export interface ToastOptions {
  /** Visual/aria tone. Defaults to `info`. */
  tone?: ToastTone;
  /** Auto-dismiss duration in ms. Defaults to 3500. Pass 0 to keep visible until dismissed. */
  duration?: number;
}

export interface ToastProviderProps {
  children: ReactNode;
  /**
   * Bottom offset in Tailwind spacing units (1 = 4px). Useful when a
   * sticky bottom tab bar or action footer is present. Defaults to 6
   * (= 24px).
   */
  bottomOffset?: number;
}

interface ActiveToast {
  id: number;
  message: ReactNode;
  tone: ToastTone;
  duration: number;
}

interface ToastContextValue {
  toast: (message: ReactNode, opts?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toast system — provider wraps the app (or a subtree) and exposes a
 * `useToast()` hook. Toasts are ARIA `status` regions by default and
 * stack in a fixed bottom-center column with auto-dismiss.
 *
 * Use-case: confirmation of non-blocking admin actions
 * (publish merit, run allocation, mark seat decision).
 * Not a substitute for confirm dialogs — use `Modal` for destructive flows.
 */
export function ToastProvider({ children, bottomOffset = 6 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: ReactNode, opts?: ToastOptions) => {
      const id =
        typeof performance !== "undefined"
          ? performance.now() + Math.random()
          : Date.now() + Math.random();
      const tone: ToastTone = opts?.tone ?? "info";
      const duration = opts?.duration ?? 3500;
      setToasts((current) => [...current, { id, message, tone, duration }]);
      return id;
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toast, dismiss }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} bottomOffset={bottomOffset} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

interface ToastViewportProps {
  toasts: ActiveToast[];
  onDismiss: (id: number) => void;
  bottomOffset: number;
}

const TONE_CLASS: Record<ToastTone, string> = {
  success:
    "bg-[var(--color-interactive-success)] text-[var(--color-text-on-brand)]",
  info: "bg-[var(--color-text-primary)] text-[var(--color-text-on-brand)]",
  error:
    "bg-[var(--color-interactive-danger)] text-[var(--color-text-on-brand)]",
};

const TONE_ICON: Record<ToastTone, string> = {
  success: "✓",
  info: "ℹ",
  error: "⚠",
};

function ToastViewport({ toasts, onDismiss, bottomOffset }: ToastViewportProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: `${bottomOffset * 4}px` }}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ActiveToast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto inline-flex items-center gap-3 rounded-[var(--radius-pill)] px-4 py-2 text-[var(--text-sm)] font-[var(--weight-medium)] shadow-[var(--shadow-lg)]",
        TONE_CLASS[toast.tone],
      )}
    >
      <span aria-hidden="true" className="text-[var(--text-base)]">
        {TONE_ICON[toast.tone]}
      </span>
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="ml-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-[var(--radius-pill)] opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
