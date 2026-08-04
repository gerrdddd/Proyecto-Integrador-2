"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonto, formatFecha } from "@/lib/utils/egresos";
import { METODO_PAGO_LABELS, TIPO_LABELS, type EgresoUI } from "@/app/types/egresos";

interface EgresosTableProps {
  egresos: EgresoUI[];
  onEditar: (egreso: EgresoUI) => void;
  onEliminar: (egreso: EgresoUI) => void;
}

const PAGE_SIZE = 10;

const TIPO_BADGE: Record<EgresoUI["tipo"], string> = {
  GASTO: "bg-red-50 text-red-700",
  COMPRA: "bg-blue-50 text-blue-700",
  SERVICIO: "bg-purple-50 text-purple-700",
  NOMINA: "bg-amber-50 text-amber-700",
  OTRO: "bg-slate-100 text-slate-600",
};

export default function EgresosTable({ egresos, onEditar, onEliminar }: EgresosTableProps) {
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(egresos.length / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas);

  const egresosPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * PAGE_SIZE;
    return egresos.slice(inicio, inicio + PAGE_SIZE);
  }, [egresos, paginaSegura]);

  if (egresos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Receipt size={22} aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">No hay egresos que mostrar</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Registra un nuevo egreso o ajusta los filtros de búsqueda para ver resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-4 py-3">Fecha</th>
              <th scope="col" className="px-4 py-3">Concepto</th>
              <th scope="col" className="px-4 py-3">Descripción</th>
              <th scope="col" className="px-4 py-3">Tipo</th>
              <th scope="col" className="px-4 py-3">Método de pago</th>
              <th scope="col" className="px-4 py-3 text-right">Monto</th>
              <th scope="col" className="px-4 py-3">Referencia</th>
              <th scope="col" className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {egresosPagina.map((egreso) => (
              <tr key={egreso.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatFecha(egreso.fecha)}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{egreso.concepto}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-500">
                  {egreso.descripcion || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TIPO_BADGE[egreso.tipo]}`}
                  >
                    {TIPO_LABELS[egreso.tipo]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {METODO_PAGO_LABELS[egreso.metodoPago]}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
                  {formatMonto(egreso.monto)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {egreso.referencia || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEditar(egreso)}
                      aria-label={`Editar egreso ${egreso.concepto}`}
                      title="Editar"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEliminar(egreso)}
                      aria-label={`Eliminar egreso ${egreso.concepto}`}
                      title="Eliminar"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Página {paginaSegura} de {totalPaginas} · {egresos.length} registros
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaSegura === 1}
              aria-label="Página anterior"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaSegura === totalPaginas}
              aria-label="Página siguiente"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
