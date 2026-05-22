"use client";

const STATUS_TABS = [
  { key: "PENDING", label: "Pendientes" },
  { key: "IN_PREPARATION", label: "En preparación" },
  { key: "PREPARED", label: "Listos para enviar" },
  { key: "SHIPPED", label: "En camino" },
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
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}