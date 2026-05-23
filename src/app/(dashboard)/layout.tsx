"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vp_manager_token");
    if (!token) {
      router.replace("/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex max-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-scroll p-8">
        {children}
      </main>
    </div>
  );
}