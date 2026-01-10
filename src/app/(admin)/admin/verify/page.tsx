// =============================================================================
// Admin Verify Slips Page (Optimized)
// Uses dynamic import for faster initial load
// =============================================================================

import { Metadata } from "next";
import dynamic from "next/dynamic";

// Loading skeleton for verify slips
function VerifySkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "var(--accent)" }} />
          <div>
            <div style={{ width: "140px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", marginBottom: "8px" }} />
            <div style={{ width: "160px", height: "16px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
          </div>
        </div>
        <div style={{ width: "130px", height: "40px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
      </div>
      
      {/* Info banner skeleton */}
      <div 
        style={{ 
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: "12px",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
        }}
      >
        <div style={{ width: "20px", height: "20px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
        <div style={{ flex: 1, height: "16px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
      </div>
      
      {/* Cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            style={{ 
              backgroundColor: "var(--card)", 
              borderRadius: "16px", 
              border: "1px solid var(--border)",
              overflow: "hidden",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <div style={{ width: "100%", height: "180px", backgroundColor: "var(--accent)" }} />
            <div style={{ padding: "1rem" }}>
              <div style={{ width: "120px", height: "18px", backgroundColor: "var(--accent)", borderRadius: "4px", marginBottom: "8px" }} />
              <div style={{ width: "80px", height: "14px", backgroundColor: "var(--accent)", borderRadius: "4px", marginBottom: "12px" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ flex: 1, height: "36px", backgroundColor: "var(--accent)", borderRadius: "8px" }} />
                <div style={{ flex: 1, height: "36px", backgroundColor: "var(--accent)", borderRadius: "8px" }} />
              </div>
            </div>
          </div>
        ))}
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

const VerifySlipsContent = dynamic(
  () => import("./_components/VerifySlipsContent"),
  { 
    loading: () => <VerifySkeleton />,
  }
);

export const metadata: Metadata = {
  title: "ตรวจสอบ Slip",
};

export default function VerifySlipsPage() {
  return <VerifySlipsContent />;
}
