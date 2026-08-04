import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  INICIO_POR_ROL,
  RUTAS_PUBLICAS,
  puedeVer,
  type Rol,
} from "@/lib/auth/permisos";

// ============================================================================
// ⚠️ En Next.js 16 el archivo `middleware.ts` quedó DEPRECADO y se renombró
// a `proxy.ts`, con la función exportada como `proxy`. Si lo nombras como
// antes, Next avisa que no lo encuentra y en versiones futuras deja de correr.
//
// PRIMERA CAPA: aquí solo se redirige. La seguridad real vive en
// lib/auth/guards.ts, porque este archivo NO intercepta Server Actions.
// ============================================================================

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Se verifica el token aquí en vez de importar lib/auth/session.ts porque
 * ese archivo usa `server-only` y `cookies()`, que no aplican en el proxy.
 */
async function leerRol(token?: string): Promise<Rol | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return (payload as { rol?: Rol }).rol ?? null;
  } catch {
    return null;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rol = await leerRol(req.cookies.get("sesion")?.value);

  const esPublica = (RUTAS_PUBLICAS as readonly string[]).includes(pathname);

  // 1) Ya tiene sesión y está entrando al login -> a su pantalla de inicio.
  if (esPublica) {
    return rol
      ? NextResponse.redirect(new URL(INICIO_POR_ROL[rol], req.url))
      : NextResponse.next();
  }

  // 2) La raíz "/" la resuelve app/page.tsx, que reparte según el rol.
  if (pathname === "/") return NextResponse.next();

  // 3) Sin sesión -> al login, guardando a dónde quería ir.
  if (!rol) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 4) Con sesión pero sin permiso para esa ruta.
  //    Aquí es donde el CAJERO que teclea /inventario a mano rebota a /pos.
  if (!puedeVer(rol, pathname)) {
    return NextResponse.redirect(new URL(INICIO_POR_ROL[rol], req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Se excluyen /api, los archivos internos de Next y cualquier cosa
  // con extensión (imágenes, .svg, favicon, etc.).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
