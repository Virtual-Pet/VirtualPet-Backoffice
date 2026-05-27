"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { authService } from "@/lib/services/auth.service";

export default function ChangePasswordPage() {
  const { token, loading, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [loading, token, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "La nueva contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await authService.changePassword(
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        token,
      );

      setMessage({
        type: "success",
        text: "Contraseña actualizada correctamente. Iniciá sesión nuevamente.",
      });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        logout();
      }, 1200);
    } catch {
      setMessage({
        type: "error",
        text: "No se pudo cambiar la contraseña. Verificá tus datos e intentá nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Cambiar contraseña</h1>
          <p className="text-sm text-slate-500 mt-2">
            Ingresá tu contraseña actual y elegí una nueva.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Contraseña actual
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Repetir nueva contraseña
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {message.text && (
            <div
              className={`rounded-2xl p-4 text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-semibold transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? "Cambiando contraseña..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
