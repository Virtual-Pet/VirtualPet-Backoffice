import { api } from "@/lib/api";
import type { BackofficeOrder } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// This service wires the Backoffice UI to the real backend APIs:
//
//   GET  /api/v1/shipments?status=X  → CursorPage<ShipmentSummaryDTO>
//   PATCH /api/v1/shipments/{id}     → ShipmentResponseDTO (advance status)
//
// Backend ShipmentStatus enum values:
//   CONFIRMED → PREPARED → IN_TRANSIT → DELIVERED   |  CANCELLED
//
// The UI tabs map to these backend statuses for filtering,
// and each tab has a "next" target for the advance action.
// ─────────────────────────────────────────────────────────────────────────────

/** Backend DTO shape returned by GET /api/v1/shipments */
interface ShipmentSummaryDTO {
  shipmentId: string;
  orderId: string;
  status: string;
  updatedAt: string;
  contactName: string | null;
  contactEmail: string | null;
  total: number | null;
}

interface CursorPage<T> {
  data: T[];
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Lists shipments filtered by the given backend ShipmentStatus.
 * The ShipmentSummaryDTO already includes contact and total info from the order.
 */
export async function listByStatus(
  status: string,
  token?: string
): Promise<BackofficeOrder[]> {
  const page = await api<CursorPage<ShipmentSummaryDTO>>(
    `/api/v1/shipments?status=${status}&limit=50`,
    { token }
  );

  if (!page.data || page.data.length === 0) {
    return [];
  }

  return page.data.map((s) => ({
    shipmentId: s.shipmentId,
    orderId: s.orderId,
    shipmentStatus: s.status,
    contactName: s.contactName ?? "—",
    contactEmail: s.contactEmail ?? "—",
    total: s.total ?? 0,
    createdAt: s.updatedAt,
  }));
}

/**
 * Advances a shipment to the specified target status.
 * Requires EMPLOYEE or ADMIN role on the JWT.
 *
 * Valid targets: PREPARED, IN_TRANSIT, DELIVERED
 */
export async function advanceShipment(
  shipmentId: string,
  targetStatus: string,
  token?: string
): Promise<void> {
  await api(`/api/v1/shipments/${shipmentId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status: targetStatus }),
  });
}

export const backofficeService = { listByStatus, advanceShipment };
export default backofficeService;
