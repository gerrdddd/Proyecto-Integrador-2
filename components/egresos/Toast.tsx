"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastState {
  id: number;
  type: "success" | "error";
  message: string;
}

interface ToastProps {
  toast: ToastState;
  onDismiss: (id: number) => void;
}

/** Notificación flotante de éxito/error, se auto-descarta tras 4s. */
export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200 ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
      ) : (
        <XCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
      )}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="shrink-0 text-current opacity-60 transition hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastState[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
