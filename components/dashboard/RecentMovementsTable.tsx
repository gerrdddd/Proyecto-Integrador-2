import type { VentaReciente } from "@/lib/actions/dashboard";

// Archivo vacío en /frontend. Implementado.

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

export default function RecentMovementsTable({
  ventas,
}: {
  ventas: VentaReciente[];
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <h3 className="mb-4 font-semibold text-gray-800">Últimas ventas</h3>

      {ventas.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Todavía no se registran ventas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="pb-2 font-medium">Folio</th>
                <th className="pb-2 font-medium">Fecha</th>
                <th className="pb-2 font-medium">Cajero</th>
                <th className="pb-2 font-medium">Método</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.idVenta} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-mono text-xs text-gray-500">
                    #{String(v.idVenta).padStart(5, "0")}
                  </td>
                  <td className="py-2 text-gray-700">
                    {new Date(v.fecha).toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2 text-gray-700">{v.cajero}</td>
                  <td className="py-2 text-gray-600 capitalize">
                    {v.metodo.toLowerCase()}
                  </td>
                  <td className="py-2 text-right font-semibold text-gray-800">
                    {mxn(v.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
