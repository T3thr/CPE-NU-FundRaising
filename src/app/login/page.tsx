"use client";
// =============================================================================
// Professional Login Page - CPE Funds Hub
// Standard SaaS-level Authentication UI
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useLogin } from "@refinedev/core";
import { appConfig } from "@/config/app.config";
import { ThemeToggle } from "@/components/common/ThemeToggle";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Demo credentials for testing
const DEMO_CREDENTIALS = {
  email: "demo@cpe.nu.ac.th",
  password: "CPEFunds2026!",
};

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: login } = useLogin();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // For demo: Check if using demo credentials
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Simulate successful login
        await new Promise(r => setTimeout(r, 1000));
        router.push("/admin");
        return;
      }

      // Use Refine's login
      login(
        { email, password },
        {
          onSuccess: () => {
            router.push("/admin");
          },
          onError: (error) => {
            setError(error?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          },
        }
      );
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "var(--background)",
      }}
    >
      {/* Left Side - Branding */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden-mobile"
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: "center",
            color: "white",
            position: "relative",
            zIndex: 1,
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 2rem",
              borderRadius: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 style={{ width: "40px", height: "40px" }} />
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            {appConfig.name}
          </h1>
          <p style={{ fontSize: "1rem", opacity: 0.9, marginBottom: "2rem" }}>
            ระบบบริหารจัดการเงินกองกลาง
            <br />
            สาขาวิศวกรรมคอมพิวเตอร์
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              textAlign: "left",
              padding: "1.5rem",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Shield style={{ width: "20px", height: "20px", opacity: 0.9 }} />
              <span style={{ fontSize: "0.875rem" }}>ระบบรักษาความปลอดภัยระดับสูง</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <CheckCircle2 style={{ width: "20px", height: "20px", opacity: 0.9 }} />
              <span style={{ fontSize: "0.875rem" }}>ตรวจสอบสลิปอัตโนมัติด้วย EasySlip</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Info style={{ width: "20px", height: "20px", opacity: 0.9 }} />
              <span style={{ fontSize: "0.875rem" }}>แจ้งเตือนผ่าน LINE Messaging API</span>
            </div>
          </div>

          <p style={{ marginTop: "2rem", fontSize: "0.875rem", opacity: 0.7 }}>
            คณะวิศวกรรมศาสตร์ มหาวิทยาลัยนเรศวร
          </p>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          minWidth: "320px",
          maxWidth: "100%",
        }}
      >
        {/* Theme Toggle */}
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
          }}
        >
          <ThemeToggle />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          {/* Mobile Logo */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
            }}
            className="show-mobile"
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 1rem",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 style={{ width: "28px", height: "28px", color: "white" }} />
            </div>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--foreground)",
              }}
            >
              {appConfig.name}
            </h1>
          </div>

          {/* Login Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--foreground)",
                marginBottom: "0.5rem",
              }}
            >
              เข้าสู่ระบบ
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              สำหรับผู้ดูแลระบบและเหรัญญิก
            </p>
          </div>

          {/* Demo Credentials Notice */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <Info style={{ width: "20px", height: "20px", color: "#3b82f6", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Demo Mode
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                  ใช้ข้อมูลด้านล่างเพื่อทดสอบระบบ
                </p>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "1px solid #3b82f6",
                    backgroundColor: "transparent",
                    color: "#3b82f6",
                    cursor: "pointer",
                  }}
                >
                  กรอกข้อมูลทดสอบ
                </button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <AlertCircle style={{ width: "20px", height: "20px", color: "#ef4444", flexShrink: 0 }} />
              <p style={{ fontSize: "0.875rem", color: "#ef4444" }}>{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                อีเมล
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                    color: "var(--muted)",
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@cpe.nu.ac.th"
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem 0.875rem 3rem",
                    fontSize: "0.9rem",
                    border: "2px solid var(--border)",
                    borderRadius: "12px",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                รหัสผ่าน
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                    color: "var(--muted)",
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 3rem 0.875rem 3rem",
                    fontSize: "0.9rem",
                    border: "2px solid var(--border)",
                    borderRadius: "12px",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: "4px",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: "20px", height: "20px" }} />
                  ) : (
                    <Eye style={{ width: "20px", height: "20px" }} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: "12px",
                border: "none",
                background: isLoading
                  ? "var(--accent)"
                  : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                color: isLoading ? "var(--muted)" : "white",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: isLoading ? "none" : "0 4px 12px rgba(59, 130, 246, 0.3)",
                transition: "all 0.2s",
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      border: "2px solid var(--muted)",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <LogIn style={{ width: "20px", height: "20px" }} />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
              ต้องการเข้าถึงหน้าสาธารณะ?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <Link
                href="/pay"
                style={{
                  fontSize: "0.875rem",
                  color: "#3b82f6",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                ชำระเงิน
              </Link>
              <span style={{ color: "var(--border)" }}>|</span>
              <Link
                href="/status"
                style={{
                  fontSize: "0.875rem",
                  color: "#3b82f6",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                เช็คสถานะ
              </Link>
            </div>
          </div>

          {/* Security Badge */}
          <div
            style={{
              marginTop: "2rem",
              padding: "0.75rem",
              backgroundColor: "var(--accent)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Shield style={{ width: "16px", height: "16px", color: "var(--muted)" }} />
            <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              ข้อมูลของคุณถูกเข้ารหัสและปลอดภัย
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
