"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { iniciarSesion } from "@/lib/auth/actions";
import type { EstadoLogin } from "@/types/auth";

// Reemplaza el login de /frontend/app/page.tsx, que validaba contra
// "admin"/"123456" quemado en el cliente. Ahora la validación ocurre en el
// servidor, contra la tabla `usuarios`, comparando hashes de bcrypt.
//
// useActionState (React 19) sustituye al useState + handleSubmit manual:
// el estado de error viene de la Server Action y `pending` es automático.

const estadoInicial: EstadoLogin = {};

export default function LoginForm() {
  const [estado, formAction, pending] = useActionState(
    iniciarSesion,
    estadoInicial
  );

  return (
    <form action={formAction} className="space-y-4">
      {estado.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
        >
          {estado.error}
        </div>
      )}

      <div>
        <label
          htmlFor="usuario"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          placeholder="Ingresa tu usuario"
          disabled={pending}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={pending}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {pending && <Loader2 size={18} className="animate-spin" />}
        {pending ? "Entrando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
