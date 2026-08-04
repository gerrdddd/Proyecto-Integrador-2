"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requerirAdmin } from "@/lib/auth/guards";
import type { ProductoUI, ProductoFormData } from "@/types/inventario";

// ============================================================================
// La pantalla de Inventario vivía 100% en el cliente con 6 productos quemados
// en un arreglo. Aquí se conecta a MySQL de verdad.
//
// Toda action arranca con requerirAdmin(): es la segunda capa de seguridad,
// la que sí protege (el proxy no intercepta Server Actions).
// ============================================================================

type ResultadoAccion = { ok: true; mensaje: string } | { ok: false; mensaje: string };

/** Convierte el registro de Prisma (Decimal) al shape plano de la UI. */
function toProductoUI(p: {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: unknown;
  costo: unknown;
  stock: number;
  activo: boolean;
  sku: string | null;
  categoria: string | null;
}): ProductoUI {
  return {
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: Number(p.precio),
    costo: Number(p.costo),
    stock: p.stock,
    activo: p.activo,
    sku: p.sku ?? undefined,
    categoria: p.categoria ?? undefined,
  };
}

export async function obtenerProductos(): Promise<ProductoUI[]> {
  await requerirAdmin();
  const productos = await db.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
  return productos.map(toProductoUI);
}

export async function crearProducto(
  data: ProductoFormData
): Promise<ResultadoAccion> {
  await requerirAdmin();

  if (!data.codigo?.trim()) return { ok: false, mensaje: "El código es obligatorio." };
  if (!data.nombre?.trim()) return { ok: false, mensaje: "El nombre es obligatorio." };
  if (Number(data.precio) < 0) return { ok: false, mensaje: "El precio no puede ser negativo." };
  if (Number(data.stock) < 0) return { ok: false, mensaje: "El stock no puede ser negativo." };

  const existe = await db.producto.findUnique({ where: { codigo: data.codigo } });
  if (existe) return { ok: false, mensaje: "Ya existe un producto con ese código." };

  await db.producto.create({
    data: {
      codigo: data.codigo.trim(),
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      precio: Number(data.precio),
      costo: Number(data.costo ?? 0),
      stock: Number(data.stock ?? 0),
      sku: data.sku?.trim() || null,
      categoria: data.categoria?.trim() || null,
      activo: true,
    },
  });

  revalidatePath("/inventario");
  revalidatePath("/dashboard");
  return { ok: true, mensaje: `Producto "${data.nombre}" agregado con éxito.` };
}

export async function actualizarProducto(
  codigo: string,
  data: ProductoFormData
): Promise<ResultadoAccion> {
  await requerirAdmin();

  if (!data.nombre?.trim()) return { ok: false, mensaje: "El nombre es obligatorio." };

  await db.producto.update({
    where: { codigo },
    data: {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      precio: Number(data.precio),
      costo: Number(data.costo ?? 0),
      stock: Number(data.stock ?? 0),
      sku: data.sku?.trim() || null,
      categoria: data.categoria?.trim() || null,
    },
  });

  revalidatePath("/inventario");
  revalidatePath("/pos");
  revalidatePath("/dashboard");
  return { ok: true, mensaje: `Producto "${data.nombre}" actualizado.` };
}

/**
 * Borrado LÓGICO (activo = false), no físico.
 * Si se borrara la fila, los tickets viejos en `detalle_ventas` quedarían
 * apuntando a un producto inexistente y truena la llave foránea.
 */
export async function eliminarProducto(codigo: string): Promise<ResultadoAccion> {
  await requerirAdmin();

  await db.producto.update({ where: { codigo }, data: { activo: false } });

  revalidatePath("/inventario");
  revalidatePath("/pos");
  revalidatePath("/dashboard");
  return { ok: true, mensaje: "Producto eliminado del inventario." };
}
