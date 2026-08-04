"use client";

import { useState, useTransition } from "react";
import { Calendar } from "lucide-react";
import Header from "@/components/corte/Header";
import KPICards from "@/components/corte/KPICards";
import ChartsSection from "@/components/corte/ChartsSection";
import CuadreStatus from "@/components/corte/CuadreStatus";
import MovimientosTabla from "@/components/corte/MovimientosTabla";
import { obtenerResumenCorte } from "@/lib/actions/corte";
import type { CorteResumen, PeriodoTipo } from "@/types/corte";

const PERIODOS: { value: PeriodoTipo; label: string }[] = [
  { value: "diario", label: "Diario" },
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
];

interface CorteClientProps {
  resumenInicial: CorteResumen;
}

/**
 * Coordina el filtro de periodo (Diario / Mensual / Anual). Al cambiar de
 * periodo llama a la server action `obtenerResumenCorte` para traer datos
 * frescos desde MySQL y actualiza todo el dashboard.
 */
export default function CorteClient({ resumenInicial }: CorteClientProps) {
  const [resumen, setResumen] = useState<CorteResumen>(resumenInicial);
  const [isPending, startTransition] = useTransition();

  function cambiarPeriodo(periodo: PeriodoTipo) {
    if (periodo === resumen.periodo) return;
    startTransition(async () => {
      const nuevoResumen = await obtenerResumenCorte(periodo);
      setResumen(nuevoResumen);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
        {/* Título + filtros de periodo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">Corte de Caja</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-md border border-gray-200 bg-white p-1">
              {PERIODOS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => cambiarPeriodo(p.value)}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                    resumen.periodo === p.value
                      ? "bg-red-600 text-white"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              Periodo: <span className="font-medium">{resumen.periodoLabel}</span>
            </div>
          </div>
        </div>

        <div className={isPending ? "opacity-60 transition-opacity" : ""}>
          <div className="space-y-4">
            <KPICards kpis={resumen.kpis} />

            <ChartsSection
              ventasPorSemana={resumen.ventasPorSemana}
              distribucionPago={resumen.distribucionPago}
              periodoLabel={resumen.periodoLabel}
            />

            <CuadreStatus
              cuadreEfectivo={resumen.cuadreEfectivo}
              cuadreTransferencia={resumen.cuadreTransferencia}
            />

            <MovimientosTabla movimientos={resumen.movimientos} />
          </div>
        </div>
      </main>
    </div>
  );
}
