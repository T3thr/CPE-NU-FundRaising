// =============================================================================
// Admin Payments Page (Optimized)
// Uses dynamic import for faster initial load
// =============================================================================

import { Metadata } from "next";
import dynamic from "next/dynamic";

// Loading skeleton for payments
function PaymentsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "var(--accent)" }} />
          <div>
            <div style={{ width: "160px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", marginBottom: "8px" }} />
            <div style={{ width: "120px", height: "16px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
          </div>
        </div>
      </div>
      
      {/* Stats cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            style={{ 
              backgroundColor: "var(--card)", 
              borderRadius: "16px", 
              border: "1px solid var(--border)",
              padding: "1.25rem",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <div style={{ width: "40px", height: "40px", backgroundColor: "var(--accent)", borderRadius: "10px", marginBottom: "1rem" }} />
            <div style={{ width: "40px", height: "28px", backgroundColor: "var(--accent)", borderRadius: "6px", marginBottom: "8px" }} />
            <div style={{ width: "80px", height: "14px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
          </div>
        ))}
      </div>
      
      {/* Table skeleton */}
      <div 
        style={{ 
          backgroundColor: "var(--card)", 
          borderRadius: "16px", 
          border: "1px solid var(--border)",
          padding: "1rem",
          overflowX: "auto",
        }}
      >
        <div style={{ minWidth: "800px" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {[80, ...Array(12).fill(40)].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: "20px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 0", borderTop: "1px solid var(--border)" }}>
              {[80, ...Array(12).fill(40)].map((w, i) => (
                <div key={i} style={{ width: `${w}px`, height: "24px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
              ))}
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

const PaymentsContent = dynamic(
  () => import("./_components/PaymentsContent"),
  { 
    loading: () => <PaymentsSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "ตารางการชำระเงิน",
};

export default function PaymentsPage() {
  return <PaymentsContent />;
}
