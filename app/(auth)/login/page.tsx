import { Store } from "lucide-react";
import LoginForm from "@/components/layout/LoginForm";

export const metadata = { title: "Iniciar sesión · La Güera" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
          <Store size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">La Güera</h1>
        <p className="text-sm text-slate-500">Sistema de Punto de Venta</p>
      </div>

      <LoginForm />
    </div>
  );
}
