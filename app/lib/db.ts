import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// A partir de Prisma 7 el motor de conexión interno fue removido: ya no se
// puede hacer `new PrismaClient()` sin argumentos. Hay que pasarle un
// "driver adapter" que sepa hablar con la base de datos. Para MySQL/MariaDB
// se usa @prisma/adapter-mariadb (requiere `npm install @prisma/adapter-mariadb`).
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

// Evita crear múltiples instancias de PrismaClient en desarrollo
// (Next.js recarga módulos en caliente y esto agotaría las conexiones a MySQL)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export default db;