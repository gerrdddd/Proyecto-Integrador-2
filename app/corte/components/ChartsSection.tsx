"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DistribucionPago, SemanaVentas } from "@/app/types/corte";

const COLOR_EFECTIVO = "#DC2626"; // red-600
const COLOR_TRANSFERENCIA = "#2563EB"; // blue-600

function formatoMoneda(valor: number) {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function formatoEjeY(valor: number) {
  if (valor >= 1000) return `$${(valor / 1000).toFixed(0)}k`;
  return `$${valor}`;
}

interface ChartsSectionProps {
  ventasPorSemana: SemanaVentas[];
  distribucionPago: DistribucionPago;
  periodoLabel: string;
}

export default function ChartsSection({
  ventasPorSemana,
  distribucionPago,
  periodoLabel,
}: ChartsSectionProps) {
  const dataDona = [
    { name: "Efectivo", value: distribucionPago.efectivo, color: COLOR_EFECTIVO },
    {
      name: "Transferencia",
      value: distribucionPago.transferencia,
      color: COLOR_TRANSFERENCIA,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Ventas por semana */}
      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm lg:col-span-8">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Ventas por Semana — {periodoLabel}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-600" /> Efectivo
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Transferencia
            </span>
          </div>
        </div>
        <p className="mb-4 text-xs text-gray-400">
          Comparativo efectivo vs transferencia
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ventasPorSemana} barGap={6}>
              <CartesianGrid vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="semana"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatoEjeY}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
              />
              <Tooltip formatter={(valor: number) => formatoMoneda(valor)} />
              <Bar dataKey="efectivo" fill={COLOR_EFECTIVO} radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="transferencia"
                fill={COLOR_TRANSFERENCIA}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribución de pago */}
      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm lg:col-span-4">
        <h3 className="text-sm font-semibold text-gray-800">
          Distribución de Pago
        </h3>
        <p className="mb-2 text-xs text-gray-400">{periodoLabel}</p>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataDona}
                dataKey="value"
                nameKey="name"
                innerRadius="65%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {dataDona.map((entrada) => (
                  <Cell key={entrada.name} fill={entrada.color} />
                ))}
              </Pie>
              <Tooltip formatter={(valor: number) => formatoMoneda(valor)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-red-600" /> Efectivo
            </span>
            <span className="font-semibold text-gray-800">
              {distribucionPago.porcentajeEfectivo}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Transferencia
            </span>
            <span className="font-semibold text-gray-800">
              {distribucionPago.porcentajeTransferencia}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
