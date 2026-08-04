import EgresosClient from "@/components/egresos/EgresosClient";
import { obtenerEgresos, obtenerResumen } from "@/app/egresos/actions";
import { FILTROS_INICIALES } from "@/app/types/egresos";

export const metadata = {
  title: "Egresos y Gastos · La Güera",
};

// Página siempre fresca: los totales dependen de la fecha/hora actual.
export const dynamic = "force-dynamic";

export default async function EgresosPage() {
  const [egresosIniciales, resumenInicial] = await Promise.all([
    obtenerEgresos(FILTROS_INICIALES),
    obtenerResumen(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <EgresosClient egresosIniciales={egresosIniciales} resumenInicial={resumenInicial} />
    </main>
  );
}
