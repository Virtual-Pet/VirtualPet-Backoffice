"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { employeesService } from "@/lib/services/employees.service";
import { authService } from "@/lib/services/auth.service";

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth(); // Asumiendo que agregaste token y setUser al contexto
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    legajo: "",
    warehouseId: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Estados para el contenedor de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        legajo: user.type?.legajo || "",
        warehouseId: user.type?.warehouse || 0,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Usamos el servicio de empleados para actualizar (Asumiendo que el ID es necesario)
      const updatedUser = await employeesService.update(
        user.id,
        {
          name: formData.name,
          lastname: formData.lastname,
          email: formData.email,
          legajo: formData.legajo,
          warehouseId: formData.warehouseId,
        },
        token,
      );

      // Actualizamos el estado global para que el Sidebar se refresque
      updateUser(updatedUser);

      setMessage({
        type: "success",
        text: "Perfil actualizado correctamente.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Hubo un error al actualizar los datos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validaciones del lado del cliente antes de disparar a la API
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      // Consumimos el método centralizado que creamos antes
      await authService.changePassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token,
      );

      setPasswordMessage({
        type: "success",
        text: "Contraseña actualizada con éxito.",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }); // Limpiamos campos
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: "Hubo un problema al procesar el cambio.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null; // Previene renderizados raros si el contexto aún está cargando

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-slate-50 pb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurá tu información personal
        </p>
      </div>
      <div className="mt-6 space-y-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500"
                  required
                  disabled={user.role !== "ROLE_ADMIN"} // Solo los administradores pueden editar los campos
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) =>
                    setFormData({ ...formData, lastname: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500"
                  required
                  disabled={user.role !== "ROLE_ADMIN"} // Solo los administradores pueden editar los campos
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500 "
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Legajo
                </label>
                <input
                  type="text"
                  value={formData.legajo}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-mono text-slate-500 "
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Depósito Asignado
                </label>
                <input
                  type="text"
                  value={formData.warehouseId}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500"
                />
              </div>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-xl text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {user.role === "ROLE_ADMIN" && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Seguridad de la cuenta
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Actualizá tu credencial de acceso al sistema.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border text-black border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border text-black border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border text-black border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {passwordMessage.text && (
              <div
                className={`p-4 rounded-xl text-sm font-medium ${
                  passwordMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
              >
                {isChangingPassword ? "Actualizando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
