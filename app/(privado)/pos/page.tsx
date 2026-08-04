import { db } from "@/lib/db";
import { requerirCaja } from "@/lib/auth/guards";
import PosClient from "@/components/pos/PosClient";
import type { ProductoUI } from "@/types/pos";

export const metadata = { title: "Punto de Venta · La Güera" };

// El stock y el catálogo deben reflejar siempre el estado más reciente.
export const dynamic = "force-dynamic";

export default async function PosPage() {
  // 🔒 Única pantalla que comparten ADMIN y CAJERO.
  const sesion = await requerirCaja();

  const productos = await db.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  // Prisma devuelve `precio` como Decimal, que no es serializable de
  // Server -> Client Component. Se convierte a number aquí.
  const productosUI: ProductoUI[] = productos.map((producto) => ({
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    stock: producto.stock,
  }));

  return <PosClient productos={productosUI} cajero={sesion.nombre} />;
}
