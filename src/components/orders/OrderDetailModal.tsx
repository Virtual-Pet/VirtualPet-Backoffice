"use client";

import { formatPrice } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

interface OrderDetailModalProps {
  order: OrderDetail;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--vp-border)]"
        style={{ boxShadow: "var(--vp-shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--vp-border)]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900 m-0">Detalle del pedido</h2>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                #{order.orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Creado el{" "}
              {new Date(order.createdAt).toLocaleString("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Productos */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Productos a preparar
            </p>
            <div className="rounded-xl border border-[var(--vp-border)] overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--vp-border)] text-xs text-slate-400 font-semibold uppercase tracking-wider"
                    style={{ background: "var(--background)" }}>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-center">Cant.</th>
                    <th className="px-4 py-3 text-right">Precio unit.</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--vp-border)]">
                  {order.lineItems.map((item) => (
                    <tr key={item.skuId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800 m-0">{item.productName}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{item.sku}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--vp-primary-light)] font-bold text-[var(--vp-primary)] text-sm">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 text-xs">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                        {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Totales + Dirección en grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Totales */}
            <section className="rounded-xl border border-[var(--vp-border)] px-5 py-4 space-y-2.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Resumen</p>
              <div className="flex justify-between text-slate-500">
                <span>Productos</span>
                <span>{formatPrice(order.totals.items)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Envío</span>
                <span>{formatPrice(order.totals.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-[var(--vp-border)]">
                <span>Total</span>
                <span>{formatPrice(order.totals.grandTotal)}</span>
              </div>
            </section>

            {/* Dirección */}
            {order.shippingAddress && (
              <section className="rounded-xl border border-[var(--vp-border)] px-5 py-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Entrega</p>
                <p className="font-semibold text-slate-800">{order.shippingAddress.addressLine}</p>
                <p className="text-slate-500 mt-1">
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                </p>
                {order.shippingAddress.postalCode && (
                  <p className="text-slate-400 text-xs mt-1">CP {order.shippingAddress.postalCode}</p>
                )}
              </section>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--vp-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
