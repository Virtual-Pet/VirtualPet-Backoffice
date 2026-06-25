"use client";

import type { ShipmentStatus, ShipmentSummary } from "@/lib/types";
import { formatPrice } from "@/lib/api";

type AdvanceTarget = "PREPARED" | "ASSIGNED" | "DELIVERED";

const NEXT_STATUS: Partial<
  Record<ShipmentStatus, { label: string; next: AdvanceTarget; colorClass: string }>
> = {
  CONFIRMED: {
    label: "Marcar como Preparado",
    next: "PREPARED",
    colorClass: "bg-violet-600 hover:bg-violet-700",
  },
  PREPARED: {
    label: "Enviar",
    next: "ASSIGNED",
    colorClass: "bg-amber-500 hover:bg-amber-600",
  },
  ASSIGNED: {
    label: "Confirmar entrega",
    next: "DELIVERED",
    colorClass: "bg-[var(--vp-primary)] hover:bg-[var(--vp-primary-dark)]",
  },
};

const CAN_CANCEL: ReadonlySet<ShipmentStatus> = new Set(["CONFIRMED", "PREPARED", "RETURNED"]);

interface OrderTableProps {
  orders: ShipmentSummary[];
  loading: boolean;
  activeTab: ShipmentStatus;
  onAdvance: (shipmentId: string, nextStatus: AdvanceTarget) => void;
  onCancel: (orderId: string) => void;
  onViewDetail: (orderId: string, attempts?: number) => void;
}

export function OrderTable({
  orders,
  loading,
  activeTab,
  onAdvance,
  onCancel,
  onViewDetail,
}: OrderTableProps) {
  const nextAction = NEXT_STATUS[activeTab];
  const canCancel = CAN_CANCEL.has(activeTab);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-(--vp-border) p-12 text-center text-(--vp-muted)"
        style={{ boxShadow: "var(--vp-shadow-sm)" }}>
        <div className="inline-block w-5 h-5 border-2 border-(--vp-primary) border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Cargando pedidos...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-(--vp-border) p-16 text-center"
        style={{ boxShadow: "var(--vp-shadow-sm)" }}>
        <div className="w-12 h-12 rounded-full bg-(--vp-primary-light) flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--vp-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="font-semibold text-slate-700">No hay pedidos en este estado</p>
        <p className="text-sm text-(--vp-muted) mt-1">Todos al día por aquí</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border border-(--vp-border) overflow-hidden"
      style={{ boxShadow: "var(--vp-shadow)" }}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr
            className="border-b border-(--vp-border) text-xs uppercase tracking-wider text-(--vp-muted) font-semibold"
            style={{ background: "var(--background)" }}
          >
            <th className="px-6 py-4">Pedido</th>
            <th className="px-6 py-4">Cliente</th>
            {["ASSIGNED", "DELIVERED"].includes(activeTab) && (
              <th className="px-6 py-4">Repartidor</th>
            )}
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Actualizado</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--vp-border) text-sm">
          {orders.map((order) => (
            <tr
              key={order.shipmentId}
              className="hover:bg-slate-50/60 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    #{order.orderId.slice(-8).toUpperCase()}
                  </span>
                  {order.status === "RETURNED" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 uppercase tracking-wide">
                      Retornado
                    </span>
                  )}
                  {order.billingCuit && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide"
                      title={order.billingCuit}
                    >
                      CUIT
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold text-slate-800 m-0">
                  {order.contactName ?? "—"}
                </p>
                <p className="text-xs text-(--vp-muted) m-0 mt-0.5">
                  {order.contactEmail ?? "—"}
                </p>
                {order.shippingAddress && (
                  <p className="text-xs text-slate-400 m-0 mt-1">
                    {order.shippingAddress.addressLine},{" "}
                    {order.shippingAddress.city}
                  </p>
                )}
              </td>
              {["ASSIGNED", "DELIVERED"].includes(activeTab) && (
                <td className="px-6 py-4 text-sm">
                  {order.rider ? (
                    <>
                      <p className="font-semibold text-slate-800 m-0">
                        {order.rider.name} {order.rider.lastname}
                      </p>
                      <p className="text-xs text-(--vp-muted) m-0 mt-0.5">{order.rider.phone}</p>
                      <p className="text-xs text-slate-400 m-0 mt-1">{order.rider.vehicleType}</p>
                    </>
                  ) : (
                    <span className="text-(--vp-muted)">—</span>
                  )}
                </td>
              )}
              <td className="px-6 py-4">
                <span className="font-bold text-slate-800">
                  {formatPrice(order.total)}
                </span>
              </td>
              <td className="px-6 py-4 text-(--vp-muted) text-xs">
                {order.updatedAt
                  ? new Date(order.updatedAt).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => onViewDetail(order.orderId, order.attempts)}
                    className="px-3 py-1.5 rounded-lg text-xs cursor-pointer font-semibold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 whitespace-nowrap"
                    style={{ boxShadow: "var(--vp-shadow-sm)" }}
                  >
                    Ver detalle
                  </button>
                  {nextAction && activeTab === "CONFIRMED" && (
                    <button
                      onClick={() =>
                        onAdvance(order.shipmentId, nextAction.next)
                      }
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-white text-xs font-semibold transition-all whitespace-nowrap ${nextAction.colorClass}`}
                      style={{ boxShadow: "var(--vp-shadow-sm)" }}
                    >
                      {nextAction.label}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => onCancel(order.orderId)}
                      className="px-3 py-1.5 rounded-lg text-white cursor-pointer text-xs font-semibold transition-all bg-red-500 hover:bg-red-600 whitespace-nowrap"
                      style={{ boxShadow: "var(--vp-shadow-sm)" }}
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
