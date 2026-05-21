"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const MANAGER_TOKEN_KEY = "vp_manager_token";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    lastname: string;
  };
}

export default function ManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.user.role !== "ROLE_EMPLOYEE") {
        setError(
          "Acceso denegado. Esta área es exclusiva del personal operativo."
        );
        return;
      }
      localStorage.setItem(MANAGER_TOKEN_KEY, res.token);
      router.replace("/orders");
    } catch {
      setError("Credenciales inválidas. Verificá tu usuario y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9375rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          background: white;
        }
        .login-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .login-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.88; }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "1rem",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "2.5rem",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          }}
        >
          {/* Logo area */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #1e293b, #0f172a)",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                fontSize: "1.75rem",
              }}
            >
              🏪
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Virtual Pet
            </h1>
            <p
              style={{
                margin: "0.375rem 0 0",
                color: "#64748b",
                fontSize: "0.875rem",
              }}
            >
              Portal de operarios — Depósito
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                htmlFor="manager-email"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}
              >
                Email
              </label>
              <input
                id="manager-email"
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operario@virtualpet.com"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="manager-password"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "0.375rem",
                }}
              >
                Contraseña
              </label>
              <input
                id="manager-password"
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  color: "#dc2626",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <button
              id="manager-login-btn"
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar al depósito"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.8125rem",
              color: "#94a3b8",
            }}
          >
            ¿Sos cliente?{" "}
            <a
              href="/login"
              style={{ color: "#3b82f6", textDecoration: "none" }}
            >
              Ir al Marketplace
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
