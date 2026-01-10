"use client";
// =============================================================================
// Breadcrumb Component - Professional Styling with Inline Styles
// Follows: src/docs/STANDARD-TailwindCSS.md + CHANGELOG-CriticalFixes_V3.md
// Uses INLINE STYLES for Tailwind v4 compatibility
// =============================================================================

import { useBreadcrumb } from "@refinedev/core";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

// Breadcrumb container styles
const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 0",
  fontSize: "0.875rem",
  flexWrap: "wrap",
};

// Link styles
const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  color: "var(--muted)",
  textDecoration: "none",
  transition: "color 0.2s",
  padding: "0.25rem 0.5rem",
  borderRadius: "6px",
};

// Active/Current item styles
const activeStyle: React.CSSProperties = {
  fontWeight: 500,
  color: "var(--foreground)",
  padding: "0.25rem 0.5rem",
};

// Separator styles
const separatorStyle: React.CSSProperties = {
  width: "14px",
  height: "14px",
  color: "var(--muted)",
  opacity: 0.5,
};

export const Breadcrumb = () => {
  const { breadcrumbs } = useBreadcrumb();

  // Don't render if there's only one item
  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol style={containerStyle}>
        {/* Home icon */}
        <li>
          <Link href="/admin" style={linkStyle}>
            <Home style={{ width: "16px", height: "16px" }} />
          </Link>
        </li>
        
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li
              key={`breadcrumb-${breadcrumb.label}`}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <ChevronRight style={separatorStyle} />
              
              {breadcrumb.href && !isLast ? (
                <Link href={breadcrumb.href} style={linkStyle}>
                  {breadcrumb.label}
                </Link>
              ) : (
                <span style={activeStyle}>{breadcrumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// =============================================================================
// Alternative Simple Breadcrumb (without Refine hook)
// Use this if you need a standalone breadcrumb
// =============================================================================

interface SimpleBreadcrumbItem {
  label: string;
  href?: string;
}

interface SimpleBreadcrumbProps {
  items: SimpleBreadcrumbItem[];
}

export const SimpleBreadcrumb = ({ items }: SimpleBreadcrumbProps) => {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: "1rem" }}>
      <ol style={containerStyle}>
        {/* Home icon */}
        <li>
          <Link href="/admin" style={linkStyle}>
            <Home style={{ width: "16px", height: "16px" }} />
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li
              key={`simple-breadcrumb-${index}`}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <ChevronRight style={separatorStyle} />
              
              {item.href && !isLast ? (
                <Link href={item.href} style={linkStyle}>
                  {item.label}
                </Link>
              ) : (
                <span style={activeStyle}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
