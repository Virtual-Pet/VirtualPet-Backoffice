"use client";

import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { employeesService } from "@/lib/services/employees.service";
import type { RegisterRiderRequest } from "@/lib/auth.types";
import { createLogger } from "@/lib/logger";

const log = createLogger("rider-form");

const EMPTY_RIDER: RegisterRiderRequest = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  vehicleType: "MOTO",
  licensePlate: "",
};

export default function RiderForm() {
  const { token } = useAuth();
  const [formData, setFormData] = useState<RegisterRiderRequest>(EMPTY_RIDER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setMessage(null);
    try {
      const created = await employeesService.registerRider(formData, token);
      setFormData(EMPTY_RIDER);
      setMessage({
        type: "success",
        text: `Repartidor creado exitosamente: ${created.email}.`,
      });
    } catch (error) {
      log.error("Error creando repartidor", error);
      const text =
        (error as { message?: string })?.message ??
        "Error al registrar repartidor.";
      setMessage({ type: "error", text });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <div className="sm:col-span-2 mb-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Datos Personales
        </h2>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Nombre
        </label>
        <input
          type="text"
          required
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Apellido
        </label>
        <input
          type="text"
          required
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Teléfono (Celular)
        </label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Ej: +54 9 11 1234-5678"
          className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Contraseña temporal
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="sm:col-span-2 mt-4 mb-2">
        <h2 className="text-lg font-semibold text-slate-800">
          Datos del Vehículo
        </h2>
        <hr className="mt-2 border-slate-100" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Tipo de Vehículo
        </label>
        <select
          required
          value={formData.vehicleType}
          onChange={(e) =>
            setFormData({
              ...formData,
              vehicleType: e.target
                .value as RegisterRiderRequest["vehicleType"],
            })
          }
          className="w-full px-3 py-2 bg-white text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="MOTO">Moto</option>
          <option value="BICI">Bicicleta</option>
          <option value="CAMIONETA">Camioneta</option>
          <option value="AUTO">Auto</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Patente{" "}
          {formData.vehicleType === "BICI" ? "(No aplica)" : "(Opcional)"}
        </label>
        <input
          type="text"
          disabled={formData.vehicleType === "BICI"}
          value={formData.licensePlate}
          onChange={(e) =>
            setFormData({ ...formData, licensePlate: e.target.value })
          }
          placeholder="Ej: AB123CD"
          className="w-full px-3 py-2 text-black border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>

      <StatusMessage message={message} />

      <div className="sm:col-span-2 flex justify-end mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? "Creando..." : "Crear Repartidor"}
        </button>
      </div>
    </form>
  );
}

function StatusMessage({
  message,
}: {
  message: { type: "success" | "error"; text: string } | null;
}) {
  if (!message) return null;
  return (
    <div
      className={`sm:col-span-2 p-3 mt-2 rounded-lg text-sm font-medium ${
        message.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {message.text}
    </div>
  );
}
