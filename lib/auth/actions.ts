"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { crearSesion, cerrarSesion } from "./session";
import { INICIO_POR_ROL, type Rol } from "./permisos";
import type { EstadoLogin } from "@/types/auth";

/**
 * Valida credenciales contra la tabla `usuarios` y abre la sesión.
 * Se usa con useActionState() desde el formulario de login.
 */
export async function iniciarSesion(
  _prev: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!usuario || !password) {
    return { error: "Por favor, rellene todos los campos vacíos." };
  }

  const encontrado = await db.usuario.findUnique({ where: { usuario } });

  // Mismo mensaje para "no existe el usuario" y "contraseña incorrecta":
  // así nadie puede ir adivinando qué usuarios están dados de alta.
  const passwordOk =
    encontrado && (await bcrypt.compare(password, encontrado.password));

  if (!encontrado || !encontrado.activo || !passwordOk) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  await crearSesion({
    idUsuario: encontrado.id_usuario,
    nombre: encontrado.nombre,
    usuario: encontrado.usuario,
    rol: encontrado.rol as Rol,
  });

  // ⚠️ redirect() funciona lanzando una excepción interna de Next:
  // tiene que ir FUERA de cualquier try/catch o se traga la navegación.
  redirect(INICIO_POR_ROL[encontrado.rol as Rol]);
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/login");
}
