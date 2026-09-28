"use client";
import { useDepartmentStore, DEPARTMENTS, type DepartmentCode } from "@/store/departmentStore";

export function DepartmentBar() {
  const { activeDepartment, setActiveDepartment } = useDepartmentStore();

  const deptList: DepartmentCode[] = ["ALL", "UIDAI", "CBDT", "ECI", "MSRTC", "EDU", "SKILL", "ULB"];

  return (
    <div
      style={{
        background: "#f0f4f8",
        borderBottom: "1px solid #cccccc",
        padding: "6px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: "#003366", textTransform: "uppercase", letterSpacing: "0.04em", marginRight: 4 }}>
        Department Section:
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {deptList.map((code) => {
          const dept = DEPARTMENTS[code];
          const isActive = activeDepartment === code;

          return (
            <button
              key={code}
              onClick={() => setActiveDepartment(code)}
              style={{
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: isActive ? 800 : 600,
                background: isActive ? "#003366" : "#ffffff",
                color: isActive ? "#ffffff" : "#333333",
                border: `1px solid ${isActive ? "#002147" : "#cccccc"}`,
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {dept.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
