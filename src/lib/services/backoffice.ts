import { api } from "@/lib/api";
import { openSse } from "@/lib/sse";
import type {
  CursorPage,
  OrderCancellation,
  OrderDetail,
  Shipment,
  ShipmentStatus,
  ShipmentSummary,
} from "@/lib/types";

export interface ShipmentUpdateEvent {
  shipmentId: string;
  orderId: string;
  status: ShipmentStatus;
  previousStatus: ShipmentStatus;
  updatedAt: string;
}

export interface ShipmentEventHandlers {
  onUpdate: (event: ShipmentUpdateEvent) => void;
  /** Fired on the SSE `connected` handshake event (stream is live). */
  onConnected?: () => void;
  /** Fired when the stream drops; it will reconnect automatically. */
  onDisconnected?: (err: unknown) => void;
}

interface ListShipmentsParams {
  status?: ShipmentStatus | string;
  cursor?: string | null;
  limit?: number;
  user?: string;
}

function buildQuery(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const backofficeService = {
  async listShipments(
    { status, cursor, limit, user }: ListShipmentsParams,
    token?: string
  ): Promise<CursorPage<ShipmentSummary>> {
    const query = buildQuery({ status, cursor, limit, user });
    return api<CursorPage<ShipmentSummary>>(`/api/v1/shipments${query}`, { token });
  },

  async advanceShipment(
    shipmentId: string,
    targetStatus: Extract<ShipmentStatus, "PREPARED" | "ASSIGNED" | "DELIVERED">,
    token?: string
  ): Promise<Shipment> {
    return api<Shipment>(`/api/v1/shipments/${shipmentId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status: targetStatus }),
    });
  },

  async getOrder(orderId: string, token?: string): Promise<OrderDetail> {
    return api<OrderDetail>(`/api/v1/orders/${orderId}`, { token });
  },

  async cancelOrder(
    orderId: string,
    reason: string | undefined,
    token?: string
  ): Promise<OrderCancellation> {
    return api<OrderCancellation>(`/api/v1/orders/${orderId}/cancel`, {
      method: "POST",
      token,
      body: JSON.stringify(reason ? { reason } : {}),
    });
  },

  /**
   * Subscribe to live shipment status changes over SSE.
   * Pass `orderId` to only receive events for one order's shipment.
   * Returns a function that closes the stream.
   */
  subscribeShipmentEvents(
    handlers: ShipmentEventHandlers,
    { token, orderId }: { token?: string; orderId?: string } = {},
  ): () => void {
    const query = orderId ? `?orderId=${encodeURIComponent(orderId)}` : "";
    return openSse(`/api/v1/shipments/events${query}`, {
      token,
      onError: handlers.onDisconnected,
      onMessage: ({ event, data }) => {
        if (event === "connected") {
          handlers.onConnected?.();
          return;
        }
        if (event === "shipment-update") {
          try {
            handlers.onUpdate(JSON.parse(data) as ShipmentUpdateEvent);
          } catch {
            // ignore malformed payloads
          }
        }
      },
    });
  },
};

export default backofficeService;
