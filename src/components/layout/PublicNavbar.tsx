"use client";
// =============================================================================
// Public Navbar Component - Auth-Aware Version
// CPE Funds Hub - Private Web (All users are authenticated)
// Based on: src/docs/STANDARD-Security.md
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CreditCard,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { appConfig } from "@/config/app.config";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  desc: string;
}

const publicNavItems: NavItem[] = [
  { 
    label: "ชำระเงิน", 
    href: "/pay", 
    icon: CreditCard,
    desc: "ชำระเงินค่ากิจกรรมและอื่นๆ"
  },
  { 
    label: "เช็คสถานะ", 
    href: "/status", 
    icon: Search,
    desc: "ตรวจสอบสถานะการชำระเงิน"
  },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if user is super_admin
  const isSuperAdmin = session?.user && (session.user as { role?: string }).role === "super_admin";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => pathname === href;

  // Handle logout
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

  // Don't render until session is loaded
  if (status === "loading") {
    return (
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "72px",
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      />
    );
  }

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: isScrolled
            ? "color-mix(in srgb, var(--card), transparent 5%)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? "1px solid var(--border)" : "1px solid transparent",
          transition: "all 0.3s ease",
          height: "72px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo Section */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              zIndex: 51,
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                flexShrink: 0,
              }}
            >
              <Building2 style={{ width: "22px", height: "22px", color: "white" }} />
            </div>
            <div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1.125rem",
                  color: "var(--foreground)",
                  lineHeight: 1.2,
                  display: "block",
                }}
              >
                {appConfig.name}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginTop: "2px",
                }}
              >
                Naresuan University
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div
            className="hidden-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1rem",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    color: active ? "#3b82f6" : "var(--foreground)",
                    backgroundColor: active ? "rgba(59, 130, 246, 0.1)" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {Icon && <Icon style={{ width: "18px", height: "18px" }} />}
                  {item.label}
                </Link>
              );
            })}

            {/* Admin Link - Only for Super Admin */}
            {isSuperAdmin && (
              <Link
                href="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: pathname.startsWith("/admin") ? "#f59e0b" : "#f59e0b",
                  backgroundColor: pathname.startsWith("/admin") ? "rgba(245, 158, 11, 0.1)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <ShieldCheck style={{ width: "18px", height: "18px" }} />
                Admin
              </Link>
            )}

            <div
              style={{
                width: "1px",
                height: "24px",
                backgroundColor: "var(--border)",
                margin: "0 0.5rem",
              }}
            />

            <ThemeToggle />

            {/* User Info & Logout */}
            {session?.user && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginLeft: "0.5rem",
                }}
              >
                {/* User Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "10px",
                    backgroundColor: "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      backgroundColor: isSuperAdmin ? "#f59e0b" : "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSuperAdmin ? (
                      <ShieldCheck style={{ width: "16px", height: "16px", color: "white" }} />
                    ) : (
                      <User style={{ width: "16px", height: "16px", color: "white" }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)" }}>
                      {session.user.name || "User"}
                    </div>
                    <div style={{ fontSize: "0.625rem", color: "var(--muted)" }}>
                      {isSuperAdmin ? "เหรัญญิก" : "สมาชิก"}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1rem",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--muted)",
                    cursor: isLoggingOut ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    opacity: isLoggingOut ? 0.6 : 1,
                  }}
                >
                  <LogOut style={{ width: "16px", height: "16px" }} />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="show-mobile" style={{ display: "none", alignItems: "center", gap: "0.75rem" }}>
            <ThemeToggle />
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                padding: "0",
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                cursor: "pointer",
                color: "var(--foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 51,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X style={{ width: "22px", height: "22px" }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu style={{ width: "22px", height: "22px" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(4px)",
                zIndex: 40,
              }}
              className="show-mobile"
            />
            
            {/* Dropdown Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95, translateX: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, translateX: "-50%" }}
              exit={{ opacity: 0, y: -10, scale: 0.95, translateX: "-50%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: "85px",
                left: "50%",
                width: "calc(100% - 2rem)",
                maxWidth: "380px",
                backgroundColor: "var(--card)",
                borderRadius: "24px",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
                zIndex: 41,
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
              className="show-mobile"
            >
              {/* User Info Card */}
              {session?.user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem",
                    borderRadius: "16px",
                    backgroundColor: "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: isSuperAdmin ? "#f59e0b" : "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSuperAdmin ? (
                      <ShieldCheck style={{ width: "20px", height: "20px", color: "white" }} />
                    ) : (
                      <User style={{ width: "20px", height: "20px", color: "white" }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.9rem" }}>
                      {session.user.name || "User"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {isSuperAdmin ? "เหรัญญิก (Super Admin)" : "สมาชิกสาขา"}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Items */}
              {publicNavItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <motion.div 
                    key={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    style={{ width: "100%" }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "48px 1fr 48px", 
                        alignItems: "center",
                        width: "100%",
                        padding: "1rem 0.5rem",
                        borderRadius: "16px",
                        textDecoration: "none",
                        backgroundColor: active ? "rgba(59, 130, 246, 0.08)" : "var(--surface-secondary)",
                        border: active 
                          ? "1.5px solid rgba(59, 130, 246, 0.25)" 
                          : "1.5px solid transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div 
                        style={{ 
                          width: "40px", 
                          height: "40px", 
                          margin: "0 auto",
                          borderRadius: "10px", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          background: active 
                            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                            : "rgba(59, 130, 246, 0.1)",
                          color: active ? "white" : "#3b82f6",
                        }}
                      >
                        {Icon && <Icon style={{ width: "20px", height: "20px" }} />}
                      </div>

                      <div style={{ textAlign: "center", padding: "0 4px" }}>
                        <div 
                          style={{ 
                            fontWeight: 700, 
                            fontSize: "1rem",
                            color: active ? "#3b82f6" : "var(--foreground)",
                            marginBottom: "0.125rem",
                          }}
                        >
                          {item.label}
                        </div>
                        <div 
                          style={{ 
                            fontSize: "0.75rem", 
                            color: "var(--muted)",
                            fontWeight: 400,
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>

                      <div 
                        style={{ 
                          width: "40px", 
                          height: "40px", 
                          margin: "0 auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: active ? "#3b82f6" : "var(--muted)",
                          opacity: active ? 1 : 0.5,
                        }}
                      >
                        <ChevronRight style={{ width: "18px", height: "18px" }} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Admin Link - Only for Super Admin */}
              {isSuperAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ width: "100%" }}
                >
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.625rem",
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "16px",
                      fontSize: "0.9375rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      color: "white",
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                      border: "none",
                    }}
                  >
                    <ShieldCheck style={{ width: "20px", height: "20px" }} />
                    เข้าสู่ Admin Panel
                  </Link>
                </motion.div>
              )}

              {/* Divider */}
              <div style={{ 
                height: "1px", 
                backgroundColor: "var(--border)", 
                width: "100%",
                opacity: 0.6,
                margin: "0.25rem 0"
              }} />

              {/* Logout Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ width: "100%" }}
              >
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.625rem",
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "16px",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    cursor: isLoggingOut ? "not-allowed" : "pointer",
                    opacity: isLoggingOut ? 0.6 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <LogOut style={{ width: "20px", height: "20px" }} />
                  {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default PublicNavbar;