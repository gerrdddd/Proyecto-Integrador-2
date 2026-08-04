import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// ============================================================================
// Prisma 7 eliminó el Query Engine binario: la conexión a MySQL/MariaDB se
// hace ahora con un Driver Adapter (@prisma/adapter-mariadb), que por dentro
// usa el paquete `mariadb` para el pool de conexiones.
//
// Este archivo reemplaza a los dos que existían antes
// (app/lib/db.ts y egresos/src/lib/prisma.ts), que eran el mismo código
// duplicado. Se exporta como `db` y también como `prisma` para que ninguno
// de los módulos existentes tenga que cambiar sus llamadas.
// ============================================================================

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "abarrotes_laguera",
  connectionLimit: 5,
});

// Evita crear múltiples pools durante el hot-reload de desarrollo
// (si no, se agotan las conexiones de MySQL a los pocos guardados).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/** Alias: el módulo de Egresos importa `prisma`, el de POS/Corte importa `db`. */
export const prisma = db;

export default db;
