import { LayoutDashboard } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center gap-3 bg-red-600 px-6 py-3 text-white shadow-md">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
        <LayoutDashboard className="h-4 w-4" />
      </span>
      <div>
        <h1 className="text-base font-semibold leading-tight">
          La Güera - Corte de Caja
        </h1>
        <p className="text-xs text-red-100">Panel Administrativo</p>
      </div>
    </header>
  );
}
