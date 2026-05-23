"use client";

import type { BackofficeOrder } from "@/lib/types";
// Si tenés una función para formatear precios en otro lado, la importás acá.
// Por ejemplo: import { formatPrice } from "@/lib/utils/formatters";

// Definimos los siguientes estados posibles
const NEXT_STATUS: Record<string, { label: string; next: string; colorClass: string }> = {
  PENDING: { label: "Comenzar preparación", next: "IN_PREPARATION", colorClass: "bg-purple-600 hover:bg-purple-700" },
  IN_PREPARATION: { label: "Marcar como listo", next: "PREPARED", colorClass: "bg-cyan-500 hover:bg-cyan-600" },
  PREPARED: { label: "Enviar", next: "SHIPPED", colorClass: "bg-orange-500 hover:bg-orange-600" },
  SHIPPED: { label: "Confirmar entrega", next: "DELIVERED", colorClass: "bg-green-500 hover:bg-green-600" },
};

interface OrderTableProps {
  orders: BackofficeOrder[];
  loading: boolean;
  activeTab: string;
  onAction: (orderId: string, nextStatus: string) => void;
}

export function OrderTable({ orders, loading, activeTab, onAction }: OrderTableProps) {
  const nextAction = NEXT_STATUS[activeTab];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        Cargando pedidos...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-medium text-slate-700">No hay pedidos en este estado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 font-semibold">
            <th className="px-5 py-4">Pedido</th>
            <th className="px-5 py-4">Cliente</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4">Fecha</th>
            <th className="px-5 py-4">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {orders.map((order) => (
            <tr key={order.shipmentId} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-4">
                <span className="font-mono font-bold text-slate-900">
                  #{order.orderId.slice(0, 8).toUpperCase()}
                </span>
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-slate-800 m-0">{order.contactName}</p>
                <p className="text-xs text-slate-500 m-0 mt-0.5">{order.contactEmail}</p>
              </td>
              <td className="px-5 py-4 font-bold text-slate-900">
                ${order.total?.toLocaleString("es-AR")}
              </td>
              <td className="px-5 py-4 text-slate-500">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "—"}
              </td>
              <td className="px-5 py-4">
                {nextAction && (
                  <button
                    onClick={() => onAction(order.orderId, nextAction.next)}
                    className={`px-4 py-2 rounded-lg text-white font-semibold text-xs transition-colors shadow-sm ${nextAction.colorClass}`}
                  >
                    {nextAction.label}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}