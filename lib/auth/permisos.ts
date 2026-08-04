// ============================================================================
// FUENTE ÚNICA DE VERDAD del control de acceso.
//
// De este archivo comen los tres lugares donde se decide qué ve cada rol:
//   1. components/layout/Sidebar.tsx  -> qué links dibuja
//   2. proxy.ts                       -> qué URLs deja pasar
//   3. lib/auth/guards.ts             -> qué Server Actions permite
//
// Si mañana el CAJERO también debe ver el Corte de Caja, se agrega "CAJERO"
// al arreglo `roles` de esa entrada y listo: se actualiza en los tres lados.
// No hay ningún `if (rol === "ADMIN")` regado por la UI.
// ============================================================================

export type Rol = "ADMIN" | "CAJERO";

export type ItemNav = {
  href: string;
  label: string;
  /** Nombre del ícono en lucide-react. */
  icon: string;
  roles: readonly Rol[];
};

export const NAV: readonly ItemNav[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    roles: ["ADMIN"],
  },
  {
    href: "/pos",
    label: "Punto de Venta",
    icon: "ShoppingCart",
    roles: ["ADMIN", "CAJERO"], // <- la única pantalla compartida
  },
  {
    href: "/inventario",
    label: "Inventario",
    icon: "Package",
    roles: ["ADMIN"],
  },
  {
    href: "/egresos",
    label: "Egresos",
    icon: "Receipt",
    roles: ["ADMIN"],
  },
  {
    href: "/corte",
    label: "Corte de Caja",
    icon: "Calculator",
    roles: ["ADMIN"],
  },
] as const;

/** A dónde cae cada rol justo después de iniciar sesión. */
export const INICIO_POR_ROL: Record<Rol, string> = {
  ADMIN: "/dashboard",
  CAJERO: "/pos",
};

/** Rutas accesibles sin sesión. */
export const RUTAS_PUBLICAS = ["/login"] as const;

/**
 * ¿Este rol puede entrar a esta ruta?
 * Devuelve false para rutas desconocidas (política "todo cerrado por defecto").
 */
export function puedeVer(rol: Rol, pathname: string): boolean {
  const item = NAV.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );
  return item ? item.roles.includes(rol) : false;
}

/** Menú ya filtrado, listo para pintar el sidebar. */
export function navPara(rol: Rol): ItemNav[] {
  return NAV.filter((n) => n.roles.includes(rol));
}

/** Etiqueta legible del rol, para mostrar en la barra superior. */
export const ROL_LABEL: Record<Rol, string> = {
  ADMIN: "Administrador",
  CAJERO: "Cajero",
};
