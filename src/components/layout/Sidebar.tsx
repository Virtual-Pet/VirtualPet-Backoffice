"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/authContext"; // Importamos nuestro hook

export default function Sidebar() {
  const pathname = usePathname();
  
  // Extraemos al usuario y la función de logout directamente del contexto
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/orders", label: "Pedidos", icon: "📋", roles: ["ADMIN", "EMPLOYEE"] },
    { href: "/employees", label: "Empleados", icon: "👥", roles: ["ADMIN"] },
    { href: "/profile", label: "Mi Perfil", icon: "⚙️", roles: ["ADMIN", "EMPLOYEE"] },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-[var(--vp-primary-dark)] text-white flex flex-col min-h-screen">
      
      {/* Cabecera del Sidebar */}
      <div className="p-6 border-b border-[var(--vp-primary)] flex items-center gap-3">
        <span className="text-2xl">🏪</span>
        <div>
          <p className="m-0 font-bold text-sm">Virtual Pet</p>
        </div>
      </div>

      {/* Info del usuario logueado (¡Aprovechamos que ya lo tenemos en el Context!) */}
      {user && (
        <div className="px-6 py-4 border-b border-[var(--vp-primary)] bg-black/10">
          <p className="text-xs text-white/60 mb-0.5">Operario</p>
          <p className="text-sm font-medium text-white/90 truncate">
            {user.firstName} {user.lastName}
          </p>
        </div>
      )}

      {/* Navegación filtrada por rol */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems
          // Filtramos dinámicamente usando el rol del contexto
          .filter((item) => user?.role && item.roles.includes(user.role))
          .map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[var(--vp-primary)] text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-[var(--vp-primary)]"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>

      {/* Botón de Logout */}
      <div className="p-5 border-t border-[var(--vp-primary)]">
        <button
          onClick={logout} // Llamamos directamente a la función del contexto
          className="w-full py-2.5 px-4 bg-transparent border border-[var(--vp-primary)] text-white/70 rounded-lg text-sm hover:bg-[var(--vp-primary)] hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}