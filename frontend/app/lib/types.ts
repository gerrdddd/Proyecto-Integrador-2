// ============================================
// Tipos base / Enums
// ============================================

export type UnidadMedida = 'pieza' | 'kg' | 'litro' | 'caja' | 'paquete';

export type TipoMovimiento = 'entrada' | 'salida';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

// ============================================
// Categoría (usada por Producto)
// ============================================

export interface Categoria {
  id: number;
  nombre: string;
}

// ============================================
// Proveedor
// ============================================

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  creadoEn: string; // ISO date string
}

// ============================================
// Producto
// ============================================

export interface Producto {
  id: number;
  nombre: string;
  sku: string; // código único del producto
  categoria: Categoria;
  proveedorId: number;
  precioCompra: number;
  precioVenta: number;
  unidadMedida: UnidadMedida;
  stockActual: number;
  stockMinimo: number; // umbral para alertas de stock bajo
  activo: boolean;
  creadoEn: string;
}

// ============================================
// Venta
// ============================================

export interface DetalleVenta {
  productoId: number;
  nombreProducto: string; // desnormalizado para mostrar rápido en tablas
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  folio: string;
  fecha: string; // ISO date string
  detalles: DetalleVenta[];
  total: number;
  metodoPago: MetodoPago;
  cajeroId?: number;
  cajeroNombre?: string;
}

// ============================================
// Movimiento de Inventario (entradas/salidas)
// ============================================

export interface MovimientoInventario {
  id: number;
  productoId: number;
  nombreProducto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string; // ej: "compra a proveedor", "venta", "merma", "ajuste"
  fecha: string;
  referenciaId?: number; // id de venta o de orden de compra relacionada
}

// ============================================
// Tipos para el Dashboard (agregados / KPIs)
// ============================================

export interface KpiData {
  ventasHoy: number;
  ventasMes: number;
  totalProductos: number;
  productosStockBajo: number;
  proveedoresActivos: number;
}

export interface VentaPorPeriodo {
  fecha: string; // "2025-01-01" o "Ene", etc. según agrupación
  totalVentas: number;
}

export interface ProductoMasVendido {
  productoId: number;
  nombreProducto: string;
  cantidadVendida: number;
}

export interface StockPorCategoria {
  categoria: string;
  stockTotal: number;
}