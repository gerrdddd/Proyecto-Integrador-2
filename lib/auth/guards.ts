import "server-only";
import { redirect } from "next/navigation";
import { obtenerSesion, type Sesion } from "./session";
import { INICIO_POR_ROL, type Rol } from "./permisos";

// ============================================================================
// SEGUNDA CAPA DE SEGURIDAD — la que de verdad protege.
//
// `proxy.ts` solo redirige antes de renderizar: mejora la experiencia, pero
// NO protege las Server Actions. Un cajero que llame `eliminarEgreso()` desde
// la consola del navegador se brinca el proxy completo.
//
// Regla del proyecto:
//   - El proxy redirige.
//   - Estas funciones protegen.
//   - Toda Server Action sensible arranca llamando una de estas.
// ============================================================================

/** Exige sesión válida. Si no hay, manda al login. */
export async function requerirSesion(): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  return sesion;
}

/** Exige que el rol esté en la lista. Si no, lo devuelve a su pantalla. */
export async function requerirRol(...permitidos: Rol[]): Promise<Sesion> {
  const sesion = await requerirSesion();
  if (!permitidos.includes(sesion.rol)) {
    redirect(INICIO_POR_ROL[sesion.rol]);
  }
  return sesion;
}

/** Atajo para las pantallas y actions exclusivas de administración. */
export function requerirAdmin(): Promise<Sesion> {
  return requerirRol("ADMIN");
}

/** Atajo para el POS, la única pantalla que comparten los dos roles. */
export function requerirCaja(): Promise<Sesion> {
  return requerirRol("ADMIN", "CAJERO");
}
