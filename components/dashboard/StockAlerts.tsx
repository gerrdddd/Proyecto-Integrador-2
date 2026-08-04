import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import type { AlertaStock } from "@/lib/actions/dashboard";

// Archivo vacío en /frontend. Implementado.

export default function StockAlerts({ alertas }: { alertas: AlertaStock[] }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Alertas de stock</h3>
        <Link
          href="/inventario"
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          Ver inventario
        </Link>
      </div>

      {alertas.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Todo el catálogo tiene stock suficiente.
        </p>
      ) : (
        <ul className="space-y-2">
          {alertas.map((a) => (
            <li
              key={a.codigo}
              className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <TriangleAlert size={16} className="text-amber-500" />
                <span className="text-sm text-gray-800">{a.nombre}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  a.stock === 0
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {a.stock === 0 ? "Agotado" : `${a.stock} pzas`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
