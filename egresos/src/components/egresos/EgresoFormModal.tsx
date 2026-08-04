"use client";

import { useEffect, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import { crearEgreso, editarEgreso } from "@/app/egresos/actions";
import {
  METODO_PAGO_LABELS,
  TIPO_LABELS,
  type EgresoFormData,
  type EgresoUI,
  type MetodoPago,
  type TipoEgreso,
} from "@/app/types/egresos";

interface EgresoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  egresoAEditar: EgresoUI | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const VALORES_INICIALES: EgresoFormData = {
  concepto: "",
  descripcion: "",
  monto: "",
  fecha: new Date().toISOString().slice(0, 10),
  tipo: "GASTO",
  metodoPago: "EFECTIVO",
  referencia: "",
};

const inputBase =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const inputError = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

export default function EgresoFormModal({
  isOpen,
  onClose,
  egresoAEditar,
  onSuccess,
  onError,
}: EgresoFormModalProps) {
  const [formData, setFormData] = useState<EgresoFormData>(VALORES_INICIALES);
  const [errores, setErrores] = useState<Partial<Record<keyof EgresoFormData, string>>>({});
  const [isPending, startTransition] = useTransition();

  const esEdicion = Boolean(egresoAEditar);

  useEffect(() => {
    if (!isOpen) return;

    if (egresoAEditar) {
      setFormData({
        concepto: egresoAEditar.concepto,
        descripcion: egresoAEditar.descripcion ?? "",
        monto: String(egresoAEditar.monto),
        fecha: egresoAEditar.fecha,
        tipo: egresoAEditar.tipo,
        metodoPago: egresoAEditar.metodoPago,
        referencia: egresoAEditar.referencia ?? "",
      });
    } else {
      setFormData(VALORES_INICIALES);
    }
    setErrores({});
  }, [isOpen, egresoAEditar]);

  const set = <K extends keyof EgresoFormData>(key: K, value: EgresoFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errores[key]) setErrores((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const resultado = esEdicion
        ? await editarEgreso(egresoAEditar!.id, formData)
        : await crearEgreso(formData);

      if (resultado.success) {
        onSuccess(resultado.message ?? "Operación exitosa.");
        onClose();
      } else {
        setErrores(resultado.fieldErrors ?? {});
        onError(resultado.message);
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={esEdicion ? "Editar egreso" : "Nuevo egreso"}
      description={esEdicion ? "Actualiza los datos del egreso." : "Registra un nuevo gasto de la tienda."}
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="concepto" className="mb-1 block text-sm font-medium text-slate-700">
            Concepto <span className="text-red-500">*</span>
          </label>
          <input
            id="concepto"
            type="text"
            value={formData.concepto}
            onChange={(e) => set("concepto", e.target.value)}
            aria-invalid={Boolean(errores.concepto)}
            aria-describedby={errores.concepto ? "concepto-error" : undefined}
            className={`${inputBase} ${errores.concepto ? inputError : ""}`}
            placeholder="Ej. Compra de refrescos"
          />
          {errores.concepto && (
            <p id="concepto-error" className="mt-1 text-xs text-red-600">
              {errores.concepto}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-700">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            rows={2}
            className={`${inputBase} resize-none`}
            placeholder="Detalles adicionales (opcional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="monto" className="mb-1 block text-sm font-medium text-slate-700">
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                id="monto"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={formData.monto}
                onChange={(e) => set("monto", e.target.value)}
                aria-invalid={Boolean(errores.monto)}
                aria-describedby={errores.monto ? "monto-error" : undefined}
                className={`${inputBase} pl-6 ${errores.monto ? inputError : ""}`}
                placeholder="0.00"
              />
            </div>
            {errores.monto && (
              <p id="monto-error" className="mt-1 text-xs text-red-600">
                {errores.monto}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="fecha" className="mb-1 block text-sm font-medium text-slate-700">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => set("fecha", e.target.value)}
              aria-invalid={Boolean(errores.fecha)}
              aria-describedby={errores.fecha ? "fecha-error" : undefined}
              className={`${inputBase} ${errores.fecha ? inputError : ""}`}
            />
            {errores.fecha && (
              <p id="fecha-error" className="mt-1 text-xs text-red-600">
                {errores.fecha}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipo" className="mb-1 block text-sm font-medium text-slate-700">
              Tipo de egreso <span className="text-red-500">*</span>
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => set("tipo", e.target.value as TipoEgreso)}
              className={inputBase}
            >
              {(Object.keys(TIPO_LABELS) as TipoEgreso[]).map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="metodoPago" className="mb-1 block text-sm font-medium text-slate-700">
              Método de pago <span className="text-red-500">*</span>
            </label>
            <select
              id="metodoPago"
              value={formData.metodoPago}
              onChange={(e) => set("metodoPago", e.target.value as MetodoPago)}
              className={inputBase}
            >
              {(Object.keys(METODO_PAGO_LABELS) as MetodoPago[]).map((m) => (
                <option key={m} value={m}>
                  {METODO_PAGO_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="referencia" className="mb-1 block text-sm font-medium text-slate-700">
            Referencia
          </label>
          <input
            id="referencia"
            type="text"
            value={formData.referencia}
            onChange={(e) => set("referencia", e.target.value)}
            className={inputBase}
            placeholder="Ej. folio de factura, ticket (opcional)"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Guardando…" : esEdicion ? "Guardar cambios" : "Registrar egreso"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
