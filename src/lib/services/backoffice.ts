import { api } from "@/lib/api";
import type { BackofficeOrder } from "@/lib/types";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK_SERVICES === "1";
const ORDERS_KEY = "vp_mock_orders";

function isClient() {
  return typeof window !== "undefined";
}

function readOrders(): BackofficeOrder[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as BackofficeOrder[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: BackofficeOrder[]) {
  if (!isClient()) return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function listByStatus(status: string, token?: string): Promise<BackofficeOrder[]> {
  if (useMock) {
    return Promise.resolve(
      readOrders().filter((o) => o.shipmentStatus === status)
    );
  }
  return api<BackofficeOrder[]>(`/api/v1/backoffice/orders?status=${status}`, { token });
}

export async function updateStatus(
  orderId: string,
  status: string,
  token?: string
): Promise<void> {
  if (useMock) {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx >= 0) {
      orders[idx].shipmentStatus = status;
      writeOrders(orders);
    }
    return Promise.resolve();
  }
  await api(`/api/v1/backoffice/orders/${orderId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export const backofficeService = { listByStatus, updateStatus };
export default backofficeService;
