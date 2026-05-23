"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function ManagerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Extraemos la lógica de negocio de nuestro Hook
  const { login, user } = useAuth(); 
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si el usuario ya está logueado, lo redirigimos automáticamente
    if (user) {
      router.push("/orders");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      // Toda la magia pasa acá adentro
      await login(email, password);
    } catch {
      setError("Credenciales inválidas. Verificá tu usuario y contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 font-sans">
      <div className="bg-white rounded-[24px] p-8 sm:p-10 w-full max-w-[420px] shadow-2xl">
        
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">
            🏪
          </div>
          <h1 className="text-2xl font-bold text-slate-900 m-0 tracking-tight">
            Virtual Pet
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Portal de operarios — Depósito
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="manager-email"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Email
            </label>
            <input
              id="manager-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operario@virtualpet.com"
              required
              autoComplete="username"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none transition-all bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="manager-password"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="manager-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none transition-all bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button
            id="manager-login-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl text-base font-semibold shadow-md transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-md"
          >
            {isSubmitting ? "Ingresando..." : "Ingresar al depósito"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          ¿Sos cliente?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 transition-colors"
          >
            Ir al Marketplace
          </Link>
        </p>
      </div>
    </div>
  );
}