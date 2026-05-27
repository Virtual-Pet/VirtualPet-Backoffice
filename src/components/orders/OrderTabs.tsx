"use client";

/**
 * Tabs for filtering shipments by their backend ShipmentStatus.
 * Maps directly to the ShipmentStatus enum: CONFIRMED, PREPARED, IN_TRANSIT, DELIVERED.
 */
const STATUS_TABS = [
  { key: "CONFIRMED", label: "Pendientes" },
  { key: "PREPARED", label: "Listos para enviar" },
  { key: "IN_TRANSIT", label: "En camino" },
  { key: "DELIVERED", label: "Entregados" },
];

interface OrderTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function OrderTabs({ activeTab, onTabChange }: OrderTabsProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {STATUS_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 border-[1.5px] rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-[var(--vp-primary-dark)] text-white border-[var(--vp-primary-dark)]"
                : "bg-white text-[var(--vp-muted)] border-[var(--vp-border)] hover:border-[var(--vp-primary)] hover:text-[var(--vp-primary-dark)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}