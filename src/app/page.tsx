"use client";
// =============================================================================
// Homepage - CPE Funds Hub
// Professional Landing Page - University Standard
// =============================================================================

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Building2,
  CreditCard,
  Search,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  QrCode,
  Clock,
  Users,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";
import { appConfig } from "@/config/app.config";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

// Step data
const paymentSteps = [
  {
    step: 1,
    title: "กรอกรหัสนิสิต",
    description: "ใส่รหัสนิสิต 8 หลักของคุณเพื่อเริ่มต้น",
    icon: Users,
  },
  {
    step: 2,
    title: "เลือกเดือนที่ต้องการชำระ",
    description: "เลือกเดือนที่ต้องการจ่าย สามารถเลือกหลายเดือนได้",
    icon: CreditCard,
  },
  {
    step: 3,
    title: "สแกน QR เพื่อโอนเงิน",
    description: "สแกน QR PromptPay ผ่านแอปธนาคาร",
    icon: QrCode,
  },
  {
    step: 4,
    title: "ระบบตรวจสอบอัตโนมัติ",
    description: "ระบบจะตรวจสอบและยืนยันการโอนให้อัตโนมัติ ไม่ต้องอัพโหลดสลิป",
    icon: CheckCircle2,
  },
];

// Features
const features = [
  {
    title: "ไม่ต้องอัพโหลดสลิป",
    description: "ระบบตรวจจับการโอนเงินอัตโนมัติผ่าน EasySlip API",
    icon: Zap,
    color: "#3b82f6",
  },
  {
    title: "ปลอดภัย",
    description: "ข้อมูลถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย",
    icon: Shield,
    color: "#22c55e",
  },
  {
    title: "รวดเร็ว",
    description: "ยืนยันการชำระภายใน 1-5 นาที",
    icon: Clock,
    color: "#f59e0b",
  },
  {
    title: "แจ้งเตือนอัตโนมัติ",
    description: "รับแจ้งเตือนผ่าน LINE เมื่อมีการเปลี่ยนแปลง",
    icon: Smartphone,
    color: "#8b5cf6",
  },
];

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Navbar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "rgba(var(--card-rgb, 255, 255, 255), 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <nav
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1.5rem",
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
            </div>

            {/* Nav Items */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link
                href="/pay"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: "var(--foreground)",
                  backgroundColor: "transparent",
                  transition: "all 0.2s",
                }}
              >
                <CreditCard style={{ width: "18px", height: "18px" }} />
                ชำระเงิน
              </Link>

              <Link
                href="/status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: "var(--foreground)",
                  backgroundColor: "transparent",
                  transition: "all 0.2s",
                }}
              >
                <Search style={{ width: "18px", height: "18px" }} />
                เช็คสถานะ
              </Link>

              <div
                style={{
                  width: "1px",
                  height: "24px",
                  backgroundColor: "var(--border)",
                  margin: "0 0.25rem",
                }}
              />

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
                }}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun style={{ width: "18px", height: "18px" }} />
                ) : (
                  <Moon style={{ width: "18px", height: "18px" }} />
                )}
              </button>

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
                }}
              >
                <LogIn style={{ width: "18px", height: "18px" }} />
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          paddingTop: "140px",
          paddingBottom: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "150%",
            height: "100%",
            background: "radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", position: "relative" }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}
          >
            <motion.div variants={fadeInUp} style={{ marginBottom: "1.5rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#3b82f6",
                }}
              >
                <Zap style={{ width: "16px", height: "16px" }} />
                ระบบอัตโนมัติ - ไม่ต้องอัพโหลดสลิป
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              ระบบบริหารจัดการ
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                เงินกองกลางสาขา CPE
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              style={{
                fontSize: "1.125rem",
                color: "var(--muted)",
                marginBottom: "2.5rem",
                maxWidth: "600px",
                margin: "0 auto 2.5rem",
                lineHeight: 1.7,
              }}
            >
              ชำระเงินง่าย สะดวก ปลอดภัย ด้วยระบบตรวจสอบอัตโนมัติ
              <br />
              สำหรับนิสิตสาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร
            </motion.p>

            <motion.div
              variants={fadeInUp}
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <Link
                href="/pay"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem 2rem",
                  borderRadius: "14px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "white",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.2s",
                }}
              >
                <CreditCard style={{ width: "20px", height: "20px" }} />
                ชำระเงินเลย
                <ArrowRight style={{ width: "18px", height: "18px" }} />
              </Link>

              <Link
                href="/status"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem 2rem",
                  borderRadius: "14px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "var(--foreground)",
                  backgroundColor: "var(--card)",
                  border: "2px solid var(--border)",
                  transition: "all 0.2s",
                }}
              >
                <Search style={{ width: "20px", height: "20px" }} />
                ตรวจสอบสถานะ
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "80px 0", backgroundColor: "var(--accent)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} style={{ textAlign: "center", marginBottom: "4rem" }}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  marginBottom: "1rem",
                }}
              >
                ขั้นตอนการชำระเงิน
              </h2>
              <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "0 auto" }}>
                ง่ายเพียง 4 ขั้นตอน ไม่ต้องอัพโหลดสลิป ระบบตรวจสอบให้อัตโนมัติ
              </p>
            </motion.div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {paymentSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    variants={scaleIn}
                    style={{
                      backgroundColor: "var(--card)",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      padding: "1.5rem",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "1.5rem",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                      }}
                    >
                      {item.step}
                    </div>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <Icon style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
                    </div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} style={{ textAlign: "center", marginBottom: "4rem" }}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  marginBottom: "1rem",
                }}
              >
                ทำไมต้องใช้ระบบนี้
              </h2>
              <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "0 auto" }}>
                ระบบออกแบบมาเพื่อความสะดวกและโปร่งใสสูงสุด
              </p>
            </motion.div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={scaleIn}
                    style={{
                      backgroundColor: "var(--card)",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      padding: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        backgroundColor: `${feature.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <Icon style={{ width: "24px", height: "24px", color: feature.color }} />
                    </div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        color: "var(--foreground)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "80px 0",
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem", textAlign: "center" }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "white", marginBottom: "1rem" }}>
              พร้อมชำระเงินแล้วหรือยัง?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "1.125rem" }}>
              เริ่มต้นง่ายๆ ด้วยการกรอกรหัสนิสิตของคุณ
            </p>
            <Link
              href="/pay"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 2.5rem",
                borderRadius: "14px",
                fontSize: "1.125rem",
                fontWeight: 600,
                textDecoration: "none",
                color: "#1e3a8a",
                backgroundColor: "white",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                transition: "all 0.2s",
              }}
            >
              <CreditCard style={{ width: "22px", height: "22px" }} />
              ชำระเงินเลย
              <ArrowRight style={{ width: "20px", height: "20px" }} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 0",
          backgroundColor: "var(--card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 style={{ width: "18px", height: "18px", color: "white" }} />
              </div>
              <div>
                <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{appConfig.name}</span>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)" }}>
                  สาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              © {new Date().getFullYear()} CPE Funds Hub. พัฒนาด้วย ❤️ โดยนิสิต CPE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
