import "server-only";

import { db } from "@/lib/db";
import { UMBRAL_STOCK_BAJO } from "@/types/inventario";

// ============================================================================
// Reemplaza a frontend/app/lib/api.ts, que devolvía arreglos quemados
// (`Promise.resolve(kpis)`). Aquí sí se consulta MySQL.
// ============================================================================

export type KpiData = {
  ventasHoy: number;
  ventasMes: number;
  totalProductos: number;
  productosStockBajo: number;
  egresosMes: number;
  utilidadMes: number;
};

export type ProductoMasVendido = {
  nombre: string;
  unidades: number;
  ingresos: number;
};

export type VentaReciente = {
  idVenta: number;
  fecha: string;
  cajero: string;
  total: number;
  metodo: string;
};

export type AlertaStock = {
  codigo: string;
  nombre: string;
  stock: number;
};

function rangoHoy() {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { gte: inicio, lt: fin };
}

function rangoMes() {
  const ahora = new Date();
  return {
    gte: new Date(ahora.getFullYear(), ahora.getMonth(), 1),
    lt: new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1),
  };
}

export async function obtenerKpis(): Promise<KpiData> {
  const hoy = rangoHoy();
  const mes = rangoMes();

  const [ventasHoy, ventasMes, totalProductos, stockBajo, egresosMes] =
    await Promise.all([
      db.venta.aggregate({
        _sum: { total: true },
        where: { fecha: hoy, estado: "COMPLETADA" },
      }),
      db.venta.aggregate({
        _sum: { total: true },
        where: { fecha: mes, estado: "COMPLETADA" },
      }),
      db.producto.count({ where: { activo: true } }),
      db.producto.count({
        where: { activo: true, stock: { lte: UMBRAL_STOCK_BAJO } },
      }),
      db.egreso.aggregate({ _sum: { monto: true }, where: { fecha: mes } }),
    ]);

  const totalVentasMes = Number(ventasMes._sum.total ?? 0);
  const totalEgresosMes = Number(egresosMes._sum.monto ?? 0);

  return {
    ventasHoy: Number(ventasHoy._sum.total ?? 0),
    ventasMes: totalVentasMes,
    totalProductos,
    productosStockBajo: stockBajo,
    egresosMes: totalEgresosMes,
    utilidadMes: totalVentasMes - totalEgresosMes,
  };
}

export async function obtenerTopProductos(
  limite = 5
): Promise<ProductoMasVendido[]> {
  const mes = rangoMes();

  const agrupado = await db.detalleVenta.groupBy({
    by: ["nombre_producto"],
    _sum: { cantidad: true, subtotal: true },
    where: { venta: { fecha: mes, estado: "COMPLETADA" } },
    orderBy: { _sum: { cantidad: "desc" } },
    take: limite,
  });

  return agrupado.map((fila) => ({
    nombre: String(fila.nombre_producto),
    unidades: Number(fila._sum.cantidad ?? 0),
    ingresos: Number(fila._sum.subtotal ?? 0),
  }));
}

export async function obtenerVentasRecientes(
  limite = 8
): Promise<VentaReciente[]> {
  const ventas = await db.venta.findMany({
    take: limite,
    orderBy: { fecha: "desc" },
    include: { usuario: { select: { nombre: true } } },
  });

  return ventas.map((v) => ({
    idVenta: v.id_venta,
    fecha: v.fecha.toISOString(),
    cajero: v.usuario.nombre,
    total: Number(v.total),
    metodo: v.metodo_pago,
  }));
}

export async function obtenerAlertasStock(limite = 6): Promise<AlertaStock[]> {
  const productos = await db.producto.findMany({
    where: { activo: true, stock: { lte: UMBRAL_STOCK_BAJO } },
    orderBy: { stock: "asc" },
    take: limite,
    select: { codigo: true, nombre: true, stock: true },
  });

  return productos;
}

/** Ventas por día del mes actual, para la gráfica. */
export async function obtenerVentasPorDia(): Promise<
  { dia: string; total: number }[]
> {
  const mes = rangoMes();

  const ventas = await db.venta.findMany({
    where: { fecha: mes, estado: "COMPLETADA" },
    select: { fecha: true, total: true },
    orderBy: { fecha: "asc" },
  });

  const porDia = new Map<string, number>();
  for (const v of ventas) {
    const clave = v.fecha.toISOString().slice(0, 10);
    porDia.set(clave, (porDia.get(clave) ?? 0) + Number(v.total));
  }

  return Array.from(porDia, ([dia, total]) => ({
    dia: dia.slice(8), // solo el número de día
    total,
  }));
}
