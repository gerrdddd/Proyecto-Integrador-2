import { obtenerResumenCorte } from "./actions";
import CorteClient from "./CorteClient";

// El dashboard siempre debe reflejar ventas y egresos recién registrados
// en el POS, así que se desactiva el cache estático de la ruta.
export const dynamic = "force-dynamic";

export default async function CorteDeCajaPage() {
  // Carga inicial: por defecto "mensual", igual que en el mockup.
  const resumenInicial = await obtenerResumenCorte("mensual");

  return <CorteClient resumenInicial={resumenInicial} />;
}
