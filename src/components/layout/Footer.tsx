"use client";

import { appConfig } from "@/config/app.config";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        padding: "40px 0",
        backgroundColor: "var(--card)",
        borderTop: "1px solid var(--border)",
        marginTop: "auto",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
              }}
            >
              <Building2 style={{ width: "18px", height: "18px", color: "white" }} />
            </div>
            <div>
              <span style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.95rem" }}>
                {appConfig.name}
              </span>
              <span 
                style={{ 
                  display: "block", 
                  fontSize: "0.75rem", 
                  color: "var(--muted)",
                  marginTop: "-2px" 
                }}
              >
                สาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร
              </span>
            </div>
          </div>

          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            © {new Date().getFullYear()} CPE Funds Hub. พัฒนาโดยนิสิต CPE
          </p>
        </div>
      </div>
    </footer>
  );
}
