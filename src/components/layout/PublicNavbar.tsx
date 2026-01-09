"use client";
// =============================================================================
// Public Navbar Component - Professional Standard
// CPE Funds Hub - มหาวิทยาลัยนเรศวร
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CreditCard,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { appConfig } from "@/config/app.config";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

const publicNavItems: NavItem[] = [
  { label: "ชำระเงิน", href: "/pay", icon: CreditCard },
  { label: "เช็คสถานะ", href: "/status", icon: Search },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

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

  const isActive = (href: string) => pathname === href;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: isScrolled
          ? "rgba(var(--card-rgb, 255, 255, 255), 0.95)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        borderBottom: isScrolled ? "1px solid var(--border)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <nav
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
            }}
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
                }}
              >
                {appConfig.name}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginTop: "-2px",
                }}
              >
                Naresuan University
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            className="hidden-mobile"
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

            {/* Divider */}
            <div
              style={{
                width: "1px",
                height: "24px",
                backgroundColor: "var(--border)",
                margin: "0 0.5rem",
              }}
            />

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{
                  padding: "0.625rem",
                  borderRadius: "10px",
                  backgroundColor: "var(--accent)",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun style={{ width: "18px", height: "18px" }} />
                ) : (
                  <Moon style={{ width: "18px", height: "18px" }} />
                )}
              </button>
            )}

            {/* Login Button */}
            <Link
              href="/login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                color: "white",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                transition: "all 0.2s",
              }}
            >
              <LogIn style={{ width: "18px", height: "18px" }} />
              เข้าสู่ระบบ
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              backgroundColor: "var(--accent)",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground)",
              display: "none",
            }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X style={{ width: "24px", height: "24px" }} />
            ) : (
              <Menu style={{ width: "24px", height: "24px" }} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                overflow: "hidden",
                borderTop: "1px solid var(--border)",
              }}
              className="show-mobile"
            >
              <div style={{ padding: "1rem 0" }}>
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
                        gap: "0.75rem",
                        padding: "0.875rem 1rem",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        color: active ? "#3b82f6" : "var(--foreground)",
                        backgroundColor: active ? "rgba(59, 130, 246, 0.1)" : "transparent",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {Icon && <Icon style={{ width: "20px", height: "20px" }} />}
                      {item.label}
                    </Link>
                  );
                })}

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "var(--border)",
                    margin: "0.75rem 0",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 1rem",
                  }}
                >
                  {mounted && (
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.625rem 1rem",
                        borderRadius: "10px",
                        backgroundColor: "var(--accent)",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--foreground)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun style={{ width: "18px", height: "18px" }} />
                          Light
                        </>
                      ) : (
                        <>
                          <Moon style={{ width: "18px", height: "18px" }} />
                          Dark
                        </>
                      )}
                    </button>
                  )}

                  <Link
                    href="/login"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      color: "white",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    }}
                  >
                    <LogIn style={{ width: "18px", height: "18px" }} />
                    เข้าสู่ระบบ
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <style jsx global>{`
        @media (min-width: 768px) {
          .hidden-mobile {
            display: flex !important;
          }
          .show-mobile {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .hidden-mobile {
            display: none !important;
          }
          .show-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}

export default PublicNavbar;
