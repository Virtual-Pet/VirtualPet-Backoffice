"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/authContext";

const IconOrders = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="M9 12h6M9 16h4"/>
  </svg>
);

const IconEmployees = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const navItems = [
  { href: "/orders",    label: "Pedidos",    Icon: IconOrders,    roles: ["ADMIN", "EMPLOYEE"] },
  { href: "/employees", label: "Empleados",  Icon: IconEmployees, roles: ["ADMIN"] },
  { href: "/profile",   label: "Mi Perfil",  Icon: IconProfile,   roles: ["ADMIN", "EMPLOYEE"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <aside
      className="w-64 shrink-0 flex flex-col min-h-screen"
      style={{ background: "var(--vp-primary-dark)" }}
    >
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--vp-accent)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-tight m-0">
            Virtual Pet
          </p>
          <p className="text-white/40 text-xs m-0">Backoffice</p>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div
          className="px-4 py-4 mx-3 mt-4 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: "var(--vp-accent)" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium m-0 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-white/40 text-xs m-0 capitalize">
              {user.role?.toLowerCase() ?? "operario"}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 flex flex-col gap-1">
        {navItems
          .filter((item) => user?.role && item.roles.includes(user.role))
          .map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/55 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-5 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center cursor-pointer bg-red-500  gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-80 transition-all"
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
