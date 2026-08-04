"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { registrarVenta } from "@/lib/actions/pos";
import Header from "@/components/pos/Header";
import ProductTable from "@/components/pos/ProductTable";
import Cart from "@/components/pos/Cart";
import type { CartItem, ProductoUI } from "@/types/pos";

interface PosClientProps {
  productos: ProductoUI[];
  /** Nombre real del cajero logueado (antes venía quemado: "María González"). */
  cajero: string;
}

/**
 * Toda la interactividad del POS vive aquí: búsqueda, filtros y el estado
 * del carrito basados únicamente en 'codigo'.
 */
export default function PosClient({ productos, cajero }: PosClientProps) {
  const router = useRouter();
  const [cobrando, startCobro] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  // Filtrado solo por Nombre y Código
  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return productos;

    return productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(termino) ||
        producto.codigo.toLowerCase().includes(termino)
    );
  }, [productos, busqueda]);

  function agregarAlCarrito(producto: ProductoUI) {
    setCart((prev) => {
      const existente = prev.find((item) => item.codigo === producto.codigo);

      if (existente) {
        if (existente.cantidad >= producto.stock) return prev; // No exceder el stock disponible
        return prev.map((item) =>
          item.codigo === producto.codigo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      if (producto.stock === 0) return prev;
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }

  function incrementar(codigo: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.codigo === codigo && item.cantidad < item.stock
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  }

  function decrementar(codigo: string) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.codigo === codigo ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }

  function eliminar(codigo: string) {
    setCart((prev) => prev.filter((item) => item.codigo !== codigo));
  }

  function cobrar() {
    if (cart.length === 0 || cobrando) return;

    startCobro(async () => {
      const res = await registrarVenta(
        cart.map((item) => ({ codigo: item.codigo, cantidad: item.cantidad })),
        "EFECTIVO"
      );

      if (res.ok) {
        setCart([]);
        setAviso({
          tipo: "ok",
          texto: `Venta #${res.idVenta} registrada por ${res.total.toLocaleString(
            "es-MX",
            { style: "currency", currency: "MXN" }
          )}.`,
        });
        router.refresh(); // vuelve a leer el stock actualizado
      } else {
        setAviso({ tipo: "error", texto: res.mensaje });
      }

      setTimeout(() => setAviso(null), 4000);
    });
  }

  // h-full (no h-screen): ahora vive dentro del shell, que ya trae su propia
  // barra superior. Con h-screen se desbordaba la pantalla.
  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50">
      <Header
        negocio="La Güera · Punto de Venta"
        turno="Caja 1"
        cajera={cajero}
      />

      {aviso && (
        <div
          role="status"
          className={`px-6 py-2 text-sm ${
            aviso.tipo === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {aviso.texto}
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Área izquierda: catálogo (70%) */}
        <section className="flex w-[70%] flex-col gap-3 overflow-hidden rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre o código de barras..."
                className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-400"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="h-4 w-4" /> Filtrar
            </button>
          </div>

          <ProductTable
            productos={productosFiltrados}
            totalProductos={productos.length}
            onAgregar={agregarAlCarrito}
          />
        </section>

        {/* Área derecha: carrito (30%) */}
        <section className="w-[30%] overflow-hidden">
          <Cart
            items={cart}
            onIncrementar={incrementar}
            onDecrementar={decrementar}
            onEliminar={eliminar}
            onCobrar={cobrar}
          />
        </section>
      </div>
    </div>
  );
}