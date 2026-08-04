import { CircleDollarSign, Calendar, Receipt } from "lucide-react";
import { formatMonto } from "@/lib/utils/egresos";
import type { ResumenEgresos } from "@/types/egresos";

interface ResumenCardsProps {
  resumen: ResumenEgresos;
}

export default function ResumenCards({ resumen }: ResumenCardsProps) {
  const tarjetas = [
    {
      label: "Gastado hoy",
      valor: resumen.totalHoy,
      icon: Calendar,
      accent: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Gastado este mes",
      valor: resumen.totalMes,
      icon: Receipt,
      accent: "text-amber-700 bg-amber-50",
    },
    {
      label: "Total acumulado",
      valor: resumen.totalGeneral,
      icon: CircleDollarSign,
      accent: "text-slate-700 bg-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tarjetas.map(({ label, valor, icon: Icon, accent }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
            <Icon size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-500">{label}</p>
            <p className="text-xl font-semibold tabular-nums text-slate-900">
              {formatMonto(valor)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
