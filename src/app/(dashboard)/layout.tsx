"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/context/authContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, loading, mustChangePassword } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!token) {
      router.replace("/login");
    } else if (mustChangePassword) {
      router.replace("/auth/change-password");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
    }
  }, [loading, mustChangePassword, router, token]);

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