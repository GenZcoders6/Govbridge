"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  requiredRoles?: string[];
}

export function AppShell({ children, title, subtitle, requiredRoles }: AppShellProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait until Zustand has rehydrated stored credentials from localStorage
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, requiredRoles, router, hasHydrated]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Header title={title} subtitle={subtitle} />
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
