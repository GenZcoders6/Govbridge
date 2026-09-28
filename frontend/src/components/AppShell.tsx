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

  // Generate default breadcrumb if not provided
  const defaultBreadcrumbs = breadcrumb || [
    "Home",
    "Department Officer",
    title,
  ];

  return (
    <div className="gov-app-shell">
      {/* Formal Header with Top Utility Bar, Identity Header, and Horizontal Nav */}
      <Header title={title} subtitle={subtitle} />

      {/* Department Selector Bar */}
      <DepartmentBar />

      {/* Main Body Wrapper (Sidebar + Main Content) */}
      <div className="gov-body-wrapper">
        <Sidebar />

        <main className="gov-main-content" id="main-content">
          {/* Formal Breadcrumb */}
          <div className="gov-breadcrumb">
            {defaultBreadcrumbs.map((b, idx) => (
              <span key={idx}>
                {idx === 0 ? (
                  <Link href="/dashboard">{b}</Link>
                ) : idx === defaultBreadcrumbs.length - 1 ? (
                  <strong style={{ color: "#003366" }}>{b}</strong>
                ) : (
                  <span>{b}</span>
                )}
                {idx < defaultBreadcrumbs.length - 1 && <span className="sep">&gt;</span>}
              </span>
            ))}
          </div>

          {/* Official Notice Banner */}
          <div className="gov-notice-banner">
            <span>ℹ️</span>
            <span>
              <strong>Official Notice:</strong> Welcome to the Department Officer Portal. All service verifications and data inter-operability requests are monitored under DPDP Act 2023 guidelines.
            </span>
          </div>

          {/* Page Title & Body */}
          <div>{children}</div>
        </main>
      </div>

      {/* Formal Government Footer */}
      <Footer />
    </div>
  );
}
