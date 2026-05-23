"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { employeesService } from "@/lib/services/employees.service";

export default function ProfilePage() {
    const { user, token } = useAuth(); // Asumiendo que agregaste token y setUser al contexto
    const [formData, setFormData] = useState({ name: "", lastname: "", email: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                lastname: user.lastname || "",
                email: user.email || "",
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
                { name: formData.name, lastname: formData.lastname },
                token
            );

            // Actualizamos el estado global para que el Sidebar se refresque
            // setUser(updatedUser);

            setMessage({ type: "success", text: "Perfil actualizado correctamente." });
        } catch {
            setMessage({ type: "error", text: "Hubo un error al actualizar los datos." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null; // Previene renderizados raros si el contexto aún está cargando

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
                <p className="text-sm text-slate-500 mt-1">Configurá tu información personal</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 border text-black border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Apellido</label>
                            <input
                                type="text"
                                value={formData.lastname}
                                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                className="w-full px-4 py-2.5 border text-black border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1.5">El correo electrónico no se puede modificar.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Legajo</label>
                            <input
                                type="text"
                                value={user.type?.legajo || "—"}
                                disabled
                                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Depósito Asignado</label>
                            <input
                                type="text"
                                value={user.type?.warehouse || "—"}
                                disabled
                                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {message.text && (
                        <div
                            className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}