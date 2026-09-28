"use client";
import { useDepartmentStore, DEPARTMENTS, type DepartmentCode } from "@/store/departmentStore";

export function DepartmentBar() {
  const { activeDepartment, setActiveDepartment } = useDepartmentStore();

  const deptList: DepartmentCode[] = ["ALL", "UIDAI", "CBDT", "ECI", "MSRTC", "EDU", "SKILL", "ULB"];

  return (
    <div
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13 }}>🏛️</span> Department Switcher:
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {deptList.map((code) => {
          const dept = DEPARTMENTS[code];
          const isActive = activeDepartment === code;

          return (
            <button
              key={code}
              onClick={() => setActiveDepartment(code)}
              style={{
                padding: "6px 14px",
                fontSize: 11.5,
                fontWeight: isActive ? 800 : 600,
                background: isActive ? "linear-gradient(135deg, #1e40af 0%, #0369a1 100%)" : "#f8fafc",
                color: isActive ? "#ffffff" : "#475569",
                border: isActive ? "1px solid #1d4ed8" : "1px solid #e2e8f0",
                borderRadius: 20,
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isActive ? "0 2px 8px rgba(30, 64, 175, 0.25)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{dept.sealEmoji}</span>
              <span>{dept.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
