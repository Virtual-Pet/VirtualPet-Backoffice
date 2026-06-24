"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { backofficeService } from "@/lib/services/backoffice";
import type { OrderDetail, ShipmentStatus, ShipmentSummary } from "@/lib/types";
import { OrderTabs } from "@/components/orders/OrderTabs";
import { OrderTable } from "@/components/orders/OrderTable";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { useShipmentEvents } from "@/hooks/useShipmentEvents";
import { useAuth } from "@/context/authContext";
import { createLogger } from "@/lib/logger";

const log = createLogger("orders-page");

type AdvanceTarget = "PREPARED" | "ASSIGNED" | "DELIVERED";

/** The "Listos para enviar" (PREPARED) tab also holds RETURNED shipments. */
function tabMatchesStatus(tab: ShipmentStatus, status: ShipmentStatus): boolean {
  if (tab === "PREPARED") return status === "PREPARED" || status === "RETURNED";
  return tab === status;
}

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
    async (
      status: ShipmentStatus,
      cursor: string | null,
      append: boolean,
      // Silent = background refresh from a live event: update rows in place
      // without flashing the loading spinner or clearing the list on error.
      silent = false,
    ) => {
      if (!silent) {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(null);
      }
      try {
        if (status === "PREPARED") {
          // "Listos para enviar" shows both PREPARED and RETURNED shipments.
          // Pagination is not supported across the combined view.
          const [prepared, returned] = await Promise.all([
            backofficeService.listShipments({ status: "PREPARED" }, token ?? undefined),
            backofficeService.listShipments({ status: "RETURNED" }, token ?? undefined),
          ]);
          const merged = [...prepared.data, ...returned.data].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
          setOrders((prev) => (append ? [...prev, ...merged] : merged));
          setNextCursor(null);
          setHasMore(false);
        } else {
          const page = await backofficeService.listShipments(
            { status, cursor: cursor ?? undefined },
            token ?? undefined,
          );
          setOrders((prev) => (append ? [...prev, ...page.data] : page.data));
          setNextCursor(page.nextCursor);
          setHasMore(page.hasMore);
        }
      } catch (err) {
        log.error("Error cargando pedidos", err);
        if (silent) return; // keep the current list on a failed background refresh
        if (!append) setOrders([]);
        setError(
          (err as { message?: string })?.message ??
            "No se pudieron cargar los pedidos. Verificá que el backend esté corriendo.",
        );
      } finally {
        if (!silent) {
          if (append) setLoadingMore(false);
          else setLoading(false);
        }
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(activeTab, null, false);
  }, [activeTab, token, fetchPage]);

  // Debounced re-fetch of the active tab — used when a live event brings a
  // shipment INTO this tab (the event lacks the full row data we need).
  const resyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleResync = useCallback(() => {
    if (resyncTimer.current) clearTimeout(resyncTimer.current);
    resyncTimer.current = setTimeout(() => fetchPage(activeTab, null, false, true), 400);
  }, [activeTab, fetchPage]);

  useEffect(() => () => {
    if (resyncTimer.current) clearTimeout(resyncTimer.current);
  }, []);

  // Live shipment status updates over SSE.
  const hasConnectedRef = useRef(false);
  useShipmentEvents(token, {
    onConnected: () => {
      // On *re*connect, re-fetch to recover any events missed during the gap.
      if (hasConnectedRef.current) scheduleResync();
      hasConnectedRef.current = true;
    },
    onUpdate: (evt) => {
      const matches = tabMatchesStatus(activeTab, evt.status);
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.shipmentId === evt.shipmentId);
        if (idx === -1) {
          // Not currently listed; if it now belongs here, pull the full row.
          if (matches) scheduleResync();
          return prev;
        }
        if (!matches) {
          // Moved to a different status → drop it from this tab.
          return prev.filter((o) => o.shipmentId !== evt.shipmentId);
        }
        // Still in this tab (e.g. PREPARED → RETURNED) → update in place.
        const next = [...prev];
        next[idx] = { ...next[idx], status: evt.status, updatedAt: evt.updatedAt };
        return next;
      });
    },
  });

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
