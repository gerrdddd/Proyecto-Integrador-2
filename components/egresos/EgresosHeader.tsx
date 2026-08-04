"use client";

import { Plus } from "lucide-react";

interface EgresosHeaderProps {
  onNuevo: () => void;
}

export default function EgresosHeader({ onNuevo }: EgresosHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Egresos y Gastos</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Registra y controla los gastos de La Güera.
        </p>
      </div>
      <button
        type="button"
        onClick={onNuevo}
        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2"
      >
        <Plus size={18} />
        Nuevo egreso
      </button>
    </div>
  );
}
