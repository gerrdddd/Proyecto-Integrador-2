// Grupo público: sin sidebar, sin topbar, sin guardia de sesión.
export default function LayoutAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      {children}
    </div>
  );
}
