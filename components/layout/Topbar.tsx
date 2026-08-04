import { LogOut, UserRound } from "lucide-react";
import { salir } from "@/lib/auth/actions";
import { ROL_LABEL } from "@/lib/auth/permisos";
import type { Sesion } from "@/lib/auth/session";

// Barra superior mínima: solo identidad y cerrar sesión.
// El título de cada pantalla lo sigue poniendo el header propio de su módulo
// (components/pos/Header.tsx, components/corte/Header.tsx, etc.).

export default function Topbar({ sesion }: { sesion: Sesion }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <UserRound size={18} className="text-slate-400" />
        <span className="font-medium text-slate-800">{sesion.nombre}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {ROL_LABEL[sesion.rol]}
        </span>
      </div>

      {/* Un <form> con Server Action: el logout necesita correr en el
          servidor para poder borrar la cookie httpOnly. */}
      <form action={salir}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </form>
    </header>
  );
}
