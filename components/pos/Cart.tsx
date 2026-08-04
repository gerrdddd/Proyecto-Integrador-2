"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { CartItem } from "@/types/pos";

const TASA_IVA = 0.16;

function formatoMoneda(valor: number) {
  return valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

interface CartProps {
  items: CartItem[];
  onIncrementar: (id: string) => void;
  onDecrementar: (id: string) => void;
  onEliminar: (id: string) => void;
  onCobrar: () => void;
}

export default function Cart({
  items,
  onIncrementar,
  onDecrementar,
  onEliminar,
  onCobrar,
}: CartProps) {
  const totalUnidades = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const iva = subtotal * TASA_IVA;
  const total = subtotal + iva;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white">
      <div className="flex items-center justify-between bg-red-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <h2 className="text-sm font-semibold">Carrito de Compra</h2>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
          {totalUnidades} producto{totalUnidades === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-4 py-3">
        {items.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-400">
            Aún no has agregado productos.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.codigo}
            className="flex items-start justify-between gap-2 border-b border-gray-50 pb-3 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {item.nombre}
              </p>
              <p className="text-xs text-gray-400">
                {formatoMoneda(item.precio)} c/u
              </p>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => onDecrementar(item.codigo)}
                  className="grid h-6 w-6 place-items-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label={`Restar unidad de ${item.nombre}`}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm font-medium text-gray-700">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => onIncrementar(item.codigo)}
                  disabled={item.cantidad >= item.stock}
                  className="grid h-6 w-6 place-items-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Sumar unidad de ${item.nombre}`}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <p className="text-sm font-semibold text-gray-800">
                {formatoMoneda(item.precio * item.cantidad)}
              </p>
              <button
                onClick={() => onEliminar(item.codigo)}
                className="text-gray-300 hover:text-red-600"
                aria-label={`Eliminar ${item.nombre} del carrito`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-gray-100 px-4 py-3 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{formatoMoneda(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>IVA (16%)</span>
          <span>{formatoMoneda(iva)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-2">
          <span className="text-sm font-semibold text-gray-800">
            Total a Pagar
          </span>
          <span className="text-xl font-bold text-red-600">
            {formatoMoneda(total)}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={onCobrar}
          disabled={items.length === 0}
          className="w-full rounded-md bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Cobrar / Procesar Venta
        </button>
      </div>
    </div>
  );
}
