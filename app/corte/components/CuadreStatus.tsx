import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CuadreData } from "@/app/types/corte";

function formatoMoneda(valor: number) {
  const signo = valor < 0 ? "-" : "";
  return `${signo}${Math.abs(valor).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })}`;
}

interface PanelProps {
  data: CuadreData;
}

function Panel({ data }: PanelProps) {
  const esCorrecto = data.estado === "correcto";

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        esCorrecto ? "border-green-200" : "border-red-200"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {esCorrecto ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        )}
        <h3
          className={`text-sm font-semibold ${
            esCorrecto ? "text-green-700" : "text-red-700"
          }`}
        >
          {data.titulo}
        </h3>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Monto Esperado</dt>
          <dd className="font-medium text-gray-800">
            {formatoMoneda(data.montoEsperado)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Monto Registrado</dt>
          <dd className="font-medium text-gray-800">
            {formatoMoneda(data.montoRegistrado)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-gray-100 pt-2">
          <dt className="text-gray-500">Diferencia</dt>
          <dd
            className={`font-semibold ${
              esCorrecto ? "text-gray-800" : "text-red-600"
            }`}
          >
            {formatoMoneda(data.diferencia)}
          </dd>
        </div>
      </dl>

      <div
        className={`mt-4 rounded-md px-3 py-2 text-xs font-medium ${
          esCorrecto
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}
      >
        {esCorrecto ? "✓ " : "⚠ "}
        {data.mensaje}
      </div>
    </div>
  );
}

interface CuadreStatusProps {
  cuadreEfectivo: CuadreData;
  cuadreTransferencia: CuadreData;
}

export default function CuadreStatus({
  cuadreEfectivo,
  cuadreTransferencia,
}: CuadreStatusProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel data={cuadreEfectivo} />
      <Panel data={cuadreTransferencia} />
    </div>
  );
}
