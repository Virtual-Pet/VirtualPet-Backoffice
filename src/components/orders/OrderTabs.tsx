"use client";

// PREPARED tab fetches both PREPARED and RETURNED shipments combined.
const STATUS_TABS = [
  { key: "CONFIRMED", label: "Pendientes" },
  { key: "PREPARED", label: "Listos para enviar" },
  { key: "ASSIGNED", label: "En camino" },
  { key: "DELIVERED", label: "Entregados" },
  { key: "CANCELLED", label: "Cancelados" },
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
            className={`px-4 py-2 border-[1.5px] cursor-pointer rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-(--vp-primary-dark) text-white border-(--vp-primary-dark)"
                : "bg-white text-(--vp-muted) border-(--vp-border) hover:border-(--vp-primary) hover:text-(--vp-primary-dark)"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}