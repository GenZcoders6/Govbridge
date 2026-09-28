"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DepartmentBar } from "./DepartmentBar";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  requiredRoles?: string[];
  breadcrumb?: string[];
}

export function AppShell({ children, title, subtitle, requiredRoles, breadcrumb }: AppShellProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f6f8" }}>
        <div style={{ fontSize: 13, color: "#003366", fontWeight: 700 }}>Loading Government Portal Session...</div>
      </div>
    );
  }

  // Generate role-aware breadcrumb if not provided
  const isCitizen = user?.role === "CITIZEN";
  const defaultBreadcrumbs = breadcrumb
    ? breadcrumb.map((b) => (b === "Department Officer" && isCitizen ? "Citizen Portal" : b))
    : [
        "Home",
        isCitizen ? "Citizen Portal" : "Department Officer",
        title,
      ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* Formal Header with Top Utility Bar, Identity Header, and Horizontal Nav */}
      <Header title={title} subtitle={subtitle} />

      {/* Department Selector Bar */}
      <DepartmentBar />

      {/* Main Body Wrapper (Sidebar + Main Content) */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar />

        <main className="main-content" id="main-content" style={{ flex: 1, background: "#f8fafc" }}>
          <div className="page-content">
            {/* Formal Breadcrumb */}
            <div className="gov-breadcrumb">
              {defaultBreadcrumbs.map((b, idx) => (
                <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {idx === 0 ? (
                    <Link href="/dashboard" style={{ color: "#2563eb", fontWeight: 600 }}>🏠 {b}</Link>
                  ) : idx === defaultBreadcrumbs.length - 1 ? (
                    <strong style={{ color: "#0f172a", fontWeight: 800 }}>{b}</strong>
                  ) : (
                    <span style={{ color: "#64748b" }}>{b}</span>
                  )}
                  {idx < defaultBreadcrumbs.length - 1 && <span style={{ color: "#cbd5e1", margin: "0 2px" }}>&gt;</span>}
                </span>
              ))}
            </div>

            {/* Official Notice Banner */}
            <div
              className="gov-notice-banner"
              style={
                isCitizen
                  ? { background: "#f0fdf4", borderColor: "#86efac", color: "#166534" }
                  : {}
              }
            >
              <span style={{ fontSize: 16 }}>{isCitizen ? "🛡️" : "ℹ️"}</span>
              <span>
                {isCitizen ? (
                  <>
                    <strong>DPDP Protected Citizen Portal:</strong> All your personal data exchanges between government departments are strictly governed under your explicit consent (Digital Personal Data Protection Act 2023).
                  </>
                ) : (
                  <>
                    <strong>Official Notice:</strong> Welcome to the Department Officer Portal. All service verifications and data inter-operability requests are monitored under DPDP Act 2023 guidelines.
                  </>
                )}
              </span>
            </div>

            {/* Page Body */}
            {children}
          </div>
        </main>
      </div>

      {/* Formal Government Footer */}
      <Footer />
    </div>
  );
}
