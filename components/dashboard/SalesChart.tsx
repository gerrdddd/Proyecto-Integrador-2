"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Este archivo estaba VACÍO (0 líneas) en /frontend. Se implementa aquí.

export default function SalesChart({
  datos,
}: {
  datos: { dia: string; total: number }[];
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <h3 className="mb-4 font-semibold text-gray-800">Ventas del mes</h3>

      {datos.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">
          Aún no hay ventas registradas este mes.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={datos}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) =>
                new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(Number(v))
              }
              labelFormatter={(l) => `Día ${l}`}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#grad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
