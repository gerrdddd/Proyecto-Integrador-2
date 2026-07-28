import KpiCard from "./components/KpiCard";
import { getKpis } from "../lib/api";

import {
  DollarSign,
  Package,
  TriangleAlert,
  Users,
} from "lucide-react";

export default async function DashboardPage() {
  const kpis = await getKpis();

  return (
    <div className="space-y-8">

      {/* Título */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Resumen General
        </h2>

        <p className="text-gray-500">
          Indicadores principales del sistema.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          title="Ventas Hoy"
          value={`$${kpis.ventasHoy}`}
          icon={<DollarSign size={28} />}
          color="bg-green-500"
        />

        <KpiCard
          title="Ventas del Mes"
          value={`$${kpis.ventasMes}`}
          icon={<DollarSign size={28} />}
          color="bg-blue-500"
        />

        <KpiCard
          title="Productos"
          value={kpis.totalProductos}
          icon={<Package size={28} />}
          color="bg-purple-500"
        />

        <KpiCard
          title="Stock Bajo"
          value={kpis.productosStockBajo}
          icon={<TriangleAlert size={28} />}
          color="bg-red-500"
        />

      </div>

    </div>
  );
}