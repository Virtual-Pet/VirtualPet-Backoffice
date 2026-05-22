"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/authContext"; // Importamos nuestro hook

export default function Sidebar() {
  const pathname = usePathname();
  
  // Extraemos al usuario y la función de logout directamente del contexto
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/orders", label: "Pedidos", icon: "📋", roles: ["ROLE_ADMIN", "ROLE_EMPLOYEE"] },
    { href: "/employees", label: "Empleados", icon: "👥", roles: ["ROLE_ADMIN"] },
    { href: "/profile", label: "Mi Perfil", icon: "⚙️", roles: ["ROLE_ADMIN", "ROLE_EMPLOYEE"] },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 text-white flex flex-col min-h-screen">
      
      {/* Cabecera del Sidebar */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <span className="text-2xl">🏪</span>
        <div>
          <p className="m-0 font-bold text-sm">Virtual Pet</p>
        </div>
      </div>

      {/* Info del usuario logueado (¡Aprovechamos que ya lo tenemos en el Context!) */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/20">
          <p className="text-xs text-slate-500 mb-0.5">Operario</p>
          <p className="text-sm font-medium text-slate-300 truncate">
            {user.name} {user.lastname}
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
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
      </nav>

      {/* Botón de Logout */}
      <div className="p-5 border-t border-slate-800">
        <button
          onClick={logout} // Llamamos directamente a la función del contexto
          className="w-full py-2.5 px-4 bg-transparent border border-slate-700 text-slate-400 rounded-lg text-sm hover:bg-slate-800 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}