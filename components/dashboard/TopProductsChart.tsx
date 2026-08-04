"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { ProductoMasVendido } from "@/lib/actions/dashboard";

// Archivo vacío en /frontend. Implementado.

export default function TopProductsChart({
  datos,
}: {
  datos: ProductoMasVendido[];
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <h3 className="mb-4 font-semibold text-gray-800">Productos más vendidos</h3>

      {datos.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">
          Sin ventas suficientes para calcular el top.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={datos} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="nombre"
              width={130}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(v) => `${Number(v)} unidades`} />
            <Bar dataKey="unidades" fill="#6366f1" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
