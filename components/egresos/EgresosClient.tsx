"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import EgresosHeader from "@/components/egresos/EgresosHeader";
import ResumenCards from "@/components/egresos/ResumenCards";
import EgresosToolbar from "@/components/egresos/EgresosToolbar";
import EgresosTable from "@/components/egresos/EgresosTable";
import EgresoFormModal from "@/components/egresos/EgresoFormModal";
import ConfirmDeleteModal from "@/components/egresos/ConfirmDeleteModal";
import { ToastContainer, type ToastState } from "@/components/egresos/Toast";
import { obtenerEgresos, obtenerResumen } from "@/lib/actions/egresos";
import {
  FILTROS_INICIALES,
  type EgresosFiltros,
  type EgresoUI,
  type ResumenEgresos,
} from "@/types/egresos";

interface EgresosClientProps {
  egresosIniciales: EgresoUI[];
  resumenInicial: ResumenEgresos;
}

let toastIdCounter = 0;

export default function EgresosClient({ egresosIniciales, resumenInicial }: EgresosClientProps) {
  const [egresos, setEgresos] = useState<EgresoUI[]>(egresosIniciales);
  const [resumen, setResumen] = useState<ResumenEgresos>(resumenInicial);
  const [filtros, setFiltros] = useState<EgresosFiltros>(FILTROS_INICIALES);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isPending, startTransition] = useTransition();

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [egresoAEditar, setEgresoAEditar] = useState<EgresoUI | null>(null);
  const [egresoAEliminar, setEgresoAEliminar] = useState<EgresoUI | null>(null);

  const mostrarToast = (type: ToastState["type"], message: string) => {
    toastIdCounter += 1;
    setToasts((prev) => [...prev, { id: toastIdCounter, type, message }]);
  };

  const descartarToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Re-consulta cuando cambian los filtros (con pequeño debounce para el buscador).
  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const resultado = await obtenerEgresos(filtros);
        setEgresos(resultado);
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [filtros]);

  const abrirNuevo = () => {
    setEgresoAEditar(null);
    setModalFormAbierto(true);
  };

  const abrirEditar = (egreso: EgresoUI) => {
    setEgresoAEditar(egreso);
    setModalFormAbierto(true);
  };

  const refrescarTodo = () => {
    startTransition(async () => {
      const [listaActualizada, resumenActualizado] = await Promise.all([
        obtenerEgresos(filtros),
        obtenerResumen(),
      ]);
      setEgresos(listaActualizada);
      setResumen(resumenActualizado);
    });
  };

  const handleSuccess = (message: string) => {
    mostrarToast("success", message);
    refrescarTodo();
  };

  const handleError = (message: string) => {
    mostrarToast("error", message);
  };

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

  const contadorResultados = useMemo(() => egresos.length, [egresos]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <EgresosHeader onNuevo={abrirNuevo} />

      <ResumenCards resumen={resumen} />

      <EgresosToolbar filtros={filtros} onChange={setFiltros} onLimpiar={limpiarFiltros} />

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">
          {contadorResultados} {contadorResultados === 1 ? "resultado" : "resultados"}
        </p>
        {isPending && <p className="text-xs text-slate-400">Actualizando…</p>}
      </div>

      <EgresosTable egresos={egresos} onEditar={abrirEditar} onEliminar={setEgresoAEliminar} />

      {/* La key cambia en cada apertura para que el modal se remonte con el
          formulario limpio, en vez de resetearlo con un efecto. */}
      <EgresoFormModal
        key={`${modalFormAbierto}-${egresoAEditar?.id ?? "nuevo"}`}
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        egresoAEditar={egresoAEditar}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <ConfirmDeleteModal
        egreso={egresoAEliminar}
        onClose={() => setEgresoAEliminar(null)}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <ToastContainer toasts={toasts} onDismiss={descartarToast} />
    </div>
  );
}
