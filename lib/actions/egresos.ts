"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requerirAdmin } from "@/lib/auth/guards";
import { rangoHoy, rangoMesActual, toEgresoUI } from "@/lib/utils/egresos";
import type {
  ActionResult,
  EgresoFormData,
  EgresosFiltros,
  EgresoUI,
  ResumenEgresos,
} from "@/types/egresos";

// ============================================================================
// Validación de negocio (capa de servicio, separada de la UI y del acceso
// a datos crudo de Prisma).
// ============================================================================

function validarEgreso(data: EgresoFormData): Partial<Record<keyof EgresoFormData, string>> {
  const errores: Partial<Record<keyof EgresoFormData, string>> = {};

  if (!data.concepto?.trim()) {
    errores.concepto = "El concepto es obligatorio.";
  } else if (data.concepto.trim().length > 150) {
    errores.concepto = "El concepto no puede exceder 150 caracteres.";
  }

  const montoNum = Number(data.monto);
  if (data.monto === "" || Number.isNaN(montoNum)) {
    errores.monto = "El monto es obligatorio.";
  } else if (montoNum <= 0) {
    errores.monto = "El monto debe ser mayor a cero.";
  }

  if (!data.fecha?.trim()) {
    errores.fecha = "La fecha es obligatoria.";
  }

  if (!data.tipo) {
    errores.tipo = "Selecciona un tipo de egreso.";
  }

  if (!data.metodoPago) {
    errores.metodoPago = "Selecciona un método de pago.";
  }

  return errores;
}

// ============================================================================
// Consulta con filtros, orden y búsqueda
// ============================================================================

export async function obtenerEgresos(filtros: EgresosFiltros): Promise<EgresoUI[]> {
  await requerirAdmin(); // 🔒 módulo exclusivo de admin
  const where: Record<string, unknown> = {};

  if (filtros.busqueda.trim()) {
    const termino = filtros.busqueda.trim();
    where.OR = [
      { concepto: { contains: termino } },
      { descripcion: { contains: termino } },
      { referencia: { contains: termino } },
    ];
  }

  if (filtros.fechaInicio || filtros.fechaFin) {
    where.fecha = {
      ...(filtros.fechaInicio ? { gte: new Date(filtros.fechaInicio) } : {}),
      ...(filtros.fechaFin ? { lte: new Date(filtros.fechaFin) } : {}),
    };
  }

  if (filtros.metodoPago !== "TODOS") {
    where.metodoPago = filtros.metodoPago;
  }

  if (filtros.tipo !== "TODOS") {
    where.tipo = filtros.tipo;
  }

  const egresos = await prisma.egreso.findMany({
    where,
    orderBy: { [filtros.ordenarPor]: filtros.orden },
  });

  return egresos.map(toEgresoUI);
}

// ============================================================================
// Totales: hoy, mes, histórico
// ============================================================================

export async function obtenerResumen(): Promise<ResumenEgresos> {
  await requerirAdmin(); // 🔒
  const [hoy, mes, general] = await Promise.all([
    prisma.egreso.aggregate({
      _sum: { monto: true },
      where: { fecha: rangoHoy() },
    }),
    prisma.egreso.aggregate({
      _sum: { monto: true },
      where: { fecha: rangoMesActual() },
    }),
    prisma.egreso.aggregate({
      _sum: { monto: true },
    }),
  ]);

  return {
    totalHoy: Number(hoy._sum.monto ?? 0),
    totalMes: Number(mes._sum.monto ?? 0),
    totalGeneral: Number(general._sum.monto ?? 0),
  };
}

// ============================================================================
// Crear
// ============================================================================

export async function crearEgreso(data: EgresoFormData): Promise<ActionResult<EgresoUI>> {
  // 🔒 Sin esta línea, un cajero podría llamar la action desde la consola
  // del navegador: proxy.ts NO intercepta Server Actions.
  const sesion = await requerirAdmin();

  const errores = validarEgreso(data);
  if (Object.keys(errores).length > 0) {
    return { success: false, message: "Revisa los campos marcados.", fieldErrors: errores };
  }

  try {
    const egreso = await prisma.egreso.create({
      data: {
        concepto: data.concepto.trim(),
        descripcion: data.descripcion.trim() || null,
        monto: Number(data.monto),
        fecha: new Date(data.fecha),
        tipo: data.tipo,
        metodoPago: data.metodoPago,
        referencia: data.referencia.trim() || null,
        // Sale de la SESIÓN, nunca del formulario: así nadie puede
        // registrar un egreso a nombre de otro usuario.
        id_usuario: sesion.idUsuario,
      },
    });

    revalidatePath("/egresos");
    revalidatePath("/corte");
    revalidatePath("/dashboard");
    return { success: true, data: toEgresoUI(egreso), message: "Egreso registrado correctamente." };
  } catch (error) {
    console.error("Error al crear egreso:", error);
    return { success: false, message: "No se pudo registrar el egreso. Intenta de nuevo." };
  }
}

// ============================================================================
// Editar
// ============================================================================

export async function editarEgreso(
  id: number,
  data: EgresoFormData
): Promise<ActionResult<EgresoUI>> {
  await requerirAdmin(); // 🔒

  const errores = validarEgreso(data);
  if (Object.keys(errores).length > 0) {
    return { success: false, message: "Revisa los campos marcados.", fieldErrors: errores };
  }

  try {
    const egreso = await prisma.egreso.update({
      where: { id },
      data: {
        concepto: data.concepto.trim(),
        descripcion: data.descripcion.trim() || null,
        monto: Number(data.monto),
        fecha: new Date(data.fecha),
        tipo: data.tipo,
        metodoPago: data.metodoPago,
        referencia: data.referencia.trim() || null,
      },
    });

    revalidatePath("/egresos");
    return { success: true, data: toEgresoUI(egreso), message: "Egreso actualizado correctamente." };
  } catch (error) {
    console.error("Error al editar egreso:", error);
    return { success: false, message: "No se pudo actualizar el egreso. Intenta de nuevo." };
  }
}

// ============================================================================
// Eliminar
// ============================================================================

export async function eliminarEgreso(id: number): Promise<ActionResult<{ id: number }>> {
  await requerirAdmin(); // 🔒

  try {
    await prisma.egreso.delete({ where: { id } });
    revalidatePath("/egresos");
    return { success: true, data: { id }, message: "Egreso eliminado correctamente." };
  } catch (error) {
    console.error("Error al eliminar egreso:", error);
    return { success: false, message: "No se pudo eliminar el egreso. Intenta de nuevo." };
  }
}
