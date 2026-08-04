import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Corre con:  npm run db:seed
// Crea los dos usuarios de prueba (uno por rol) y un catálogo mínimo.

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "abarrotes_laguera",
});

const db = new PrismaClient({ adapter });

async function main() {
  // --- Usuarios -------------------------------------------------------------
  // La contraseña se guarda hasheada. bcrypt con cost 10 es el estándar.
  await db.usuario.upsert({
    where: { usuario: "admin" },
    update: {},
    create: {
      nombre: "Administrador",
      usuario: "admin",
      password: await bcrypt.hash("Admin123!", 10),
      rol: "ADMIN",
    },
  });

  await db.usuario.upsert({
    where: { usuario: "cajero" },
    update: {},
    create: {
      nombre: "María González",
      usuario: "cajero",
      password: await bcrypt.hash("Cajero123!", 10),
      rol: "CAJERO",
    },
  });

  // --- Catálogo -------------------------------------------------------------
  // Son los mismos productos que estaban quemados en la pantalla de
  // Inventario; ahora viven en la base de datos, que es donde van.
  const productos = [
    { codigo: "7501030451224", sku: "SKU-001", nombre: "Leche Lala 1L", descripcion: "Leche entera pasteurizada 1 Litro", precio: 22.5, costo: 15.0, stock: 48, categoria: "Lácteos" },
    { codigo: "7501055302100", sku: "SKU-002", nombre: "Coca-Cola 600ml", descripcion: "Refresco de cola no retornable 600ml", precio: 16.0, costo: 9.5, stock: 3, categoria: "Bebidas" },
    { codigo: "7501000600560", sku: "SKU-003", nombre: "Pan Bimbo Blanco", descripcion: "Pan de caja grande blanco 680g", precio: 32.0, costo: 22.0, stock: 15, categoria: "Panadería" },
    { codigo: "7501020613026", sku: "SKU-004", nombre: "Aceite 1-2-3 900ml", descripcion: "Aceite vegetal comestible 900ml", precio: 38.0, costo: 26.0, stock: 0, categoria: "Abarrotes" },
    { codigo: "7501058604015", sku: "SKU-005", nombre: "Frijoles La Costeña 560g", descripcion: "Frijoles refritos bayos en lata", precio: 14.5, costo: 9.0, stock: 65, categoria: "Abarrotes" },
    { codigo: "7501003111013", sku: "SKU-006", nombre: "Maruchan Vaso Pollo", descripcion: "Sopa instantánea sabor a pollo 64g", precio: 12.0, costo: 7.5, stock: 55, categoria: "Botanas" },
  ];

  for (const p of productos) {
    await db.producto.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: { ...p, activo: true },
    });
  }

  console.log("✔ Seed listo.");
  console.log("  admin  / Admin123!   -> entra al Dashboard, ve las 5 pantallas");
  console.log("  cajero / Cajero123!  -> entra al POS, sin menú lateral");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
