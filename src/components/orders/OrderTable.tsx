"use client";

import type { BackofficeOrder } from "@/lib/types";
import { formatPrice } from "@/lib/api";

/**
 * Maps the current ShipmentStatus (= the active tab) to the action button config.
 * The `next` value is the backend ShipmentStatus target for PATCH /api/v1/shipments/{id}.
 *
 * Backend state machine: CONFIRMED → PREPARED → IN_TRANSIT → DELIVERED
 */
const NEXT_STATUS: Record<string, { label: string; next: string; colorClass: string }> = {
  CONFIRMED: {
    label: "Marcar como Preparado",
    next: "PREPARED",
    colorClass: "bg-purple-600 hover:bg-purple-700",
  },
  PREPARED: {
    label: "Enviar",
    next: "IN_TRANSIT",
    colorClass: "bg-orange-500 hover:bg-orange-600",
  },
  IN_TRANSIT: {
    label: "Confirmar entrega",
    next: "DELIVERED",
    colorClass: "bg-[var(--vp-primary)] hover:bg-[var(--vp-primary-dark)]",
  },
  // DELIVERED is terminal — no action button
};

interface OrderTableProps {
  orders: BackofficeOrder[];
  loading: boolean;
  activeTab: string;
  onAction: (shipmentId: string, nextStatus: string) => void;
}

export function OrderTable({ orders, loading, activeTab, onAction }: OrderTableProps) {
  const nextAction = NEXT_STATUS[activeTab];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--vp-border)] p-12 text-center text-[var(--vp-muted)]">
        Cargando pedidos...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--vp-border)] p-16 text-center text-[var(--vp-muted)]">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-medium text-[var(--foreground)]">No hay pedidos en este estado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--vp-border)] overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--background)] border-b border-[var(--vp-border)] text-xs uppercase tracking-wide text-[var(--vp-muted)] font-semibold">
            <th className="px-5 py-4">Pedido</th>
            <th className="px-5 py-4">Cliente</th>
            <th className="px-5 py-4">Total</th>
            <th className="px-5 py-4">Fecha</th>
            <th className="px-5 py-4">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--vp-border)] text-sm">
          {orders.map((order) => (
            <tr key={order.shipmentId} className="hover:bg-[var(--background)] transition-colors">
              <td className="px-5 py-4">
                <span className="font-mono font-bold text-[var(--foreground)]">
                  #{order.orderId.slice(0, 8).toUpperCase()}
                </span>
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-[var(--foreground)] m-0">{order.contactName}</p>
                <p className="text-xs text-[var(--vp-muted)] m-0 mt-0.5">{order.contactEmail}</p>
              </td>
              <td className="px-5 py-4 font-bold text-[var(--foreground)]">
                {formatPrice(order.total)}
              </td>
              <td className="px-5 py-4 text-[var(--vp-muted)]">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "—"}
              </td>
              <td className="px-5 py-4">
                {nextAction && (
                  <button
                    onClick={() => onAction(order.shipmentId, nextAction.next)}
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