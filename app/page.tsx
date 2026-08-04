import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth/session";
import { INICIO_POR_ROL } from "@/lib/auth/permisos";

// La raíz no dibuja nada: solo reparte según quién entró.
//   CAJERO -> /pos     ADMIN -> /dashboard     sin sesión -> /login
export default async function Home() {
  const sesion = await obtenerSesion();
  redirect(sesion ? INICIO_POR_ROL[sesion.rol] : "/login");
}
