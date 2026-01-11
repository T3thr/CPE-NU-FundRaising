"use client";
// =============================================================================
// Admin Sidebar Navigation - Professional Layout with Inline Styles
// Follows: src/docs/STANDARD-TailwindCSS.md + CHANGELOG-CriticalFixes_V3.md
// Uses INLINE STYLES ONLY for Tailwind v4 compatibility
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
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

// =============================================================================
// Navigation Groups Configuration
// Organized for better UX on Desktop
// =============================================================================

type NavGroup = {
  title: string;
  items: {
    path: string;
    label: string;
    icon: string;
  }[];
};

const adminNavGroups: NavGroup[] = [
  {
    title: "ภาพรวม",
    items: [
      { path: "/admin", label: "Dashboard", icon: "dashboard" },
    ],
  },
  {
    title: "การจัดการ",
    items: [
      { path: "/admin/members", label: "สมาชิก", icon: "users" },
      { path: "/admin/payments", label: "การชำระเงิน", icon: "credit-card" },
      { path: "/admin/verify", label: "ตรวจสอบ Slip", icon: "check-circle" },
    ],
  },
  {
    title: "ข้อมูลและรายงาน",
    items: [
      { path: "/admin/reports", label: "รายงาน", icon: "chart" },
      { path: "/admin/organization", label: "องค์กร", icon: "building" },
    ],
  },
  {
    title: "ระบบ",
    items: [
      { path: "/admin/settings", label: "ตั้งค่า", icon: "settings" },
    ],
  },
];

// Super Admin also gets the standard admin groups plus specific ones if needed
// For now, we reuse similar structure or custom if required.
// Since the prompt focused on standard admin routes, we'll use logic to select.

export function Sidebar({
  isSuperAdmin: propIsSuperAdmin,
  cohortName = "CPE รุ่นที่ 30",
  organizationName = "วิศวกรรมคอมพิวเตอร์",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Determine super admin from session if not passed as prop
  const isSuperAdmin = propIsSuperAdmin ?? 
    (session?.user && (session.user as { role?: string }).role === "super_admin");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
        width: isCollapsed ? "80px" : "260px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1rem",
          borderBottom: "1px solid var(--border)",
          height: "72px",
        }}
      >
        {!isCollapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
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
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                flexShrink: 0,
              }}
            >
              <Building2 style={{ width: "18px", height: "18px" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ 
                fontWeight: 700, 
                color: "var(--foreground)", 
                fontSize: "0.9375rem", 
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {appConfig.name}
              </h1>
              <p style={{ 
                fontSize: "0.75rem", 
                color: "var(--muted)", 
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {cohortName}
              </p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div 
            style={{ 
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              margin: "0 auto",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            }}
          >
            <Building2 style={{ width: "18px", height: "18px" }} />
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            padding: "6px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isCollapsed ? "transparent" : "var(--accent)", // Subtle background when expanded
            color: "var(--muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            marginLeft: isCollapsed ? "0" : "auto", // Right align when expanded
          }}
          title={isCollapsed ? "ขยาย" : "ย่อ"}
        >
          {isCollapsed ? (
            <ChevronRight style={{ width: "18px", height: "18px" }} />
          ) : (
            <ChevronLeft style={{ width: "18px", height: "18px" }} />
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, padding: "1.25rem 0", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {adminNavGroups.map((group, groupIndex) => (
            <div key={group.title} style={{ padding: "0 0.75rem" }}>
              {/* Group Title - Hide when collapsed */}
              {!isCollapsed && (
                <h3 style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: 600, 
                  color: "var(--muted)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.05em",
                  marginBottom: "0.5rem",
                  paddingLeft: "0.75rem",
                  opacity: 0.8
                }}>
                  {group.title}
                </h3>
              )}
              
              {/* Separator for collapsed mode to distinguish groups */}
              {isCollapsed && groupIndex > 0 && (
                <div style={{ 
                  height: "1px", 
                  backgroundColor: "var(--border)", 
                  margin: "0.5rem 0.75rem 0.5rem 0.75rem", 
                  opacity: 0.5 
                }} />
              )}

              {/* Group Items */}
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                {group.items.map((item) => {
                  // Check active state strictly for dashboard, loosely for others
                  const isActive = item.path === "/admin" 
                    ? pathname === "/admin" 
                    : pathname.startsWith(item.path);
                    
                  const IconComponent = iconMap[item.icon] || Menu;
                  
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: isCollapsed ? "0.75rem" : "0.625rem 0.75rem",
                          justifyContent: isCollapsed ? "center" : "flex-start",
                          borderRadius: "10px",
                          textDecoration: "none",
                          transition: "all 0.2s ease",
                          color: isActive ? "white" : "var(--foreground)",
                          background: isActive 
                            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                            : "transparent",
                          position: "relative",
                          opacity: isActive ? 1 : 0.7,
                        }}
                        // Add hover effect via CSS-in-JS logic fallback or standard CSS class
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = "var(--accent)";
                            e.currentTarget.style.opacity = "1";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.opacity = "0.7";
                          }
                        }}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <IconComponent style={{ width: "20px", height: "20px", flexShrink: 0 }} />
                        {!isCollapsed && (
                          <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{item.label}</span>
                        )}
                        
                        {/* Active Indicator Strip (Optional Design Element) */}
                        {isActive && !isCollapsed && (
                           <div style={{
                             position: "absolute",
                             left: "0",
                             top: "50%",
                             transform: "translateY(-50%)",
                             width: "3px",
                             height: "60%",
                             backgroundColor: "rgba(255,255,255,0.3)",
                             borderRadius: "0 4px 4px 0",
                             display: "none" // Keeping it clean for now
                           }} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* Logout Button - Always visible */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            width: "100%",
            padding: isCollapsed ? "10px" : "0.75rem 1rem",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--accent)",
            color: "var(--muted)",
            cursor: isLoggingOut ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: "0.75rem",
            transition: "all 0.2s",
            opacity: isLoggingOut ? 0.6 : 1,
            marginBottom: "0.75rem",
          }}
          title={isCollapsed ? "ออกจากระบบ" : undefined}
        >
          {isLoggingOut ? (
            <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
          ) : (
            <LogOut style={{ width: "20px", height: "20px" }} />
          )}
          {!isCollapsed && (
            <span style={{ fontWeight: 500 }}>
              {isLoggingOut ? "กำลังออก..." : "ออกจากระบบ"}
            </span>
          )}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start" }}>
          <ThemeToggle />
        </div>
        
        {!isCollapsed && (
          <div
            style={{
              marginTop: "0.75rem",
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

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
  const [showMore, setShowMore] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const allNavItems = isSuperAdmin 
    ? navigationConfig.superAdmin
    : navigationConfig.admin;
  
  // Split nav items: Primary (4 items) + More
  const primaryItems = allNavItems.slice(0, 4);
  const moreItems = allNavItems.slice(4);

  if (!mounted) return null;

  return (
    <>
      {/* More Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 45,
            }}
          />
        )}
      </AnimatePresence>

      {/* More Menu Panel */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              bottom: "70px",
              left: "1rem",
              right: "1rem",
              backgroundColor: "var(--card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              padding: "1rem",
              zIndex: 48,
              boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "0.75rem"
            }}>
              {moreItems.map((item) => {
                const isActive = pathname === item.path;
                const IconComponent = iconMap[item.icon] || Menu;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setShowMore(false)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0.75rem",
                      borderRadius: "12px",
                      textDecoration: "none",
                      backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "var(--accent)",
                      color: isActive ? "#3b82f6" : "var(--muted)",
                      transition: "all 0.2s",
                    }}
                  >
                    <IconComponent style={{ width: "22px", height: "22px" }} />
                    <span style={{ 
                      fontSize: "0.6875rem", 
                      fontWeight: isActive ? 600 : 500,
                      textAlign: "center",
                    }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
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
            padding: "0.5rem 0.25rem",
            gap: "0.25rem",
          }}
        >
          {primaryItems.map((item) => {
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
                    gap: "3px",
                    padding: "0.5rem 0.5rem",
                    borderRadius: "10px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    color: isActive ? "#3b82f6" : "var(--muted)",
                    backgroundColor: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                    minWidth: "56px",
                  }}
                >
                  <IconComponent style={{ width: "20px", height: "20px" }} />
                  <span 
                    style={{ 
                      fontSize: "0.625rem", 
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
          
          {/* More Button */}
          {moreItems.length > 0 && (
            <li style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setShowMore(!showMore)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  padding: "0.5rem 0.5rem",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  color: showMore ? "#3b82f6" : "var(--muted)",
                  backgroundColor: showMore ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  minWidth: "56px",
                }}
              >
                <Menu style={{ width: "20px", height: "20px" }} />
                <span 
                  style={{ 
                    fontSize: "0.625rem", 
                    fontWeight: showMore ? 600 : 500,
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  เพิ่มเติม
                </span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
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
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(10px)",
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
        {/* Scrollable Content - CENTERED with proper padding */}
        <main 
          style={{ 
            flex: 1, 
            overflowY: "auto",
            overflowX: "hidden",
            paddingTop: isDesktop ? 0 : "60px", // Space for mobile fixed header
            paddingBottom: isDesktop ? "1.5rem" : "90px", // Space for mobile nav
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

      {/* Mobile Header - fixed at top */}
      {!isDesktop && <MobileHeader />}

      {/* Mobile Bottom Nav - fixed at bottom */}
      {!isDesktop && <MobileNav />}
    </div>
  );
}
