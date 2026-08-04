import { DollarSign, Package, TriangleAlert, TrendingUp } from "lucide-react";
import { requerirAdmin } from "@/lib/auth/guards";
import {
  obtenerKpis,
  obtenerTopProductos,
  obtenerVentasRecientes,
  obtenerAlertasStock,
  obtenerVentasPorDia,
} from "@/lib/actions/dashboard";
import KpiCard from "@/components/dashboard/KpiCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";
import StockAlerts from "@/components/dashboard/StockAlerts";
import RecentMovementsTable from "@/components/dashboard/RecentMovementsTable";

export const metadata = { title: "Dashboard · La Güera" };
export const dynamic = "force-dynamic";

const mxn = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);

export default async function DashboardPage() {
  const sesion = await requerirAdmin(); // 🔒 pantalla exclusiva de admin

  // Todo en paralelo: son cinco consultas independientes.
  const [kpis, top, recientes, alertas, porDia] = await Promise.all([
    obtenerKpis(),
    obtenerTopProductos(),
    obtenerVentasRecientes(),
    obtenerAlertasStock(),
    obtenerVentasPorDia(),
  ]);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Hola, {sesion.nombre.split(" ")[0]}
        </h2>
        <p className="text-gray-500">Indicadores principales del sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Ventas Hoy"
          value={mxn(kpis.ventasHoy)}
          icon={<DollarSign size={28} />}
          color="bg-green-500"
        />
        <KpiCard
          title="Ventas del Mes"
          value={mxn(kpis.ventasMes)}
          icon={<TrendingUp size={28} />}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart datos={porDia} />
        <TopProductsChart datos={top} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentMovementsTable ventas={recientes} />
        </div>
        <StockAlerts alertas={alertas} />
      </div>
    </div>
  );
}
