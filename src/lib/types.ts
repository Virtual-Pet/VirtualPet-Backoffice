export type Money = string;

export type ShipmentStatus =
  | "CONFIRMED"
  | "PREPARED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type OrderStatus = "CONFIRMED" | "CANCELLED";

export interface Address {
  addressLine: string;
  city: string;
  state?: string;
  country?: string;
  postalCode: string;
}

export interface ShipmentSummary {
  shipmentId: string;
  orderId: string;
  status: ShipmentStatus;
  updatedAt: string;
  contactName: string | null;
  contactEmail: string | null;
  total: Money;
  shippingAddress?: Address;
}


export interface ShipmentStatusHistoryEntry {
  status: ShipmentStatus;
  at: string;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  status: ShipmentStatus;
  shippingAddress: Address;
  statusHistory: ShipmentStatusHistoryEntry[];
}

export interface OrderCancellation {
  orderId: string;
  status: "CANCELLED";
  shipment: {
    shipmentId: string;
    status: ShipmentStatus;
  };
  refund?: {
    paymentId: string;
    status: string;
  };
}

export interface CursorPage<T> {
  data: T[];
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ProblemFieldError {
  field: string;
  issue: string;
}

export interface Problem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: ProblemFieldError[];
}
