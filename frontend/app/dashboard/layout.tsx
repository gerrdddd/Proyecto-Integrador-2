import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">

        <div className="p-6 text-2xl font-bold border-b border-slate-700">
          Inventario
        </div>

        <nav className="flex-1 p-4 space-y-2">

          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800"
          >
            <Package size={20} />
            Productos
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800"
          >
            <ShoppingCart size={20} />
            Ventas
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800"
          >
            <Users size={20} />
            Proveedores
          </Link>

        </nav>

      </aside>

      {/* Contenido */}
      <main className="flex-1">

        {/* Header */}
        <header className="bg-white border-b shadow-sm px-8 py-5">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
        </header>

        <section className="p-8">
          {children}
        </section>

      </main>

    </div>
  );
}