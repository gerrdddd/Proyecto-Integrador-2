import { DollarSign, CreditCard, Send, Users } from "lucide-react";
import type { KPICardData } from "@/types/corte";

const ICONOS: Record<KPICardData["id"], { icon: typeof DollarSign; bg: string; fg: string }> = {
  total: { icon: DollarSign, bg: "bg-red-100", fg: "text-red-600" },
  efectivo: { icon: CreditCard, bg: "bg-green-100", fg: "text-green-600" },
  transferencia: { icon: Send, bg: "bg-blue-100", fg: "text-blue-600" },
  transacciones: { icon: Users, bg: "bg-orange-100", fg: "text-orange-600" },
};

function formatoValor(monto: number, esMoneda: boolean) {
  if (!esMoneda) return monto.toLocaleString("es-MX");
  return monto.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

interface KPICardsProps {
  kpis: KPICardData[];
}

export default function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const { icon: Icon, bg, fg } = ICONOS[kpi.id];
        const esPositivo = kpi.cambioPorcentaje >= 0;

        return (
          <div
            key={kpi.id}
            className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className={`grid h-8 w-8 place-items-center rounded-md ${bg} ${fg}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <p className="mt-3 text-xs uppercase tracking-wide text-gray-400">
              {kpi.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {formatoValor(kpi.monto, kpi.esMoneda)}
            </p>

            <p
              className={`mt-1 text-xs font-medium ${
                esPositivo ? "text-green-600" : "text-red-500"
              }`}
            >
              {esPositivo ? "+" : ""}
              {kpi.cambioPorcentaje}% {kpi.comparativoLabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}
