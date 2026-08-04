"use client";

import { useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { eliminarEgreso } from "@/lib/actions/egresos";
import { formatMonto } from "@/lib/utils/egresos";
import type { EgresoUI } from "@/types/egresos";

interface ConfirmDeleteModalProps {
  egreso: EgresoUI | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ConfirmDeleteModal({
  egreso,
  onClose,
  onSuccess,
  onError,
}: ConfirmDeleteModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!egreso) return;

    startTransition(async () => {
      const resultado = await eliminarEgreso(egreso.id);
      if (resultado.success) {
        onSuccess(resultado.message ?? "Egreso eliminado.");
        onClose();
      } else {
        onError(resultado.message);
      }
    });
  };

  return (
    <Modal
      isOpen={Boolean(egreso)}
      onClose={onClose}
      title="Eliminar egreso"
      maxWidthClass="max-w-md"
    >
      {egreso && (
        <div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={20} aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-600">
              ¿Seguro que deseas eliminar el egreso <strong>{egreso.concepto}</strong> por{" "}
              <strong>{formatMonto(egreso.monto)}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Eliminando…" : "Sí, eliminar"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
