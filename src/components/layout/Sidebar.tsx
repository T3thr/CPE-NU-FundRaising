"use client";
// =============================================================================
// Admin Sidebar Navigation
// =============================================================================

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig, appConfig } from "@/config/app.config";
import { ThemeToggle } from "@/providers/theme-provider";

interface SidebarProps {
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  cohortName?: string;
  organizationName?: string;
}

export function Sidebar({
  isAdmin = false,
  isSuperAdmin = false,
  cohortName = "CPE รุ่นที่ 30",
  organizationName = "วิศวกรรมคอมพิวเตอร์",
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = isSuperAdmin 
    ? navigationConfig.superAdmin 
    : navigationConfig.admin;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
      case "users":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "credit-card":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "check-circle":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "chart":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "settings":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "building":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "shield":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "file-text":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
    }
  };

  return (
    <aside
      className={`
        flex flex-col h-screen bg-card border-r border-border transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
              💰
            </div>
            <div>
              <h1 className="font-bold text-foreground">{appConfig.name}</h1>
              <p className="text-xs text-muted">{cohortName}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn-ghost btn-icon"
          title={isCollapsed ? "ขยาย" : "ย่อ"}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${isActive 
                      ? "bg-primary-500 text-white shadow-md" 
                      : "text-muted hover:text-foreground hover:bg-muted/10"
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  {getIcon(item.icon)}
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
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          
          {!isCollapsed && (
            <button className="btn-ghost btn-icon text-muted hover:text-foreground">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-lg bg-muted/5">
            <p className="text-xs text-muted">องค์กร</p>
            <p className="text-sm font-medium text-foreground truncate">
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
  isAdmin = false,
  isSuperAdmin = false,
}: {
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  
  const navItems = isSuperAdmin 
    ? navigationConfig.superAdmin.slice(0, 5)
    : navigationConfig.admin.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <ul className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? "text-primary-500" 
                    : "text-muted hover:text-foreground"
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Header */}
        {(title || actions) && (
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
                {description && (
                  <p className="text-sm text-muted mt-1">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>

      {/* Mobile Nav */}
      <MobileNav />
    </div>
  );
}
