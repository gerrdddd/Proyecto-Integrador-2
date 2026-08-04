"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Calculator,
  Store,
  type LucideIcon,
} from "lucide-react";
import { navPara, type Rol } from "@/lib/auth/permisos";

// El menú NO tiene una lista propia de pantallas: se dibuja filtrando el
// mapa de permisos. Por eso no hace falta ningún `if (rol === "ADMIN")` aquí.

const ICONOS: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Calculator,
};

export default function Sidebar({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const items = navPara(rol);

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-slate-700 p-6">
        <Store size={26} className="text-emerald-400" />
        <span className="text-xl font-bold">La Güera</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = ICONOS[item.icon] ?? Package;
          const activo =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activo ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                activo
                  ? "bg-slate-700 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4 text-xs text-slate-500">
        Proyecto Integrador 2
      </div>
    </aside>
  );
}
