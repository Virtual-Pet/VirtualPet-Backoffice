import { api } from "@/lib/api";
import type {
  CursorPage,
  OrderCancellation,
  OrderDetail,
  Shipment,
  ShipmentStatus,
  ShipmentSummary,
} from "@/lib/types";

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
    targetStatus: Extract<ShipmentStatus, "PREPARED" | "IN_TRANSIT" | "DELIVERED">,
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
};

export default backofficeService;
