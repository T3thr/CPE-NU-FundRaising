import React from "react";

export default function Loading() {
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
              backgroundColor: "var(--border)",
              opacity: 0.5,
              animation: "pulse 1.5s ease-in-out infinite",
            }} 
          />
          <div>
            <div style={{ width: "120px", height: "24px", backgroundColor: "var(--border)", borderRadius: "6px", marginBottom: "8px", opacity: 0.5 }} />
            <div style={{ width: "200px", height: "16px", backgroundColor: "var(--border)", borderRadius: "4px", opacity: 0.5 }} />
          </div>
        </div>
        <div style={{ width: "140px", height: "40px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />
      </div>
      
      {/* Stats skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            style={{ 
              backgroundColor: "var(--card)", 
              borderRadius: "16px", 
              border: "1px solid var(--border)",
              padding: "1.25rem",
              height: "140px",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div 
        style={{ 
          backgroundColor: "var(--card)", 
          borderRadius: "16px", 
          border: "1px solid var(--border)",
          padding: "1.25rem",
          height: "200px",
          width: "100%",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
