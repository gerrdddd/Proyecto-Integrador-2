import type { MovimientoRow } from "@/types/corte";

const TIPO_STYLES: Record<MovimientoRow["tipo"], string> = {
  Venta: "bg-blue-100 text-blue-700",
  Cancelación: "bg-red-100 text-red-700",
  Devolución: "bg-yellow-100 text-yellow-700",
};

const ESTADO_STYLES: Record<MovimientoRow["estado"], string> = {
  Completada: "text-green-600",
  Cancelada: "text-red-600",
  Devuelta: "text-yellow-600",
};

function formatoMoneda(valor: number) {
  const signo = valor < 0 ? "-" : "+";
  return `${signo}${Math.abs(valor).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })}`;
}

interface MovimientosTablaProps {
  movimientos: MovimientoRow[];
}

export default function MovimientosTabla({ movimientos }: MovimientosTablaProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Movimientos Recientes
          </h3>
          <p className="text-xs text-gray-400">
            Últimas {movimientos.length} transacciones del periodo
          </p>
        </div>
        <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          Filtrar por tipo
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Fecha / Hora</th>
              <th className="px-3 py-2 font-medium">Cajera</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Productos</th>
              <th className="px-3 py-2 font-medium">Método</th>
              <th className="px-3 py-2 font-medium">Monto</th>
              <th className="px-3 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr
                key={mov.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-3 py-2.5 text-gray-400">{mov.folio}</td>
                <td className="px-3 py-2.5 text-gray-600">{mov.fechaHora}</td>
                <td className="px-3 py-2.5 text-gray-800">{mov.cajera}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      TIPO_STYLES[mov.tipo]
                    }`}
                  >
                    {mov.tipo}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-gray-600">
                  {mov.productos} producto{mov.productos === 1 ? "" : "s"}
                </td>
                <td className="px-3 py-2.5 text-gray-600">{mov.metodo}</td>
                <td
                  className={`px-3 py-2.5 font-semibold ${
                    mov.monto < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatoMoneda(mov.monto)}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      ESTADO_STYLES[mov.estado]
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {mov.estado}
                  </span>
                </td>
              </tr>
            ))}

            {movimientos.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-10 text-center text-sm text-gray-400"
                >
                  No hay movimientos registrados en este periodo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
