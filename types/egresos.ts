// ============================================================================
// Tipos del módulo de Egresos y Gastos — "La Güera"
// ============================================================================

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";

export type TipoEgreso = "GASTO" | "COMPRA" | "SERVICIO" | "NOMINA" | "OTRO";

export interface EgresoUI {
  id: number;
  concepto: string;
  descripcion: string | null;
  monto: number;
  fecha: string; // ISO "YYYY-MM-DD"
  metodoPago: MetodoPago;
  tipo: TipoEgreso;
  referencia: string | null;
}

export interface ResumenEgresos {
  totalHoy: number;
  totalMes: number;
  totalGeneral: number;
}

/** Payload para crear/editar un egreso (sin id, generado por la BD). */
export interface EgresoFormData {
  concepto: string;
  descripcion: string;
  monto: string; // se maneja como string en el formulario, se castea en el submit
  fecha: string;
  tipo: TipoEgreso;
  metodoPago: MetodoPago;
  referencia: string;
}

/** Filtros activos de la barra de herramientas. */
export interface EgresosFiltros {
  busqueda: string;
  fechaInicio: string;
  fechaFin: string;
  metodoPago: MetodoPago | "TODOS";
  tipo: TipoEgreso | "TODOS";
  ordenarPor: "fecha" | "monto";
  orden: "asc" | "desc";
}

export const FILTROS_INICIALES: EgresosFiltros = {
  busqueda: "",
  fechaInicio: "",
  fechaFin: "",
  metodoPago: "TODOS",
  tipo: "TODOS",
  ordenarPor: "fecha",
  orden: "desc",
};

/** Metadatos de presentación para cada tipo de egreso. */
export const TIPO_LABELS: Record<TipoEgreso, string> = {
  GASTO: "Gasto",
  COMPRA: "Compra",
  SERVICIO: "Servicio",
  NOMINA: "Nómina",
  OTRO: "Otro",
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
};

/** Resultado estándar de una Server Action. */
export type ActionResult<T = undefined> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; fieldErrors?: Partial<Record<keyof EgresoFormData, string>> };
