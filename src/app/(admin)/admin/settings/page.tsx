// =============================================================================
// Admin Settings Page (Optimized)
// Uses dynamic import for faster initial load
// =============================================================================

import { Metadata } from "next";
import dynamic from "next/dynamic";

// Loading skeleton for settings
function SettingsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "var(--accent)" }} />
          <div>
            <div style={{ width: "120px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", marginBottom: "8px" }} />
            <div style={{ width: "160px", height: "16px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
          </div>
        </div>
        <div style={{ width: "120px", height: "40px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
      </div>
      
      {/* Service status cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
        {[1, 2].map((i) => (
          <div 
            key={i}
            style={{ 
              backgroundColor: "var(--card)", 
              borderRadius: "16px", 
              border: "1px solid var(--border)",
              padding: "1.5rem",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "48px", height: "48px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
                <div>
                  <div style={{ width: "100px", height: "18px", backgroundColor: "var(--accent)", borderRadius: "4px", marginBottom: "6px" }} />
                  <div style={{ width: "140px", height: "14px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
                </div>
              </div>
              <div style={{ width: "80px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "9999px" }} />
            </div>
            <div style={{ width: "100%", height: "8px", backgroundColor: "var(--accent)", borderRadius: "9999px" }} />
          </div>
        ))}
      </div>
      
      {/* Form skeleton */}
      <div 
        style={{ 
          backgroundColor: "var(--card)", 
          borderRadius: "16px", 
          border: "1px solid var(--border)",
          padding: "1.5rem",
        }}
      >
        <div style={{ width: "180px", height: "20px", backgroundColor: "var(--accent)", borderRadius: "4px", marginBottom: "1.5rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div style={{ width: "120px", height: "14px", backgroundColor: "var(--accent)", borderRadius: "4px", marginBottom: "8px" }} />
              <div style={{ width: "100%", height: "44px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const SettingsContent = dynamic(
  () => import("./_components/SettingsContent"),
  { 
    loading: () => <SettingsSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "ตั้งค่าระบบ",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
