import {
  Categoria,
  Producto,
  Proveedor,
  Venta,
  MovimientoInventario,
  KpiData,
  VentaPorPeriodo,
  ProductoMasVendido,
} from "./types";


const categorias: Categoria[] = [
  {
    id: 1,
    nombre: "Bebidas",
  },
  {
    id: 2,
    nombre: "Botanas",
  },
  {
    id: 3,
    nombre: "Lácteos",
  },
];

const proveedores: Proveedor[] = [
  {
    id: 1,
    nombre: "Coca Cola",
    contacto: "Juan Pérez",
    telefono: "4491234567",
    email: "ventas@cocacola.com",
    activo: true,
    creadoEn: "2026-07-01",
  },
  {
    id: 2,
    nombre: "Sabritas",
    contacto: "María López",
    telefono: "4492223344",
    email: "ventas@sabritas.com",
    activo: true,
    creadoEn: "2026-07-02",
  },
];

const productos: Producto[] = [
  {
    id: 1,
    nombre: "Coca Cola 600ml",
    sku: "CC600",
    categoria: categorias[0],
    proveedorId: 1,
    precioCompra: 12,
    precioVenta: 18,
    unidadMedida: "pieza",
    stockActual: 35,
    stockMinimo: 10,
    activo: true,
    creadoEn: "2026-07-01",
  },
  {
    id: 2,
    nombre: "Doritos Nacho",
    sku: "DR001",
    categoria: categorias[1],
    proveedorId: 2,
    precioCompra: 10,
    precioVenta: 16,
    unidadMedida: "pieza",
    stockActual: 6,
    stockMinimo: 15,
    activo: true,
    creadoEn: "2026-07-01",
  },
  {
    id: 3,
    nombre: "Leche Lala",
    sku: "LL001",
    categoria: categorias[2],
    proveedorId: 1,
    precioCompra: 18,
    precioVenta: 26,
    unidadMedida: "litro",
    stockActual: 12,
    stockMinimo: 8,
    activo: true,
    creadoEn: "2026-07-01",
  },
];

const ventas: Venta[] = [
  {
    id: 1,
    folio: "V001",
    fecha: "2026-07-28",
    metodoPago: "efectivo",
    total: 54,
    detalles: [
      {
        productoId: 1,
        nombreProducto: "Coca Cola 600ml",
        cantidad: 3,
        precioUnitario: 18,
        subtotal: 54,
      },
    ],
  },
  {
    id: 2,
    folio: "V002",
    fecha: "2026-07-28",
    metodoPago: "tarjeta",
    total: 32,
    detalles: [
      {
        productoId: 2,
        nombreProducto: "Doritos Nacho",
        cantidad: 2,
        precioUnitario: 16,
        subtotal: 32,
      },
    ],
  },
];


const movimientos: MovimientoInventario[] = [
  {
    id: 1,
    productoId: 1,
    nombreProducto: "Coca Cola 600ml",
    tipo: "salida",
    cantidad: 3,
    motivo: "Venta",
    fecha: "2026-07-28",
  },
  {
    id: 2,
    productoId: 2,
    nombreProducto: "Doritos Nacho",
    tipo: "entrada",
    cantidad: 40,
    motivo: "Compra proveedor",
    fecha: "2026-07-27",
  },
];


const kpis: KpiData = {
  ventasHoy: 86,
  ventasMes: 24580,
  totalProductos: productos.length,
  productosStockBajo: productos.filter(
    p => p.stockActual <= p.stockMinimo
  ).length,
  proveedoresActivos: proveedores.filter(
    p => p.activo
  ).length,
};

const ventasPeriodo: VentaPorPeriodo[] = [
  {
    fecha: "Lun",
    totalVentas: 500,
  },
  {
    fecha: "Mar",
    totalVentas: 800,
  },
  {
    fecha: "Mié",
    totalVentas: 650,
  },
  {
    fecha: "Jue",
    totalVentas: 1200,
  },
  {
    fecha: "Vie",
    totalVentas: 980,
  },
  {
    fecha: "Sáb",
    totalVentas: 1450,
  },
  {
    fecha: "Dom",
    totalVentas: 700,
  },
];

const topProductos: ProductoMasVendido[] = [
  {
    productoId: 1,
    nombreProducto: "Coca Cola 600ml",
    cantidadVendida: 120,
  },
  {
    productoId: 2,
    nombreProducto: "Doritos Nacho",
    cantidadVendida: 95,
  },
  {
    productoId: 3,
    nombreProducto: "Leche Lala",
    cantidadVendida: 70,
  },
];




// ============================================
// Funciones Mock (simulan llamadas al backend)
// ============================================

export async function getKpis(): Promise<KpiData> {
  return Promise.resolve(kpis);
}

export async function getProductos(): Promise<Producto[]> {
  return Promise.resolve(productos);
}

export async function getVentas(): Promise<Venta[]> {
  return Promise.resolve(ventas);
}

export async function getMovimientos(): Promise<MovimientoInventario[]> {
  return Promise.resolve(movimientos);
}

export async function getTopProductos(): Promise<ProductoMasVendido[]> {
  return Promise.resolve(topProductos);
}

export async function getVentasPeriodo(): Promise<VentaPorPeriodo[]> {
  return Promise.resolve(ventasPeriodo);
}

export async function getProveedores(): Promise<Proveedor[]> {
  return Promise.resolve(proveedores);
}