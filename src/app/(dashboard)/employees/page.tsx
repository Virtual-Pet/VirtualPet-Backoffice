"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import { employeesService } from "@/lib/services/employees.service";
import { CreateEmployee, EmployeeApiResponse, mapEmployeeResponseToUser } from "@/lib/auth.types";
import { User } from "@/lib/auth";

export default function EmployeesPage() {
    const { token } = useAuth(); // Necesitamos el token para hacer las peticiones
    const [employees, setEmployees] = useState<EmployeeApiResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<CreateEmployee>({ name: "", lastname: "", email: "", temporaryPassword: "", legajo: "", warehouseId: 1, role: "ROLE_EMPLOYEE" });
    const [isSubmitting, setIsSubmitting] = useState(false);


    const loadEmployees = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await employeesService.getAll(token);
            setEmployees(data);
        } catch (error) {
            console.error("Error cargando empleados:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsSubmitting(true);
        try {
            await employeesService.create(formData as CreateEmployee, token);

            // Limpiamos el formulario
            setFormData({ name: "", lastname: "", email: "", temporaryPassword: "", legajo: "", warehouseId: 1, role: "ROLE_EMPLOYEE" });

            // Recargamos la lista
            await loadEmployees();
        } catch {
            alert("Error al crear el empleado. Verificá los datos e intentá nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Empleados</h1>
                <p className="text-sm text-slate-500 mt-1">Administrá el acceso del personal operativo</p>
            </div>

            {/* Formulario de Alta */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Registrar nuevo empleado</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
                    <div className="xl:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="xl:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Apellido</label>
                        <input
                            type="text"
                            required
                            value={formData.lastname}
                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                            className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="xl:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="xl:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña temporal</label>
                        <input
                            type="password"
                            required
                            value={formData.temporaryPassword}
                            onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                            className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Legajo</label>
                        <input
                            type="text"
                            required
                            value={formData.legajo}
                            onChange={(e) => setFormData({ ...formData, legajo: e.target.value })}
                            className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="xl:col-span-1">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Nº Depósito</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.warehouseId}
                                onChange={(e) => setFormData({ ...formData, warehouseId: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Rol</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as "ROLE_ADMIN" | "ROLE_EMPLOYEE" })}
                                className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="ROLE_EMPLOYEE">Operario</option>
                                <option value="ROLE_ADMIN">Administrador</option>
                            </select>
                        </div>
                    </div>
                    <div className="sm:col-span-2 md:col-span-3 xl:col-span-6 mt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {isSubmitting ? "Creando..." : "Crear empleado"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de Empleados */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 text-sm">Cargando personal...</div>
                ) : employees.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">No hay empleados registrados.</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                                <th className="px-6 py-4 font-semibold">Legajo</th>
                                <th className="px-6 py-4 font-semibold">Nombre y Apellido</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Depósito</th>
                                <th className="px-6 py-4 font-semibold">Rol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-600">
                                        {emp.legajo}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {emp.name} {emp.lastname}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{emp.email}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        Nº {emp.warehouseId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.role === "ROLE_ADMIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-slate-100 text-slate-800"
                                            }`}>
                                            {emp.role === "ROLE_ADMIN" ? "Administrador" : "Operario"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}