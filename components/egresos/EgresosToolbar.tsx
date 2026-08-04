"use client";

import { Search, ArrowUpDown, X } from "lucide-react";
import {
  METODO_PAGO_LABELS,
  TIPO_LABELS,
  type EgresosFiltros,
  type MetodoPago,
  type TipoEgreso,
} from "@/types/egresos";

interface EgresosToolbarProps {
  filtros: EgresosFiltros;
  onChange: (filtros: EgresosFiltros) => void;
  onLimpiar: () => void;
}

const inputBase =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export default function EgresosToolbar({ filtros, onChange, onLimpiar }: EgresosToolbarProps) {
  const hayFiltrosActivos =
    filtros.busqueda ||
    filtros.fechaInicio ||
    filtros.fechaFin ||
    filtros.metodoPago !== "TODOS" ||
    filtros.tipo !== "TODOS";

  const set = <K extends keyof EgresosFiltros>(key: K, value: EgresosFiltros[K]) => {
    onChange({ ...filtros, [key]: value });
  };

  const toggleOrden = () => {
    set("orden", filtros.orden === "asc" ? "desc" : "asc");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={filtros.busqueda}
            onChange={(e) => set("busqueda", e.target.value)}
            placeholder="Buscar por concepto, descripción o referencia…"
            aria-label="Buscar egresos"
            className={`${inputBase} pl-9`}
          />
        </div>

        {/* Rango de fechas */}
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="fecha-inicio">
            Fecha inicio
          </label>
          <input
            id="fecha-inicio"
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => set("fechaInicio", e.target.value)}
            className={`${inputBase} w-[145px]`}
          />
          <span className="text-sm text-slate-400" aria-hidden="true">
            —
          </span>
          <label className="sr-only" htmlFor="fecha-fin">
            Fecha fin
          </label>
          <input
            id="fecha-fin"
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => set("fechaFin", e.target.value)}
            className={`${inputBase} w-[145px]`}
          />
        </div>

        {/* Método de pago */}
        <label className="sr-only" htmlFor="filtro-metodo">
          Método de pago
        </label>
        <select
          id="filtro-metodo"
          value={filtros.metodoPago}
          onChange={(e) => set("metodoPago", e.target.value as MetodoPago | "TODOS")}
          className={`${inputBase} w-auto`}
        >
          <option value="TODOS">Todos los métodos</option>
          {(Object.keys(METODO_PAGO_LABELS) as MetodoPago[]).map((m) => (
            <option key={m} value={m}>
              {METODO_PAGO_LABELS[m]}
            </option>
          ))}
        </select>

        {/* Tipo */}
        <label className="sr-only" htmlFor="filtro-tipo">
          Tipo de egreso
        </label>
        <select
          id="filtro-tipo"
          value={filtros.tipo}
          onChange={(e) => set("tipo", e.target.value as TipoEgreso | "TODOS")}
          className={`${inputBase} w-auto`}
        >
          <option value="TODOS">Todos los tipos</option>
          {(Object.keys(TIPO_LABELS) as TipoEgreso[]).map((t) => (
            <option key={t} value={t}>
              {TIPO_LABELS[t]}
            </option>
          ))}
        </select>

        {/* Ordenar */}
        <div className="flex items-center gap-1.5">
          <label className="sr-only" htmlFor="ordenar-por">
            Ordenar por
          </label>
          <select
            id="ordenar-por"
            value={filtros.ordenarPor}
            onChange={(e) => set("ordenarPor", e.target.value as "fecha" | "monto")}
            className={`${inputBase} w-auto`}
          >
            <option value="fecha">Ordenar por fecha</option>
            <option value="monto">Ordenar por monto</option>
          </select>
          <button
            type="button"
            onClick={toggleOrden}
            aria-label={filtros.orden === "asc" ? "Orden ascendente" : "Orden descendente"}
            title={filtros.orden === "asc" ? "Ascendente" : "Descendente"}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <ArrowUpDown size={16} className={filtros.orden === "asc" ? "rotate-180" : ""} />
          </button>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={onLimpiar}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
