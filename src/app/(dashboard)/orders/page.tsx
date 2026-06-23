"use client";

import { useEffect, useState, useCallback } from "react";
import { backofficeService } from "@/lib/services/backoffice";
import type { OrderDetail, ShipmentStatus, ShipmentSummary } from "@/lib/types";
import { OrderTabs } from "@/components/orders/OrderTabs";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { useAuth } from "@/context/authContext";
import { createLogger } from "@/lib/logger";

const log = createLogger("orders-page");

type AdvanceTarget = "PREPARED" | "IN_TRANSIT" | "DELIVERED";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<ShipmentStatus>("CONFIRMED");
  const [orders, setOrders] = useState<ShipmentSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { token } = useAuth();

  const fetchPage = useCallback(
    async (status: ShipmentStatus, cursor: string | null, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const page = await backofficeService.listShipments(
          { status, cursor: cursor ?? undefined },
          token ?? undefined,
        );
        setOrders((prev) => (append ? [...prev, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (err) {
        log.error("Error cargando pedidos", err);
        if (!append) setOrders([]);
        setError(
          (err as { message?: string })?.message ??
            "No se pudieron cargar los pedidos. Verificá que el backend esté corriendo.",
        );
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(activeTab, null, false);
  }, [activeTab, token, fetchPage]);

  const handleAdvance = async (shipmentId: string, nextStatus: AdvanceTarget) => {
    try {
      await backofficeService.advanceShipment(shipmentId, nextStatus, token ?? undefined);
      await fetchPage(activeTab, null, false);
    } catch (err) {
      log.error("Error actualizando estado de envío", { shipmentId, nextStatus, err });
      alert(
        (err as { message?: string })?.message ??
          "Error al actualizar el estado. Intentá de nuevo.",
      );
    }
  };

  const handleViewDetail = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const detail = await backofficeService.getOrder(orderId, token ?? undefined);
      setSelectedOrder(detail);
    } catch (err) {
      log.error("Error cargando detalle del pedido", { orderId, err });
      alert(
        (err as { message?: string })?.message ?? "No se pudo cargar el detalle del pedido.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm("¿Cancelar esta orden? Se repone el stock e inicia un reembolso.")) return;
    try {
      await backofficeService.cancelOrder(orderId, undefined, token ?? undefined);
      await fetchPage(activeTab, null, false);
    } catch (err) {
      log.error("Error cancelando orden", { orderId, err });
      alert(
        (err as { message?: string })?.message ??
          "No se pudo cancelar la orden. Intentá de nuevo.",
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de pedidos</h1>
        <p className="text-sm text-slate-500 mt-1">Depósito Central Mar del Plata</p>
      </div>

      <OrderTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t as ShipmentStatus)} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <OrderTable
        orders={orders}
        loading={loading || detailLoading}
        activeTab={activeTab}
        onAdvance={handleAdvance}
        onCancel={handleCancel}
        onViewDetail={handleViewDetail}
      />

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => fetchPage(activeTab, nextCursor, true)}
            disabled={loadingMore}
            className="px-5 py-2.5 rounded-lg border border-(--vp-border) bg-white text-sm font-medium text-foreground hover:bg-background transition-colors disabled:opacity-60"
          >
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
}
