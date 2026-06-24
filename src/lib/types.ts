export type Money = string;

export type ShipmentStatus =
  | "CONFIRMED"
  | "PREPARED"
  | "ASSIGNED"
  | "RETURNED"
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
  requiresInvoice?: boolean;
  billingCuit?: string;
  rider?: Rider | null;
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

export interface OrderLineItem {
  skuId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: Money;
  subtotal: Money;
}

export interface OrderTotals {
  items: Money;
  shipping: Money;
  grandTotal: Money;
}

export interface OrderShipmentRef {
  shipmentId: string;
  status: ShipmentStatus;
}

export interface Rider {
  name: string;
  lastname: string;
  phone: string;
  vehicleType: string;
}

export interface OrderDetail {
  orderId: string;
  customerId: string;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  totals: OrderTotals;
  currency: string;
  shippingAddress: Address;
  shipment: OrderShipmentRef | null;
  rider?: Rider | null;
  createdAt: string;
  requiresInvoice: boolean;
  billingCuit?: string;
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
