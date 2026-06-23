"use client";

import { useState } from "react";
import BackofficeForm from "@/components/employees/BackOfficeForm";
import RiderForm from "@/components/employees/RiderForm";

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<"backoffice" | "rider">(
    "backoffice",
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alta de Personal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Registrá nuevos operarios de sistema o repartidores para la flota.
        </p>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex p-1 space-x-1 bg-slate-100 rounded-xl w-full max-w-md">
        <button
          onClick={() => setActiveTab("backoffice")}
          className={`flex-1 py-2 cursor-pointer text-sm font-medium rounded-lg transition-all ${
            activeTab === "backoffice"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Operario Backoffice
        </button>
        <button
          onClick={() => setActiveTab("rider")}
          className={`flex-1 py-2 cursor-pointer text-sm font-medium rounded-lg transition-all  ${
            activeTab === "rider"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Repartidor 
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {activeTab === "backoffice" ? <BackofficeForm /> : <RiderForm />}
      </div>
    </div>
  );
}
