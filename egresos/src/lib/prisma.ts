import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// ============================================================================
// Prisma 7 eliminó el Rust Query Engine binario: la conexión a MySQL/MariaDB
// se hace ahora a través de un Driver Adapter (@prisma/adapter-mariadb),
// que internamente usa el paquete `mariadb` para manejar el pool de
// conexiones. El adapter recibe la configuración del pool (o un connection
// string), no una instancia de pool ya creada.
// ============================================================================

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "la_guera",
  connectionLimit: 5,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Evita crear múltiples pools de conexión durante hot-reload en desarrollo.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
