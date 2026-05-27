"use client";

import { useEffect, useState, useCallback } from "react";
import { backofficeService } from "@/lib/services/backoffice";
import type { BackofficeOrder } from "@/lib/types";
import { OrderTabs } from "@/components/orders/OrderTabs";
import { OrderTable } from "@/components/orders/OrderTable";
import { useAuth } from "@/context/authContext";

export default function OrdersPage() {
  // Default tab: CONFIRMED = pedidos recién pagados, pendientes de preparación
  const [activeTab, setActiveTab] = useState("CONFIRMED");
  const [orders, setOrders] = useState<BackofficeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const loadOrders = useCallback(
    async (status: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await backofficeService.listByStatus(status, token ?? undefined);
        setOrders(data);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
        setOrders([]);
        setError("No se pudieron cargar los pedidos. Verificá que el backend esté corriendo.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      loadOrders(activeTab);
    }
  }, [activeTab, token, loadOrders]);

  const handleStatusChange = async (shipmentId: string, nextStatus: string) => {
    try {
      await backofficeService.advanceShipment(shipmentId, nextStatus, token ?? undefined);
      await loadOrders(activeTab);
    } catch {
      alert("Error al actualizar el estado. Intentá de nuevo.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de pedidos</h1>
        <p className="text-sm text-slate-500 mt-1">Depósito Central Mar del Plata</p>
      </div>

      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <OrderTable
        orders={orders}
        loading={loading}
        activeTab={activeTab}
        onAction={handleStatusChange}
      />
    </div>
  );
}