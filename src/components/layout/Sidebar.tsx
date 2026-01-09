"use client";
// =============================================================================
// Admin Sidebar Navigation - Professional Layout with Lucide Icons
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
  Sun,
  Moon,
  Menu
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

export function Sidebar({
  isSuperAdmin = false,
  cohortName = "CPE รุ่นที่ 32",
  organizationName = "วิศวกรรมคอมพิวเตอร์",
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = isSuperAdmin 
    ? navigationConfig.superAdmin 
    : navigationConfig.admin;

  return (
    <aside
      className={`
        flex flex-col h-screen bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-[var(--foreground)]">{appConfig.name}</h1>
              <p className="text-xs text-[var(--muted)]">{cohortName}</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white mx-auto">
            <Building2 className="w-5 h-5" />
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          title={isCollapsed ? "ขยาย" : "ย่อ"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = iconMap[item.icon] || Menu;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30" 
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between gap-2">
          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
          
          {!isCollapsed && (
            <button className="p-2.5 rounded-xl hover:bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--accent)]">
            <p className="text-xs text-[var(--muted)]">องค์กร</p>
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {organizationName}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

// =============================================================================
// Mobile Bottom Navigation
// =============================================================================

export function MobileNav({
  isSuperAdmin = false,
}: {
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  
  const navItems = isSuperAdmin 
    ? navigationConfig.superAdmin.slice(0, 5)
    : navigationConfig.admin.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] md:hidden safe-area-pb">
      <ul className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = iconMap[item.icon] || Menu;
          
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors
                  ${isActive 
                    ? "text-primary-500" 
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }
                `}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// =============================================================================
// Admin Layout Wrapper
// =============================================================================

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminLayout({
  children,
  title,
  description,
  actions,
}: AdminLayoutProps) {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Header */}
        {(title || actions) && (
          <header 
            className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-6 py-4"
            style={{ 
              backgroundColor: "var(--background)",
              borderColor: "var(--border)"
            }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <MobileNav />
    </div>
  );
}
