// Tipos del flujo de cobro del POS. Separados de lib/actions/pos.ts por la
// misma razón que types/auth.ts: un archivo "use server" solo puede exportar
// funciones async.

export type ItemVenta = {
  codigo: string;
  cantidad: number;
};

export type ResultadoVenta =
  | { ok: true; idVenta: number; total: number }
  | { ok: false; mensaje: string };
