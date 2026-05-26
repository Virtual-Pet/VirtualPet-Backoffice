"use client";

import { useEffect, useState, useCallback } from "react";
import { ordersService } from "@/lib/services/orders.service";
import type { BackofficeOrder } from "@/lib/types";
import { OrderTabs } from "@/components/orders/OrderTabs";
import { OrderTable } from "@/components/orders/OrderTable";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState<BackofficeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async (status: string) => {
    setLoading(true);
    try {
    //   const data = await ordersService.listByStatus(status);
    //   setOrders(data);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders(activeTab);
  }, [activeTab, loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
    //   await ordersService.updateStatus(orderId, newStatus);
      await loadOrders(activeTab); // Recargamos
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
      
      <OrderTable 
        orders={orders} 
        loading={loading} 
        activeTab={activeTab} 
        onAction={handleStatusChange} 
      />
    </div>
  );
}