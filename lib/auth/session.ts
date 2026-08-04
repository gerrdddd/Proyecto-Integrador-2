import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Rol } from "./permisos";

// ============================================================================
// Sesión = un JWT firmado guardado en una cookie httpOnly.
//
// ¿Por qué JWT y no una tabla de sesiones? Porque así `proxy.ts` puede
// verificar la sesión sin tocar la base de datos en cada request.
// El precio: si cambias el rol de un usuario, el cambio aplica hasta que
// expire su token (8 h) o vuelva a entrar.
// ============================================================================

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export const COOKIE_SESION = "sesion";
const DURACION_SEG = 60 * 60 * 8; // 8 horas ≈ un turno de trabajo

export type Sesion = {
  idUsuario: number;
  nombre: string;
  usuario: string;
  rol: Rol;
};

if (!process.env.AUTH_SECRET) {
  console.warn(
    "[auth] Falta AUTH_SECRET en el .env — las sesiones no serán seguras."
  );
}

/** Firma la sesión y la guarda en la cookie. */
export async function crearSesion(datos: Sesion): Promise<void> {
  const token = await new SignJWT({ ...datos })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SEG}s`)
    .sign(secret);

  const store = await cookies(); // ⚠️ en Next 15+ cookies() es asíncrono
  store.set(COOKIE_SESION, token, {
    httpOnly: true, // el JavaScript del navegador no la puede leer
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEG,
  });
}

/**
 * Verifica un token suelto. Se usa desde proxy.ts, que no tiene acceso
 * a cookies() sino a request.cookies.
 */
export async function verificarToken(token?: string): Promise<Sesion | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"], // fija el algoritmo: evita el ataque "alg: none"
    });
    return payload as unknown as Sesion;
  } catch {
    return null; // firma inválida, manipulado o expirado
  }
}

/** Lee la sesión actual desde la cookie. `null` si no hay o no es válida. */
export async function obtenerSesion(): Promise<Sesion | null> {
  const store = await cookies();
  return verificarToken(store.get(COOKIE_SESION)?.value);
}

export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_SESION);
}
