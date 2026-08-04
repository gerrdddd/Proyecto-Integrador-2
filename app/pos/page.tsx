import {db} from "@/app/lib/db";
import PosClient from "./PosClient";
import type { ProductoUI } from "@/app/types/pos";

// Evita cachear la página: el stock y catálogo deben reflejar siempre
// el estado más reciente de la base de datos.
export const dynamic = "force-dynamic";

export default async function PosPage() {
  const productos = await db.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  //Se convierte a `number` aquí,
  // junto con el resto del mapeo a la forma que consume la UI.
  const productosUI: ProductoUI[] = productos.map((producto) => ({
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    stock: producto.stock,
  }));

  return <PosClient productos={productosUI} />;
}
