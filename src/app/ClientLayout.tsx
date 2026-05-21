"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const MANAGER_TOKEN_KEY = "vp_manager_token";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(MANAGER_TOKEN_KEY);
    if (!token && pathname !== "/login") {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  const isLoginPage = pathname === "/login";

  if (isLoginPage) return <>{children}</>;
  if (!ready) return null;

  const handleLogout = () => {
    localStorage.removeItem(MANAGER_TOKEN_KEY);
    router.push("/login");
  };

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          background: "#0f172a",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: "0",
        }}
      >
        <div
          style={{
            padding: "1.75rem 1.5rem",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>🏪</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem" }}>
                Virtual Pet
              </p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                Depósito
              </p>
            </div>
          </div>
        </div>
        <nav
          style={{
            flex: 1,
            padding: "1rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {[{ href: "/orders", label: "Pedidos", icon: "📋" }].map(
            (item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: active ? "white" : "#94a3b8",
                    background: active ? "#1e293b" : "transparent",
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.9rem",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            }
          )}
        </nav>
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid #1e293b",
          }}
        >
          <button
            id="manager-logout-btn"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.625rem",
              background: "transparent",
              color: "#94a3b8",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.15s",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
    </div>
  );
}
