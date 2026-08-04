// Tipos compartidos entre el Server Component (page.tsx), las server actions
// (actions.ts) y los componentes de cliente del módulo "Corte de Caja".

export type PeriodoTipo = "diario" | "mensual" | "anual";

export type MetodoPago = "efectivo" | "transferencia";

export type EstadoVenta = "completada" | "cancelada" | "devuelta";

// --- KPI cards (Total ventas, Efectivo, Transferencia, Transacciones) ---
export interface KPICardData {
  id: "total" | "efectivo" | "transferencia" | "transacciones";
  label: string;
  monto: number;
  esMoneda: boolean;
  cambioPorcentaje: number; // positivo o negativo, ej. 12.4 o -3.2
  comparativoLabel: string; // ej. "vs abr"
}

// --- Gráfico de barras: ventas por semana (efectivo vs transferencia) ---
export interface SemanaVentas {
  semana: string; // "Sem 1", "Sem 2", ...
  efectivo: number;
  transferencia: number;
}

// --- Gráfico de dona: distribución de pago ---
export interface DistribucionPago {
  efectivo: number;
  transferencia: number;
  porcentajeEfectivo: number;
  porcentajeTransferencia: number;
}

// --- Panel de cuadre de caja (efectivo / transferencia) ---
export interface CuadreData {
  titulo: string;
  montoEsperado: number;
  montoRegistrado: number;
  diferencia: number;
  estado: "correcto" | "alerta";
  mensaje: string;
}

// --- Fila de la tabla de movimientos recientes ---
export interface MovimientoRow {
  id: number;
  folio: string; // "#1248"
  fechaHora: string; // ya formateado, ej. "31/05/25 18:42"
  cajera: string;
  tipo: "Venta" | "Cancelación" | "Devolución";
  productos: number;
  metodo: "Efectivo" | "Transferencia";
  monto: number;
  estado: "Completada" | "Cancelada" | "Devuelta";
}

// --- Resumen completo que consume CorteClient ---
export interface CorteResumen {
  periodo: PeriodoTipo;
  periodoLabel: string; // ej. "Mayo 2025"
  kpis: KPICardData[];
  ventasPorSemana: SemanaVentas[];
  distribucionPago: DistribucionPago;
  cuadreEfectivo: CuadreData;
  cuadreTransferencia: CuadreData;
  movimientos: MovimientoRow[];
}
