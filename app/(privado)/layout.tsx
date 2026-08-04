import { requerirSesion } from "@/lib/auth/guards";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

// ============================================================================
// AQUÍ SE RESUELVE EL REQUERIMIENTO DE LOS ROLES.
//
// El POS es la única pantalla que comparten Cajero y Admin. En vez de
// duplicar la ruta (/pos y /admin/pos), existe una sola y este layout decide
// si la envuelve o no con el menú:
//
//   CAJERO -> sin sidebar. Ve el POS a pantalla completa, sin un solo link
//             a otra pantalla. No es que estén escondidas: es que ni se
//             renderizan, y si teclea la URL el proxy lo regresa.
//
//   ADMIN  -> con sidebar. Navega libre entre las 5 pantallas.
// ============================================================================

export default async function LayoutPrivado({
  children,
}: {
  children: React.ReactNode;
}) {
  // Red de seguridad: si el proxy fallara o lo brincaran, aquí se corta.
  const sesion = await requerirSesion();
  const esAdmin = sesion.rol === "ADMIN";

  return (
    <div className="flex min-h-screen bg-slate-100">
      {esAdmin && <Sidebar rol={sesion.rol} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar sesion={sesion} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
