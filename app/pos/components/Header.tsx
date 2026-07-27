"use client";

import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";

interface HeaderProps {
  negocio: string;
  turno: string;
  cajera: string;
}

/**
 * Header superior del POS. Es Client Component porque la fecha/hora
 * se actualiza cada segundo (no puede resolverse una sola vez en el server
 * sin desincronizarse del reloj real del usuario).
 */
export default function Header({ negocio, turno, cajera }: HeaderProps) {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());
    const interval = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fecha = ahora
    ? new Intl.DateTimeFormat("es-MX", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(ahora)
    : "";

  const hora = ahora
    ? new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(ahora)
    : "";

  return (
    <header className="flex items-center justify-between bg-red-600 px-6 py-3 text-white shadow-md">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-lg">
          🛒
        </span>
        <div>
          <h1 className="text-base font-semibold leading-tight">{negocio}</h1>
          <p className="text-xs text-red-100">{turno}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right text-xs leading-tight text-red-100">
          <p className="font-medium text-white">{cajera}</p>
          <p className="capitalize">
            {fecha} · {hora}
          </p>
        </div>
        <UserCircle2 className="h-9 w-9 text-white" strokeWidth={1.5} />
      </div>
    </header>
  );
}
