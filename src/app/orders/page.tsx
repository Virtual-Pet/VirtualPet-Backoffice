"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/api";
import backofficeService from "@/lib/services/backoffice";
import type { BackofficeOrder } from "@/lib/types";

const MANAGER_TOKEN_KEY = "vp_manager_token";

const STATUS_TABS = [
  { key: "PENDING", label: "Pendientes" },
  { key: "IN_PREPARATION", label: "En preparación" },
  { key: "PREPARED", label: "Listos para enviar" },
  { key: "SHIPPED", label: "En camino" },
];

const NEXT_STATUS: Record<
  string,
  { label: string; next: string; color: string }
> = {
  PENDING: { label: "Comenzar preparación", next: "IN_PREPARATION", color: "#8b5cf6" },
  IN_PREPARATION: { label: "Marcar como listo", next: "PREPARED", color: "#06b6d4" },
  PREPARED: { label: "Enviar", next: "SHIPPED", color: "#f97316" },
  SHIPPED: { label: "Confirmar entrega", next: "DELIVERED", color: "#22c55e" },
};

function getManagerToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(MANAGER_TOKEN_KEY) ?? undefined;
}

export default function ManagerOrdersPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState<BackofficeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const token = getManagerToken();
      const data = await backofficeService.listByStatus(status, token);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab, loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const token = getManagerToken();
      await backofficeService.updateStatus(orderId, newStatus, token);
      await loadOrders(activeTab);
    } catch {
      alert("Error al actualizar el estado. Intentá de nuevo.");
    } finally {
      setUpdating(null);
    }
  };

  const nextAction = NEXT_STATUS[activeTab];

  return (
    <>
      <style>{`
        .tab-btn {
          padding: 0.5rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .tab-btn.active {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }
        .tab-btn:hover:not(.active) {
          border-color: #94a3b8;
          color: #374151;
        }
        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.8125rem;
          transition: opacity 0.2s;
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-btn:hover:not(:disabled) { opacity: 0.85; }
        .order-row:hover { background: #f8fafc; }
      `}</style>
      <div style={{ padding: "2rem", maxWidth: "1100px" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Gestión de pedidos
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              marginTop: "0.375rem",
            }}
          >
            Depósito Central Mar del Plata
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key.toLowerCase()}`}
              className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              Cargando pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                padding: "4rem",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                ✅
              </div>
              <p style={{ fontWeight: 500 }}>No hay pedidos en este estado</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  {["Pedido", "Cliente", "Total", "Fecha", "Acción"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.875rem 1.25rem",
                          textAlign: "left",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.shipmentId}
                    className="order-row"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#0f172a",
                        }}
                      >
                        #{order.orderId.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          color: "#1e293b",
                          fontSize: "0.9rem",
                        }}
                      >
                        {order.contactName}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {order.contactEmail}
                      </p>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>
                        {order.total != null ? formatPrice(order.total) : "—"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.25rem",
                        color: "#64748b",
                        fontSize: "0.875rem",
                      }}
                    >
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "es-AR",
                            { day: "2-digit", month: "short" }
                          )
                        : "—"}
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      {nextAction && (
                        <button
                          id={`action-${order.orderId.slice(0, 8)}`}
                          className="action-btn"
                          style={{
                            background: nextAction.color,
                            color: "white",
                          }}
                          disabled={updating === order.orderId}
                          onClick={() =>
                            handleStatusChange(order.orderId, nextAction.next)
                          }
                        >
                          {updating === order.orderId
                            ? "..."
                            : nextAction.label}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
