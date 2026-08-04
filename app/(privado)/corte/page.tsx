import { requerirAdmin } from "@/lib/auth/guards";
import { obtenerResumenCorte } from "@/lib/actions/corte";
import CorteClient from "@/components/corte/CorteClient";

// El dashboard siempre debe reflejar ventas y egresos recién registrados
// en el POS, así que se desactiva el cache estático de la ruta.
export const dynamic = "force-dynamic";

export default async function CorteDeCajaPage() {
  await requerirAdmin(); // 🔒 pantalla exclusiva de admin

  // Carga inicial: por defecto "mensual", igual que en el mockup.
  const resumenInicial = await obtenerResumenCorte("mensual");

  return <CorteClient resumenInicial={resumenInicial} />;
}
