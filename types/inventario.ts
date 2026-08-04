// Tipos del módulo de Inventario.
// Antes vivían dentro de app/inventario/page.tsx; se sacan para que las
// Server Actions y el componente cliente compartan la misma definición.

export interface ProductoUI {
  codigo: string;              // PRIMARY KEY (código de barras)
  nombre: string;
  descripcion: string | null;
  precio: number;              // precio de venta
  costo: number;               // costo base
  stock: number;
  activo: boolean;
  sku?: string;
  categoria?: string;
}

export interface ProductoFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  costo?: number | string;
  stock: number | string;
  sku?: string;
  categoria?: string;
}

export interface InventoryStats {
  totalProductos: number;
  stockBajo: number;
  sinStock: number;
  valorInventario: number;
}

/** Umbral a partir del cual se considera "stock bajo". */
export const UMBRAL_STOCK_BAJO = 15;

export const CATEGORIAS = [
  "Abarrotes",
  "Bebidas",
  "Lácteos",
  "Panadería",
  "Botanas",
  "Limpieza",
  "Otros",
] as const;
