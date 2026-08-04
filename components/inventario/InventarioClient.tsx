'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '@/lib/actions/inventario';
import {
  UMBRAL_STOCK_BAJO,
  type ProductoUI as Producto,
  type InventoryStats,
} from '@/types/inventario';

// Convertido de pantalla 100% mock a cliente conectado a MySQL:
//   - Los productos ya no salen de un arreglo quemado: llegan por props
//     desde app/(privado)/inventario/page.tsx, que los lee con Prisma.
//   - Cada alta/edición/baja llama una Server Action y luego router.refresh()
//     para que el servidor vuelva a mandar los datos frescos.

const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const EyeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronLeftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);



export default function InventarioClient({
  productosIniciales,
}: {
  productosIniciales: Producto[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // No se guarda una copia de los productos en useState: sería un "estado
  // espejo" que se desincroniza de las props. Como todas las altas/bajas
  // pasan por Server Actions + router.refresh(), la lista siempre llega
  // fresca desde el servidor y se usa tal cual.
  const productos = productosIniciales;
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas las categorías');
  const [stockFilter, setStockFilter] = useState('Todo el stock');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Inventario');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState<Partial<Producto>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    costo: 0,
    stock: 0,
    sku: '',
    categoria: 'Abarrotes',
    activo: true
  });

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const stats: InventoryStats = useMemo(() => {
    // Cifras reales de la BD. El mockup traía offsets fijos (284, +10, +2,
    // +45000) para que se viera "lleno"; ya no aplican con datos de verdad.
    const totalProductos = productos.length;
    const stockBajo = productos.filter(p => p.stock > 0 && p.stock <= UMBRAL_STOCK_BAJO).length;
    const sinStock = productos.filter(p => p.stock === 0).length;
    const valorInventario = productos.reduce((acc, curr) => acc + (curr.stock * (curr.costo || 0)), 0);

    return {
      totalProductos,
      stockBajo,
      sinStock,
      valorInventario
    };
  }, [productos]);

  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const matchesSearch = 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.includes(searchTerm) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = 
        categoryFilter === 'Todas las categorías' || p.categoria === categoryFilter;

      let matchesStock = true;
      if (stockFilter === 'Disponible') matchesStock = p.stock > UMBRAL_STOCK_BAJO;
      else if (stockFilter === 'Stock bajo') matchesStock = p.stock > 0 && p.stock <= UMBRAL_STOCK_BAJO;
      else if (stockFilter === 'Agotado') matchesStock = p.stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [productos, searchTerm, categoryFilter, stockFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(filteredProducts.map(p => p.codigo));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (codigo: string) => {
    if (selectedItems.includes(codigo)) {
      setSelectedItems(selectedItems.filter(id => id !== codigo));
    } else {
      setSelectedItems([...selectedItems, codigo]);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      codigo: Math.floor(1000000000000 + Math.random() * 9000000000000).toString(),
      nombre: '',
      descripcion: '',
      precio: 0,
      costo: 0,
      stock: 0,
      sku: `SKU-${String(productos.length + 1).padStart(3, '0')}`,
      categoria: 'Abarrotes',
      activo: true
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.codigo || formData.precio === undefined) return;

    startTransition(async () => {
      const res = await crearProducto({
        codigo: formData.codigo!,
        nombre: formData.nombre!,
        descripcion: formData.descripcion ?? '',
        precio: Number(formData.precio),
        costo: Number(formData.costo || 0),
        stock: Number(formData.stock || 0),
        sku: formData.sku,
        categoria: formData.categoria,
      });

      showNotification(res.mensaje);
      if (res.ok) {
        setIsAddModalOpen(false);
        router.refresh(); // vuelve a pedir los datos al servidor
      }
    });
  };

  const handleOpenEditModal = (prod: Producto) => {
    setSelectedProduct(prod);
    setFormData({ ...prod });
    setIsEditModalOpen(true);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    startTransition(async () => {
      const res = await actualizarProducto(selectedProduct.codigo, {
        codigo: selectedProduct.codigo,
        nombre: formData.nombre!,
        descripcion: formData.descripcion ?? '',
        precio: Number(formData.precio),
        costo: Number(formData.costo || 0),
        stock: Number(formData.stock || 0),
        sku: formData.sku,
        categoria: formData.categoria,
      });

      showNotification(res.mensaje);
      if (res.ok) {
        setIsEditModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleOpenDeleteModal = (prod: Producto) => {
    setSelectedProduct(prod);
    setIsDeleteModalOpen(true);
  };

  const ConfirmDeleteProduct = () => {
    if (!selectedProduct) return;

    startTransition(async () => {
      const res = await eliminarProducto(selectedProduct.codigo);
      showNotification(res.mensaje);
      if (res.ok) {
        setIsDeleteModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleExportCSV = () => {
    const filas = [
      ['codigo', 'sku', 'nombre', 'categoria', 'precio', 'costo', 'stock'],
      ...filteredProducts.map(p => [
        p.codigo, p.sku ?? '', p.nombre, p.categoria ?? '',
        String(p.precio), String(p.costo ?? 0), String(p.stock),
      ]),
    ];
    const csv = filas.map(f => f.map(c => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Catálogo exportado a CSV.');
  };

  const renderStockIndicator = (stock: number) => {
    let color = 'bg-emerald-500';
    let textStatus = 'Disponible';
    let textColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let percentage = Math.min((stock / 60) * 100, 100);

    if (stock === 0) {
      color = 'bg-rose-500';
      textStatus = 'Agotado';
      textColor = 'text-rose-700 bg-rose-50 border-rose-200';
      percentage = 0;
    } else if (stock <= UMBRAL_STOCK_BAJO) {
      color = 'bg-amber-500';
      textStatus = 'Stock bajo';
      textColor = 'text-amber-700 bg-amber-50 border-amber-200';
      percentage = Math.max((stock / 30) * 100, 15);
    }

    return { color, textStatus, textColor, percentage };
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl transition-all">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          {toastMessage}
        </div>
      )}

      {}
      <header className="bg-[#b91c1c] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight">La Güera — POS</h1>
            <p className="text-xs font-light opacity-90">Gestión de Inventario</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
            <span>Admin: Luis García</span>
          </div>
        </div>
      </header>

      {}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl gap-8 px-6 text-sm font-medium text-slate-600">
          {['Venta', 'Inventario', 'Reportes', 'Historial', 'Configuración'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 transition-colors relative ${
                activeTab === tab
                  ? 'text-[#b91c1c] font-semibold border-b-2 border-[#b91c1c]'
                  : 'hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 py-6">

        {}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Total Productos */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Total Productos</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900">{stats.totalProductos}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Artículos registrados</p>
          </div>

          {/* Card 2: Stock Bajo */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Stock Bajo</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-600">{stats.stockBajo}</span>
            </div>
            <p className="mt-1 text-xs text-amber-600 font-medium">Requieren reabasto</p>
          </div>

          {/* Card 3: Sin Stock */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Sin Stock</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-rose-600">{stats.sinStock}</span>
            </div>
            <p className="mt-1 text-xs text-rose-600 font-medium">Agotados</p>
          </div>

          {/* Card 4: Valor Inventario */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Valor Inventario</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-600">
                ${stats.valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Costo total</p>
          </div>

        </section>

        {}
        <section className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <SearchIcon className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#b91c1c] focus:bg-white focus:ring-1 focus:ring-[#b91c1c]"
            />
          </div>

          {/* Controls & Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#b91c1c]"
            >
              <option value="Todas las categorías">Todas las categorías</option>
              <option value="Lácteos">Lácteos</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Panadería">Panadería</option>
              <option value="Abarrotes">Abarrotes</option>
              <option value="Botanas">Botanas</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#b91c1c]"
            >
              <option value="Todo el stock">Todo el stock</option>
              <option value="Disponible">Disponible</option>
              <option value="Stock bajo">Stock bajo</option>
              <option value="Agotado">Agotado</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:bg-slate-100"
            >
              <DownloadIcon className="h-4 w-4 text-slate-500" />
              Exportar
            </button>

            {/* Add New Product Button */}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 active:bg-red-900"
            >
              <PlusIcon className="h-4 w-4" />
              Nuevo producto
            </button>

          </div>
        </section>

        {}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              
              {/* Table Header */}
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedItems.length === filteredProducts.length && filteredProducts.length > 0}
                      className="rounded border-slate-300 text-[#b91c1c] focus:ring-[#b91c1c]"
                    />
                  </th>
                  <th className="px-4 py-3">PRODUCTO</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">CATEGORÍA</th>
                  <th className="px-4 py-3">PRECIO VENTA</th>
                  <th className="px-4 py-3">COSTO</th>
                  <th className="px-4 py-3">STOCK ACTUAL</th>
                  <th className="px-4 py-3">ESTADO</th>
                  <th className="px-4 py-3 text-center">ACCIONES</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No se encontraron productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const { color, textStatus, textColor, percentage } = renderStockIndicator(p.stock);
                    const isSelected = selectedItems.includes(p.codigo);

                    return (
                      <tr key={p.codigo} className={`transition hover:bg-slate-50/80 ${isSelected ? 'bg-red-50/40' : ''}`}>
                        
                        {/* Checkbox */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(p.codigo)}
                            className="rounded border-slate-300 text-[#b91c1c] focus:ring-[#b91c1c]"
                          />
                        </td>

                        {/* Product info */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{p.nombre}</div>
                          <div className="text-xs text-slate-400 font-mono">Código: {p.codigo}</div>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                          {p.sku || 'N/A'}
                        </td>

                        {/* Categoria Badge */}
                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {p.categoria || 'Sin cat.'}
                          </span>
                        </td>

                        {/* Precio Venta */}
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          ${p.precio.toFixed(2)}
                        </td>

                        {/* Costo */}
                        <td className="px-4 py-3.5 text-slate-500">
                          ${(p.costo || 0).toFixed(2)}
                        </td>

                        {/* Stock Progress & Count */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full ${color} transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-6 text-right font-bold text-slate-800">{p.stock}</span>
                          </div>
                        </td>

                        {/* Estado Badge */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${textColor}`}>
                            {textStatus}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setSelectedProduct(p); setIsViewModalOpen(true); }}
                              title="Ver detalle"
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="Editar producto"
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                              <EditIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(p)}
                              title="Eliminar"
                              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row text-xs text-slate-500">
            <div>
              Mostrando <span className="font-semibold text-slate-700">1–{filteredProducts.length}</span> de <span className="font-semibold text-slate-700">{stats.totalProductos}</span> productos
            </div>

            <div className="flex items-center gap-1">
              <button disabled className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-400 opacity-60 cursor-not-allowed">
                <ChevronLeftIcon className="h-3.5 w-3.5" /> Anterior
              </button>
              
              <button className="h-7 w-7 rounded-lg bg-[#b91c1c] font-bold text-white shadow-sm">1</button>
              <button className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-600">2</button>
              <button className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-600">3</button>
              <span className="px-1 text-slate-400">...</span>
              <button className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-600">48</button>

              <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition">
                Siguiente <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Agregar Nuevo Producto</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Código de Barras *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Galletas Chokis 100g"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Precio Venta ($) *</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Costo Base ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                >
                  <option value="Abarrotes">Abarrotes</option>
                  <option value="Lácteos">Lácteos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Panadería">Panadería</option>
                  <option value="Botanas">Botanas</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-[#b91c1c] px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                >
                  {isPending ? 'Guardando…' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Editar Producto</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Costo ($)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-[#b91c1c]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-[#b91c1c] px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                >
                  {isPending ? 'Guardando…' : 'Actualizar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isViewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Detalles del Producto</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Nombre:</span>
                <span className="font-bold text-slate-800">{selectedProduct.nombre}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Código de Barras:</span>
                <span className="font-mono text-slate-800">{selectedProduct.codigo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">SKU:</span>
                <span className="text-slate-800">{selectedProduct.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Categoría:</span>
                <span className="text-slate-800">{selectedProduct.categoria}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Precio Venta:</span>
                <span className="font-semibold text-emerald-600">${selectedProduct.precio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Costo Base:</span>
                <span className="text-slate-700">${(selectedProduct.costo || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Unidades en Stock:</span>
                <span className="font-bold text-slate-900">{selectedProduct.stock}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
              <TrashIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">¿Eliminar producto?</h3>
            <p className="mt-1 text-xs text-slate-500">
              ¿Estás seguro de que deseas eliminar <span className="font-semibold text-slate-800">&quot;{selectedProduct.nombre}&quot;</span>? Esta acción no se puede deshacer.
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={ConfirmDeleteProduct}
                disabled={isPending}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isPending ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}