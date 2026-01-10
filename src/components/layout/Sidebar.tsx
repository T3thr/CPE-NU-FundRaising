"use client";
// =============================================================================
// Admin Sidebar Navigation - Professional Layout with Inline Styles
// Follows: src/docs/STANDARD-TailwindCSS.md + CHANGELOG-CriticalFixes_V3.md
// Uses INLINE STYLES ONLY for Tailwind v4 compatibility
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  BarChart3, 
  Settings, 
  Building2, 
  Shield, 
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Home,
  ChevronRight as ChevronRightBreadcrumb,
} from "lucide-react";
import { navigationConfig, appConfig } from "@/config/app.config";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface SidebarProps {
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  cohortName?: string;
  organizationName?: string;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  users: Users,
  "credit-card": CreditCard,
  "check-circle": CheckCircle2,
  chart: BarChart3,
  settings: Settings,
  building: Building2,
  shield: Shield,
  "file-text": FileText,
};

// Breadcrumb label mapping
const breadcrumbLabels: Record<string, string> = {
  "/admin": "ภาพรวม",
  "/admin/members": "สมาชิก",
  "/admin/payments": "การชำระเงิน",
  "/admin/verify": "ตรวจสอบ Slip",
  "/admin/reports": "รายงาน",
  "/admin/organization": "องค์กร",
  "/admin/settings": "ตั้งค่า",
};

// Custom hook for responsive design
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    // Initial check
    checkIsDesktop();
    
    // Listen for resize
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);
  
  return isDesktop;
}

// =============================================================================
// Breadcrumb Component with Inline Styles
// =============================================================================

export function AdminBreadcrumb() {
  const pathname = usePathname();
  
  // Generate breadcrumb items
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];
    
    let currentPath = "";
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = breadcrumbLabels[currentPath] || segment;
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: index === paths.length - 1,
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1.25rem",
        fontSize: "0.875rem",
      }}
    >
      <Link
        href="/admin"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          color: "var(--muted)",
          textDecoration: "none",
          transition: "color 0.2s",
          padding: "0.25rem",
          borderRadius: "6px",
        }}
      >
        <Home style={{ width: "16px", height: "16px" }} />
      </Link>
      
      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.href}>
          <ChevronRightBreadcrumb 
            style={{ 
              width: "14px", 
              height: "14px", 
              color: "var(--muted)",
              opacity: 0.5,
            }} 
          />
          {crumb.isLast ? (
            <span
              style={{
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// =============================================================================
// Desktop Sidebar with Inline Styles
// =============================================================================

export function Sidebar({
  isSuperAdmin = false,
  cohortName = "CPE รุ่นที่ 30",
  organizationName = "วิศวกรรมคอมพิวเตอร์",
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = isSuperAdmin 
    ? navigationConfig.superAdmin 
    : navigationConfig.admin;

  if (!mounted) return null;

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "var(--card)",
        borderRight: "1px solid var(--border)",
        transition: "width 0.3s ease",
        flexShrink: 0,
        width: isCollapsed ? "80px" : "256px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {!isCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div 
              style={{ 
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              <Building2 style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <h1 style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.875rem", margin: 0 }}>
                {appConfig.name}
              </h1>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
                {cohortName}
              </p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div 
            style={{ 
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              margin: "0 auto",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            }}
          >
            <Building2 style={{ width: "20px", height: "20px" }} />
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "transparent",
            color: "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          title={isCollapsed ? "ขยาย" : "ย่อ"}
        >
          {isCollapsed ? (
            <ChevronRight style={{ width: "20px", height: "20px" }} />
          ) : (
            <ChevronLeft style={{ width: "20px", height: "20px" }} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = iconMap[item.icon] || Menu;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "12px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    color: isActive ? "white" : "var(--muted)",
                    background: isActive 
                      ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                      : "transparent",
                    boxShadow: isActive ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                  {!isCollapsed && (
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
<<<<<<< HEAD
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <ThemeToggle />
=======
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between gap-2">
          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
          
          {!isCollapsed && (
            <button 
              style={{
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogOut style={{ width: "20px", height: "20px" }} />
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              borderRadius: "12px",
              backgroundColor: "var(--accent)",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>องค์กร</p>
            <p 
              style={{ 
                fontSize: "0.875rem", 
                fontWeight: 500, 
                color: "var(--foreground)", 
                margin: "4px 0 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {organizationName}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

// =============================================================================
// Mobile Bottom Navigation with Inline Styles
// =============================================================================

export function MobileNav({
  isSuperAdmin = false,
}: {
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navItems = isSuperAdmin 
    ? navigationConfig.superAdmin.slice(0, 5)
    : navigationConfig.admin.slice(0, 5);

  if (!mounted) return null;

  return (
    <nav 
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "var(--card)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-around",
          listStyle: "none",
          margin: 0,
          padding: "0.625rem 0.5rem",
          gap: "0.25rem",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = iconMap[item.icon] || Menu;
          
          return (
            <li key={item.path} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Link
                href={item.path}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  color: isActive ? "#3b82f6" : "var(--muted)",
                  backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  minWidth: "60px",
                }}
              >
                <IconComponent style={{ width: "22px", height: "22px" }} />
                <span 
                  style={{ 
                    fontSize: "0.6875rem", 
                    fontWeight: isActive ? 600 : 500,
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// =============================================================================
// Mobile Header with Inline Styles
// =============================================================================

export function MobileHeader() {
  const pathname = usePathname();
  const currentLabel = breadcrumbLabels[pathname] || "Admin";
  
  return (
    <header 
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        padding: "0.875rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div 
          style={{ 
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          }}
        >
          <Building2 style={{ width: "18px", height: "18px" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.9375rem", margin: 0 }}>
            {appConfig.name}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
            {currentLabel}
          </p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}

// =============================================================================
// Admin Layout Wrapper - MAIN LAYOUT COMPONENT with Inline Styles ONLY
// Uses useIsDesktop hook for responsive behavior (no Tailwind classes)
// Ensures content is CENTERED on desktop with proper padding
// =============================================================================

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useIsDesktop();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      style={{ 
        display: "flex", 
        height: "100vh", 
        overflow: "hidden",
        backgroundColor: "var(--background)",
      }}
    >
      {/* Sidebar - Desktop Only */}
      {isDesktop && (
        <div style={{ flexShrink: 0 }}>
          <Sidebar />
        </div>
      )}

      {/* Main Content Area */}
      <div 
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          minWidth: 0, 
          overflow: "hidden",
        }}
      >
        {/* Mobile Header - visible only on mobile */}
        {!isDesktop && <MobileHeader />}
        
        {/* Scrollable Content - CENTERED with proper padding */}
        <main 
          style={{ 
            flex: 1, 
            overflowY: "auto",
            paddingBottom: isDesktop ? "1.5rem" : "100px", // Space for mobile nav
          }}
        >
          {/* Content Container - CENTERED */}
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: isDesktop ? "1.5rem 2rem" : "1rem",
            }}
          >
            {/* Breadcrumb - Desktop only */}
            {isDesktop && <AdminBreadcrumb />}
            
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav - visible only on mobile */}
      {!isDesktop && <MobileNav />}
    </div>
  );
}
