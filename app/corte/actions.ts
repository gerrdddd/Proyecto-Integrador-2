"use server";

import { db } from "@/app/lib/db";
import type {
  CorteResumen,
  CuadreData,
  DistribucionPago,
  KPICardData,
  MovimientoRow,
  PeriodoTipo,
  SemanaVentas,
} from "@/app/types/corte";

/**
 * ============================================================================
 * NOTA IMPORTANTE SOBRE EL SCHEMA (léela antes de correr esto en producción)
 * ============================================================================
 * El script SQL que compartiste para `ventas` solo trae:
 *   id_venta, id_usuario, fecha, total
 *
 * El dashboard del mockup necesita, por venta, DOS datos que esa tabla no
 * tiene todavía:
 *   1. método de pago (efectivo / transferencia)
 *   2. estado (completada / cancelada / devuelta)
 *
 * Para que el código sea funcional le agregué esos dos campos como ENUM.
 * Necesitas correr esta migración (o el equivalente en tu `schema.prisma`)
 * antes de que estas queries funcionen:
 *
 *   ALTER TABLE ventas
 *     ADD COLUMN metodo_pago ENUM('efectivo','transferencia') NOT NULL DEFAULT 'efectivo',
 *     ADD COLUMN estado ENUM('completada','cancelada','devuelta') NOT NULL DEFAULT 'completada';
 *
 * Sobre el panel "Transferencias — Diferencia Detectada": tu schema tampoco
 * tiene una tabla de conciliación bancaria (el banco vs. lo que el sistema
 * registró). Mientras no exista esa tabla, aproximo la "diferencia" restando
 * los egresos con `categoria = 'ajuste_transferencia'` registrados en ese
 * periodo. Está señalado más abajo con el mismo comentario — reemplázalo por
 * tu tabla real de conciliaciones cuando la tengas.
 *
 * Uso `db.$queryRaw` (SQL crudo) en vez de los métodos generados de Prisma
 * (`db.venta.findMany`, etc.) porque no tengo tu `schema.prisma` real: así
 * el código funciona sin importar cómo esté nombrado el modelo en Prisma,
 * mientras las tablas/columnas de MySQL coincidan con las de tu script.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Utilidades de fechas
// ---------------------------------------------------------------------------

interface RangoFechas {
  inicio: Date;
  fin: Date;
  inicioPrev: Date;
  finPrev: Date;
  label: string;
  comparativoLabel: string;
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_ABREV = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function obtenerRangoFechas(periodo: PeriodoTipo, fechaRef: Date): RangoFechas {
  if (periodo === "diario") {
    const inicio = new Date(fechaRef);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setHours(23, 59, 59, 999);

    const inicioPrev = new Date(inicio);
    inicioPrev.setDate(inicioPrev.getDate() - 1);
    const finPrev = new Date(inicioPrev);
    finPrev.setHours(23, 59, 59, 999);

    return {
      inicio,
      fin,
      inicioPrev,
      finPrev,
      label: inicio.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      comparativoLabel: "vs ayer",
    };
  }

  if (periodo === "anual") {
    const anio = fechaRef.getFullYear();
    const inicio = new Date(anio, 0, 1, 0, 0, 0, 0);
    const fin = new Date(anio, 11, 31, 23, 59, 59, 999);
    const inicioPrev = new Date(anio - 1, 0, 1, 0, 0, 0, 0);
    const finPrev = new Date(anio - 1, 11, 31, 23, 59, 59, 999);

    return {
      inicio,
      fin,
      inicioPrev,
      finPrev,
      label: `${anio}`,
      comparativoLabel: "vs año anterior",
    };
  }

  // mensual (default)
  const anio = fechaRef.getFullYear();
  const mes = fechaRef.getMonth();
  const inicio = new Date(anio, mes, 1, 0, 0, 0, 0);
  const fin = new Date(anio, mes + 1, 0, 23, 59, 59, 999);
  const inicioPrev = new Date(anio, mes - 1, 1, 0, 0, 0, 0);
  const finPrev = new Date(anio, mes, 0, 23, 59, 59, 999);

  return {
    inicio,
    fin,
    inicioPrev,
    finPrev,
    label: `${MESES[mes][0].toUpperCase()}${MESES[mes].slice(1)} ${anio}`,
    comparativoLabel: `vs ${MESES_ABREV[(mes - 1 + 12) % 12]}`,
  };
}

function calcularCambioPorcentaje(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Number((((actual - anterior) / anterior) * 100).toFixed(1));
}

// ---------------------------------------------------------------------------
// Queries individuales
// ---------------------------------------------------------------------------

interface AgregadoMetodo {
  metodo_pago: "efectivo" | "transferencia";
  monto: number;
  transacciones: number;
}

async function obtenerAgregadoPorMetodo(
  inicio: Date,
  fin: Date
): Promise<AgregadoMetodo[]> {
  const filas = await db.$queryRaw<AgregadoMetodo[]>`
    SELECT
      metodo_pago,
      COALESCE(SUM(total), 0) AS monto,
      COUNT(*) AS transacciones
    FROM ventas
    WHERE fecha BETWEEN ${inicio} AND ${fin}
      AND estado <> 'cancelada'
    GROUP BY metodo_pago
  `;

  return filas.map((fila) => ({
    metodo_pago: fila.metodo_pago,
    monto: Number(fila.monto),
    transacciones: Number(fila.transacciones),
  }));
}

async function obtenerTotalTransacciones(inicio: Date, fin: Date): Promise<number> {
  const filas = await db.$queryRaw<{ total: number }[]>`
    SELECT COUNT(*) AS total
    FROM ventas
    WHERE fecha BETWEEN ${inicio} AND ${fin}
  `;
  return Number(filas[0]?.total ?? 0);
}

async function construirKPIs(rango: RangoFechas): Promise<KPICardData[]> {
  const [actual, anterior, transaccionesActual, transaccionesAnterior] =
    await Promise.all([
      obtenerAgregadoPorMetodo(rango.inicio, rango.fin),
      obtenerAgregadoPorMetodo(rango.inicioPrev, rango.finPrev),
      obtenerTotalTransacciones(rango.inicio, rango.fin),
      obtenerTotalTransacciones(rango.inicioPrev, rango.finPrev),
    ]);

  const sumar = (lista: AgregadoMetodo[], metodo?: "efectivo" | "transferencia") =>
    lista
      .filter((item) => !metodo || item.metodo_pago === metodo)
      .reduce((acc, item) => acc + item.monto, 0);

  const totalActual = sumar(actual);
  const totalAnterior = sumar(anterior);
  const efectivoActual = sumar(actual, "efectivo");
  const efectivoAnterior = sumar(anterior, "efectivo");
  const transferenciaActual = sumar(actual, "transferencia");
  const transferenciaAnterior = sumar(anterior, "transferencia");

  return [
    {
      id: "total",
      label: "Total de Ventas",
      monto: totalActual,
      esMoneda: true,
      cambioPorcentaje: calcularCambioPorcentaje(totalActual, totalAnterior),
      comparativoLabel: rango.comparativoLabel,
    },
    {
      id: "efectivo",
      label: "Ventas en Efectivo",
      monto: efectivoActual,
      esMoneda: true,
      cambioPorcentaje: calcularCambioPorcentaje(efectivoActual, efectivoAnterior),
      comparativoLabel: rango.comparativoLabel,
    },
    {
      id: "transferencia",
      label: "Ventas Transferencia",
      monto: transferenciaActual,
      esMoneda: true,
      cambioPorcentaje: calcularCambioPorcentaje(
        transferenciaActual,
        transferenciaAnterior
      ),
      comparativoLabel: rango.comparativoLabel,
    },
    {
      id: "transacciones",
      label: "N° de Transacciones",
      monto: transaccionesActual,
      esMoneda: false,
      cambioPorcentaje: calcularCambioPorcentaje(
        transaccionesActual,
        transaccionesAnterior
      ),
      comparativoLabel: rango.comparativoLabel,
    },
  ];
}

async function obtenerVentasPorSemana(
  inicio: Date,
  fin: Date
): Promise<SemanaVentas[]> {
  const filas = await db.$queryRaw<
    { semana_idx: number; metodo_pago: "efectivo" | "transferencia"; monto: number }[]
  >`
    SELECT
      FLOOR(DATEDIFF(fecha, ${inicio}) / 7) + 1 AS semana_idx,
      metodo_pago,
      COALESCE(SUM(total), 0) AS monto
    FROM ventas
    WHERE fecha BETWEEN ${inicio} AND ${fin}
      AND estado <> 'cancelada'
    GROUP BY semana_idx, metodo_pago
    ORDER BY semana_idx ASC
  `;

  const mapa = new Map<number, SemanaVentas>();
  for (const fila of filas) {
    const idx = Number(fila.semana_idx);
    if (!mapa.has(idx)) {
      mapa.set(idx, { semana: `Sem ${idx}`, efectivo: 0, transferencia: 0 });
    }
    const entrada = mapa.get(idx)!;
    if (fila.metodo_pago === "efectivo") entrada.efectivo = Number(fila.monto);
    else entrada.transferencia = Number(fila.monto);
  }

  return Array.from(mapa.values()).sort(
    (a, b) => Number(a.semana.split(" ")[1]) - Number(b.semana.split(" ")[1])
  );
}

function construirDistribucionPago(kpis: KPICardData[]): DistribucionPago {
  const efectivo = kpis.find((k) => k.id === "efectivo")?.monto ?? 0;
  const transferencia = kpis.find((k) => k.id === "transferencia")?.monto ?? 0;
  const total = efectivo + transferencia;

  return {
    efectivo,
    transferencia,
    porcentajeEfectivo: total > 0 ? Number(((efectivo / total) * 100).toFixed(1)) : 0,
    porcentajeTransferencia:
      total > 0 ? Number(((transferencia / total) * 100).toFixed(1)) : 0,
  };
}

async function obtenerCuadreEfectivo(
  inicio: Date,
  fin: Date,
  label: string
): Promise<CuadreData> {
  const filas = await db.$queryRaw<
    { esperado: number; registrado: number; diferencia: number }[]
  >`
    SELECT
      COALESCE(SUM(monto_inicial + ventas_dia - egresos_dia), 0) AS esperado,
      COALESCE(SUM(monto_final), 0) AS registrado,
      COALESCE(SUM(diferencia), 0) AS diferencia
    FROM cortes_caja
    WHERE fecha BETWEEN ${inicio} AND ${fin}
  `;

  const fila = filas[0] ?? { esperado: 0, registrado: 0, diferencia: 0 };
  const diferencia = Number(fila.diferencia);
  const esCorrecto = Math.abs(diferencia) < 0.01;

  return {
    titulo: "Efectivo — Sin Diferencias",
    montoEsperado: Number(fila.esperado),
    montoRegistrado: Number(fila.registrado),
    diferencia,
    estado: esCorrecto ? "correcto" : "alerta",
    mensaje: esCorrecto
      ? `Cuadre correcto — ${label}`
      : `Revisar corte de caja — ${label}`,
  };
}

async function obtenerCuadreTransferencia(
  inicio: Date,
  fin: Date,
  label: string
): Promise<CuadreData> {
  // Ver nota al inicio del archivo: no existe todavía una tabla real de
  // conciliación bancaria. Como aproximación, se resta cualquier egreso
  // registrado con categoria = 'ajuste_transferencia' dentro del periodo.
  const [ventasFilas, ajustesFilas] = await Promise.all([
    db.$queryRaw<{ monto: number }[]>`
      SELECT COALESCE(SUM(total), 0) AS monto
      FROM ventas
      WHERE fecha BETWEEN ${inicio} AND ${fin}
        AND metodo_pago = 'transferencia'
        AND estado <> 'cancelada'
    `,
    db.$queryRaw<{ monto: number }[]>`
      SELECT COALESCE(SUM(monto), 0) AS monto
      FROM egresos
      WHERE fecha BETWEEN ${inicio} AND ${fin}
        AND categoria = 'ajuste_transferencia'
    `,
  ]);

  const esperado = Number(ventasFilas[0]?.monto ?? 0);
  const ajuste = Number(ajustesFilas[0]?.monto ?? 0);
  const registrado = esperado - ajuste;
  const diferencia = registrado - esperado;
  const esCorrecto = Math.abs(diferencia) < 0.01;

  return {
    titulo: "Transferencias — Diferencia Detectada",
    montoEsperado: esperado,
    montoRegistrado: registrado,
    diferencia,
    estado: esCorrecto ? "correcto" : "alerta",
    mensaje: esCorrecto
      ? `Cuadre correcto — ${label}`
      : `Revisar transferencias del periodo — ${label}`,
  };
}

interface MovimientoCrudo {
  id_venta: number;
  fecha: Date;
  total: number;
  metodo_pago: "efectivo" | "transferencia";
  estado: "completada" | "cancelada" | "devuelta";
  cajera: string;
  productos: number;
}

async function obtenerMovimientosRecientes(
  inicio: Date,
  fin: Date,
  limite = 10
): Promise<MovimientoRow[]> {
  const filas = await db.$queryRaw<MovimientoCrudo[]>`
    SELECT
      v.id_venta,
      v.fecha,
      v.total,
      v.metodo_pago,
      v.estado,
      u.nombre AS cajera,
      COALESCE(SUM(dv.cantidad), 0) AS productos
    FROM ventas v
    INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
    LEFT JOIN detalle_ventas dv ON dv.id_venta = v.id_venta
    WHERE v.fecha BETWEEN ${inicio} AND ${fin}
    GROUP BY v.id_venta, v.fecha, v.total, v.metodo_pago, v.estado, u.nombre
    ORDER BY v.fecha DESC
    LIMIT ${limite}
  `;

  const ESTADO_LABEL: Record<MovimientoCrudo["estado"], MovimientoRow["estado"]> = {
    completada: "Completada",
    cancelada: "Cancelada",
    devuelta: "Devuelta",
  };

  const TIPO_LABEL: Record<MovimientoCrudo["estado"], MovimientoRow["tipo"]> = {
    completada: "Venta",
    cancelada: "Cancelación",
    devuelta: "Devolución",
  };

  return filas.map((fila) => ({
    id: Number(fila.id_venta),
    folio: `#${fila.id_venta}`,
    fechaHora: new Date(fila.fecha).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    cajera: fila.cajera,
    tipo: TIPO_LABEL[fila.estado],
    productos: Number(fila.productos),
    metodo: fila.metodo_pago === "efectivo" ? "Efectivo" : "Transferencia",
    monto: Number(fila.total),
    estado: ESTADO_LABEL[fila.estado],
  }));
}

// ---------------------------------------------------------------------------
// Server Action principal — consumida por page.tsx (carga inicial) y por
// CorteClient.tsx (cada vez que cambia el filtro de periodo)
// ---------------------------------------------------------------------------

export async function obtenerResumenCorte(
  periodo: PeriodoTipo,
  fechaRef: Date = new Date()
): Promise<CorteResumen> {
  const rango = obtenerRangoFechas(periodo, fechaRef);

  const [kpis, ventasPorSemana, cuadreEfectivo, cuadreTransferencia, movimientos] =
    await Promise.all([
      construirKPIs(rango),
      obtenerVentasPorSemana(rango.inicio, rango.fin),
      obtenerCuadreEfectivo(rango.inicio, rango.fin, rango.label),
      obtenerCuadreTransferencia(rango.inicio, rango.fin, rango.label),
      obtenerMovimientosRecientes(rango.inicio, rango.fin, 10),
    ]);

  return {
    periodo,
    periodoLabel: rango.label,
    kpis,
    ventasPorSemana,
    distribucionPago: construirDistribucionPago(kpis),
    cuadreEfectivo,
    cuadreTransferencia,
    movimientos,
  };
}
