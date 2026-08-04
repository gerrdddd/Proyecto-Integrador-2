import { requerirAdmin } from "@/lib/auth/guards";
import { obtenerProductos } from "@/lib/actions/inventario";
import InventarioClient from "@/components/inventario/InventarioClient";

export const metadata = { title: "Inventario · La Güera" };

// El stock cambia con cada venta: nunca cachear esta ruta.
export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  await requerirAdmin(); // 🔒 segunda capa (la primera es proxy.ts)

  const productos = await obtenerProductos();

  return <InventarioClient productosIniciales={productos} />;
}
