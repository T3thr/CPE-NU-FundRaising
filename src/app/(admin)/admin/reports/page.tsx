// =============================================================================
// Admin Reports Page (Optimized)
// Uses dynamic import for faster initial load
// =============================================================================

import { Metadata } from "next";
import dynamic from "next/dynamic";

// Loading skeleton for reports
function ReportsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "var(--accent)" }} />
          <div>
            <div style={{ width: "100px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", marginBottom: "8px" }} />
            <div style={{ width: "180px", height: "16px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
          </div>
        </div>
        <div style={{ width: "120px", height: "40px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
      </div>
      
      {/* Summary cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            style={{ 
              padding: "1.25rem", 
              borderRadius: "16px", 
              backgroundColor: "var(--accent)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <div style={{ width: "80px", height: "14px", backgroundColor: "var(--card)", borderRadius: "4px", marginBottom: "8px" }} />
            <div style={{ width: "100px", height: "28px", backgroundColor: "var(--card)", borderRadius: "4px" }} />
          </div>
        ))}
      </div>
      
      {/* Tabs skeleton */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: "100px", height: "36px", backgroundColor: "var(--accent)", borderRadius: "8px" }} />
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div 
        style={{ 
          backgroundColor: "var(--card)", 
          borderRadius: "16px", 
          border: "1px solid var(--border)",
          padding: "1.5rem",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", height: "200px" }}>
          {Array(12).fill(0).map((_, i) => (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                height: `${30 + Math.random() * 70}%`, 
                backgroundColor: "var(--accent)", 
                borderRadius: "4px 4px 0 0" 
              }} 
            />
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

const ReportsContent = dynamic(
  () => import("./_components/ReportsContent"),
  { 
    loading: () => <ReportsSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "รายงาน",
};

export default function ReportsPage() {
  return <ReportsContent />;
}
