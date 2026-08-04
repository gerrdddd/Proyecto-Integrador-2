import { requerirAdmin } from "@/lib/auth/guards";
import EgresosClient from "@/components/egresos/EgresosClient";
import { obtenerEgresos, obtenerResumen } from "@/lib/actions/egresos";
import { FILTROS_INICIALES } from "@/types/egresos";

export const metadata = {
  title: "Egresos y Gastos · La Güera",
};

// Página siempre fresca: los totales dependen de la fecha/hora actual.
export const dynamic = "force-dynamic";

export default async function EgresosPage() {
  await requerirAdmin(); // 🔒 pantalla exclusiva de admin

  const [egresosIniciales, resumenInicial] = await Promise.all([
    obtenerEgresos(FILTROS_INICIALES),
    obtenerResumen(),
  ]);

  return (
    <EgresosClient egresosIniciales={egresosIniciales} resumenInicial={resumenInicial} />
  );
}
