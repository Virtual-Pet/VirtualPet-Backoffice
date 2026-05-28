"use client";

import type { ShipmentStatus, ShipmentSummary } from "@/lib/types";
import { formatPrice } from "@/lib/api";

type AdvanceTarget = "PREPARED" | "IN_TRANSIT" | "DELIVERED";

const NEXT_STATUS: Partial<
  Record<ShipmentStatus, { label: string; next: AdvanceTarget; colorClass: string }>
> = {
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
};

const CAN_CANCEL: ReadonlySet<ShipmentStatus> = new Set(["CONFIRMED", "PREPARED"]);

interface OrderTableProps {
  orders: ShipmentSummary[];
  loading: boolean;
  activeTab: ShipmentStatus;
  onAdvance: (shipmentId: string, nextStatus: AdvanceTarget) => void;
  onCancel: (orderId: string) => void;
}

export function OrderTable({
  orders,
  loading,
  activeTab,
  onAdvance,
  onCancel,
}: OrderTableProps) {
  const nextAction = NEXT_STATUS[activeTab];
  const canCancel = CAN_CANCEL.has(activeTab);

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
            <th className="px-5 py-4">Actualizado</th>
            <th className="px-5 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--vp-border)] text-sm">
          {orders.map((order) => (
            <tr
              key={order.shipmentId}
              className="hover:bg-[var(--background)] transition-colors"
            >
              <td className="px-5 py-4">
                <span className="font-mono font-bold text-[var(--foreground)]">
                  #{order.orderId.slice(0, 8).toUpperCase()}
                </span>
              </td>
              <td className="px-5 py-4">
                <p className="font-medium text-[var(--foreground)] m-0">
                  {order.contactName ?? "—"}
                </p>
                <p className="text-xs text-[var(--vp-muted)] m-0 mt-0.5">
                  {order.contactEmail ?? "—"}
                </p>
                {order.shippingAddress && (
                  <p className="text-xs text-slate-500 m-0 mt-1 italic font-semibold">
                    📍 {order.shippingAddress.addressLine}, {order.shippingAddress.city}
                  </p>
                )}
              </td>

              <td className="px-5 py-4 font-bold text-[var(--foreground)]">
                {formatPrice(order.total)}
              </td>
              <td className="px-5 py-4 text-[var(--vp-muted)]">
                {order.updatedAt
                  ? new Date(order.updatedAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-2 flex-wrap">
                  {nextAction && (
                    <button
                      onClick={() => onAdvance(order.shipmentId, nextAction.next)}
                      className={`px-4 py-2 rounded-lg text-white font-semibold text-xs transition-colors shadow-sm ${nextAction.colorClass}`}
                    >
                      {nextAction.label}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => onCancel(order.orderId)}
                      className="px-4 py-2 rounded-lg text-white font-semibold text-xs transition-colors shadow-sm bg-red-600 hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
