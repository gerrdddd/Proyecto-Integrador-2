import type { Egreso, Prisma } from "@prisma/client";
import type { EgresoUI } from "@/app/types/egresos";

/** Formatea un número como moneda MXN. */
export function formatMonto(monto: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(monto);
}

/** Formatea una fecha ISO (YYYY-MM-DD) a formato legible es-MX. */
export function formatFecha(fechaISO: string): string {
  const [year, month, day] = fechaISO.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

/** Convierte el registro de Prisma (Decimal, Date) al shape plano usado en la UI. */
export function toEgresoUI(egreso: Egreso): EgresoUI {
  return {
    id: egreso.id,
    concepto: egreso.concepto,
    descripcion: egreso.descripcion,
    monto: Number(egreso.monto),
    fecha: egreso.fecha.toISOString().slice(0, 10),
    metodoPago: egreso.metodoPago,
    tipo: egreso.tipo,
    referencia: egreso.referencia,
  };
}

/** Devuelve el rango [inicio, fin) del día de hoy en hora local. */
export function rangoHoy(): { gte: Date; lt: Date } {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { gte: inicio, lt: fin };
}

/** Devuelve el rango [inicio, fin) del mes actual en hora local. */
export function rangoMesActual(): { gte: Date; lt: Date } {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
  return { gte: inicio, lt: fin };
}

export type EgresoWhereInput = Prisma.EgresoWhereInput;
