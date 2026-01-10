// =============================================================================
// Admin Members List Page (Optimized)
// Uses dynamic import for faster initial load
// =============================================================================

import { Metadata } from "next";
import dynamic from "next/dynamic";

// Loading skeleton for members list
function MembersSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div 
            style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "14px", 
              backgroundColor: "var(--accent)",
            }} 
          />
          <div>
            <div style={{ width: "140px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", marginBottom: "8px" }} />
            <div style={{ width: "100px", height: "16px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ width: "120px", height: "40px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
          <div style={{ width: "120px", height: "40px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
        </div>
      </div>
      
      {/* Search skeleton */}
      <div 
        style={{ 
          backgroundColor: "var(--card)", 
          borderRadius: "16px", 
          border: "1px solid var(--border)",
          padding: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1, height: "44px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
          <div style={{ width: "150px", height: "44px", backgroundColor: "var(--accent)", borderRadius: "12px" }} />
        </div>
      </div>
      
      {/* Table skeleton */}
      <div 
        style={{ 
          backgroundColor: "var(--card)", 
          borderRadius: "16px", 
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", padding: "1rem", backgroundColor: "var(--accent)", gap: "1rem" }}>
          {[100, 150, 80, 180, 120, 80, 100].map((w, i) => (
            <div key={i} style={{ width: `${w}px`, height: "16px", backgroundColor: "var(--card)", borderRadius: "4px" }} />
          ))}
        </div>
        {/* Data rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div 
            key={row} 
            style={{ 
              display: "flex", 
              padding: "1rem", 
              borderTop: "1px solid var(--border)",
              gap: "1rem",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${row * 0.1}s`,
            }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "9999px", backgroundColor: "var(--accent)" }} />
            {[80, 130, 60, 160, 100, 60, 80].map((w, i) => (
              <div key={i} style={{ width: `${w}px`, height: "16px", backgroundColor: "var(--accent)", borderRadius: "4px" }} />
            ))}
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

// Dynamic import with loading state
const MembersListContent = dynamic(
  () => import("./_components/MembersListContent"),
  { 
    loading: () => <MembersSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "จัดการสมาชิก",
};

export default function MembersPage() {
  return <MembersListContent />;
}
