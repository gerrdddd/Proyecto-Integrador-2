// Forma "plana" del producto ya lista para viajar de Server -> Client Component.
// El campo `precio`, que en Prisma llega como Decimal, se convierte a number
// en el server component para evitar el error de serialización de Next.js
// ("Only plain objects can be passed to Client Components").
export interface ProductoUI {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
}

export interface CartItem extends ProductoUI {
  cantidad: number;
}
