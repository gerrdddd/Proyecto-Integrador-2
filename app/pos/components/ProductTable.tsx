"use client";

import { Plus } from "lucide-react";
import type { ProductoUI } from "@/app/types/pos";

const STOCK_BAJO_UMBRAL = 10;

function formatoMoneda(valor: number) {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

interface ProductTableProps {
  productos: ProductoUI[];
  totalProductos: number;
  onAgregar: (producto: ProductoUI) => void;
}

export default function ProductTable({
  productos,
  totalProductos,
  onAgregar,
}: ProductTableProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Catálogo de Productos
        </h2>
        <span className="text-xs text-gray-500">
          {totalProductos} productos
        </span>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-gray-100">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => {
              const stockBajo = producto.stock < STOCK_BAJO_UMBRAL;

              return (
                <tr
                  key={producto.codigo}
                  className={`border-b border-gray-50 last:border-0 ${
                    stockBajo ? "bg-red-50/40" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 align-top text-xs text-gray-400">
                    {producto.codigo}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-gray-800">
                      {producto.nombre}
                    </p>
                    {producto.descripcion && (
                      <p className="text-xs text-gray-400">
                        {producto.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        stockBajo ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {stockBajo && "⚠"} {producto.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top font-medium text-gray-800">
                    {formatoMoneda(producto.precio)}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <button
                      onClick={() => onAgregar(producto)}
                      disabled={producto.stock === 0}
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar
                    </button>
                  </td>
                </tr>
              );
            })}

            {productos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                  No se encontraron productos con ese criterio de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Stock bajo
          (menos de {STOCK_BAJO_UMBRAL} unidades)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-300" /> Stock normal
        </span>
      </div>
    </div>
  );
}