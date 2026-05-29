import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";

export const metadata: Metadata = {
  title: "Virtual Pet Backoffice",
  description: "Panel de control y logistica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
