"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requerirCaja } from "@/lib/auth/guards";
import type { MetodoPago } from "@/types/egresos";
import type { ItemVenta, ResultadoVenta } from "@/types/venta";

// ============================================================================
// El POS antes solo hacía `alert("Venta procesada")` y vaciaba el carrito:
// nunca tocaba la base de datos. Aquí se registra de verdad.
// ============================================================================

export async function registrarVenta(
  items: ItemVenta[],
  metodoPago: MetodoPago = "EFECTIVO"
): Promise<ResultadoVenta> {
  // 🔒 El POS lo usan los dos roles, pero igual exige sesión válida.
  const sesion = await requerirCaja();

  if (items.length === 0) {
    return { ok: false, mensaje: "El carrito está vacío." };
  }

  try {
    // Transacción: o se guardan la venta, su detalle y el descuento de stock,
    // o no se guarda nada. Si no, quedarían ventas sin detalle o stock mal.
    const venta = await db.$transaction(async (tx) => {
      // Los precios se releen de la BD, NO se confía en lo que manda el
      // cliente: si no, cualquiera podría mandar precio 0 desde la consola.
      const productos = await tx.producto.findMany({
        where: { codigo: { in: items.map((i) => i.codigo) }, activo: true },
      });

      const detalle = items.map((item) => {
        const producto = productos.find((p) => p.codigo === item.codigo);
        if (!producto) {
          throw new Error(`El producto ${item.codigo} ya no está disponible.`);
        }
        if (item.cantidad <= 0) {
          throw new Error(`Cantidad inválida para ${producto.nombre}.`);
        }
        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente de "${producto.nombre}" (quedan ${producto.stock}).`
          );
        }

        const precio = Number(producto.precio);
        return {
          codigo_producto: producto.codigo,
          nombre_producto: producto.nombre,
          cantidad: item.cantidad,
          precio_unitario: precio,
          subtotal: precio * item.cantidad,
        };
      });

      const total = detalle.reduce((acc, d) => acc + d.subtotal, 0);

      const creada = await tx.venta.create({
        data: {
          id_usuario: sesion.idUsuario, // <- sale de la SESIÓN, no del formulario
          total,
          metodo_pago: metodoPago,
          estado: "COMPLETADA",
          detalle_ventas: { create: detalle },
        },
      });

      // Descuento de stock
      for (const d of detalle) {
        await tx.producto.update({
          where: { codigo: d.codigo_producto },
          data: { stock: { decrement: d.cantidad } },
        });
      }

      return { id: creada.id_venta, total };
    });

    revalidatePath("/pos");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    revalidatePath("/corte");

    return { ok: true, idVenta: venta.id, total: venta.total };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error ? error.message : "No se pudo registrar la venta.",
    };
  }
}
