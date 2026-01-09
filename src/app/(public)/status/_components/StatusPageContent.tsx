"use client";
// =============================================================================
// Status Page Content - Check Payment Status
// Professional, User-Centric, Responsive Design
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  TrendingUp,
  Calendar,
  Minus
} from "lucide-react";
import { appConfig } from "@/config/app.config";
import { useNotification } from "@/providers/notification-provider";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

interface PaymentStatus {
  studentId: string;
  fullName: string;
  nickname: string;
  cohortName: string;
  academicYear: number;
  monthlyFee: number;
  months: {
    month: number;
    status: "paid" | "pending" | "unpaid" | "future";
    amount?: number;
    paidAt?: string;
  }[];
  totalPaid: number;
  totalDue: number;
  penaltyAmount: number;
}

export default function StatusPageContent() {
  const { error } = useNotification();
  const [mounted, setMounted] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<PaymentStatus | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear() % 100 + 43;
  const currentMonth = new Date().getMonth() + 1;

  const handleSearch = async () => {
    if (!studentId.trim() || studentId.length !== 8) {
      error("รหัสนิสิตไม่ถูกต้อง", "กรุณากรอกรหัสนิสิต 8 หลัก");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockMonths = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const isFuture = month > currentMonth;
        const isPaid = Math.random() > 0.3 && !isFuture;
        const isPending = !isPaid && !isFuture && Math.random() > 0.7;

        return {
          month,
          status: isFuture
            ? "future" as const
            : isPaid
            ? "paid" as const
            : isPending
            ? "pending" as const
            : "unpaid" as const,
          amount: isPaid ? 70 : undefined,
          paidAt: isPaid ? new Date().toISOString() : undefined,
        };
      });

      const unpaidCount = mockMonths.filter(m => m.status === "unpaid").length;
      const paidCount = mockMonths.filter(m => m.status === "paid").length;

      setStatus({
        studentId: studentId,
        fullName: "นาย สมชาย ใจดี",
        nickname: "ชาย",
        cohortName: "CPE รุ่นที่ 32",
        academicYear: currentYear,
        monthlyFee: 70,
        months: mockMonths,
        totalPaid: paidCount * 70,
        totalDue: unpaidCount * 70,
        penaltyAmount: unpaidCount > 0 ? (unpaidCount * 10) - 10 : 0,
      });
    } catch {
      error("ไม่พบข้อมูล", "กรุณาตรวจสอบรหัสนิสิตใหม่อีกครั้ง");
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: "paid" | "pending" | "unpaid" | "future") => {
    const iconStyle = { width: "18px", height: "18px" };
    switch (status) {
      case "paid":
        return <CheckCircle2 style={{ ...iconStyle, color: "#22c55e" }} />;
      case "pending":
        return <Clock style={{ ...iconStyle, color: "#f59e0b" }} />;
      case "unpaid":
        return <XCircle style={{ ...iconStyle, color: "#ef4444" }} />;
      case "future":
        return <Minus style={{ ...iconStyle, color: "var(--muted)" }} />;
    }
  };

  const getStatusStyle = (status: "paid" | "pending" | "unpaid" | "future") => {
    const base = {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem",
      borderRadius: "12px",
      transition: "all 0.2s",
    };
    
    switch (status) {
      case "paid":
        return { ...base, backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)" };
      case "pending":
        return { ...base, backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)" };
      case "unpaid":
        return { ...base, backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" };
      case "future":
        return { ...base, backgroundColor: "var(--accent)", border: "1px solid var(--border)" };
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--background)", paddingTop: "2rem" }}>
      {/* Main Content */}
      <main style={{ maxWidth: "768px", margin: "0 auto", padding: "0 1rem 2rem" }}>
        {/* Search Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            padding: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div 
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 1rem",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search style={{ width: "32px", height: "32px", color: "white" }} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              ตรวจสอบสถานะการชำระ
            </h1>
            <p style={{ color: "var(--muted)" }}>
              กรอกรหัสนิสิตเพื่อดูสถานะการชำระเงินของคุณ
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="รหัสนิสิต เช่น 65360001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1,
                padding: "1rem",
                fontSize: "1.125rem",
                fontFamily: "monospace",
                textAlign: "center",
                letterSpacing: "0.1em",
                backgroundColor: "var(--accent)",
                border: "2px solid var(--border)",
                borderRadius: "12px",
                color: "var(--foreground)",
                outline: "none",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || studentId.length !== 8}
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                border: "none",
                background: studentId.length === 8 
                  ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                  : "var(--accent)",
                color: studentId.length === 8 ? "white" : "var(--muted)",
                cursor: studentId.length === 8 ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
              ) : (
                <Search style={{ width: "20px", height: "20px" }} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Status Result */}
        {status && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Member Info */}
            <motion.div
              variants={fadeInUp}
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div 
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    flexShrink: 0,
                  }}
                >
                  {status.nickname.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>
                    {status.fullName}
                  </h2>
                  <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                    <span style={{ fontFamily: "monospace" }}>{status.studentId}</span> • {status.cohortName}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
              variants={fadeInUp}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
              }}
            >
              <div 
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "1.25rem",
                  textAlign: "center",
                }}
              >
                <div 
                  style={{
                    width: "40px",
                    height: "40px",
                    margin: "0 auto 0.75rem",
                    borderRadius: "10px",
                    backgroundColor: "rgba(34, 197, 94, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp style={{ width: "20px", height: "20px", color: "#22c55e" }} />
                </div>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e", marginBottom: "0.25rem" }}>
                  ฿{status.totalPaid.toLocaleString()}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ชำระแล้ว</p>
              </div>

              <div 
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "1.25rem",
                  textAlign: "center",
                }}
              >
                <div 
                  style={{
                    width: "40px",
                    height: "40px",
                    margin: "0 auto 0.75rem",
                    borderRadius: "10px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle style={{ width: "20px", height: "20px", color: "#ef4444" }} />
                </div>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.25rem" }}>
                  ฿{(status.totalDue + status.penaltyAmount).toLocaleString()}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ค้างชำระ</p>
              </div>

              <div 
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "1.25rem",
                  textAlign: "center",
                }}
              >
                <div 
                  style={{
                    width: "40px",
                    height: "40px",
                    margin: "0 auto 0.75rem",
                    borderRadius: "10px",
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar style={{ width: "20px", height: "20px", color: "#f59e0b" }} />
                </div>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.25rem" }}>
                  ฿{status.penaltyAmount.toLocaleString()}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ค่าปรับ</p>
              </div>
            </motion.div>

            {/* Monthly Status Grid */}
            <motion.div
              variants={fadeInUp}
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
                สถานะรายเดือน (ปี {status.academicYear})
              </h3>

              <div 
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.75rem",
                }}
              >
                {status.months.map((m) => (
                  <div key={m.month} style={getStatusStyle(m.status)}>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 500 }}>
                      {appConfig.thaiMonthsShort[m.month - 1]}
                    </span>
                    {getStatusIcon(m.status)}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div 
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  marginTop: "1.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border)",
                  justifyContent: "center",
                }}
              >
                {[
                  { status: "paid", label: "ชำระแล้ว", color: "#22c55e" },
                  { status: "pending", label: "รอตรวจสอบ", color: "#f59e0b" },
                  { status: "unpaid", label: "ค้างชำระ", color: "#ef4444" },
                  { status: "future", label: "ยังไม่ถึงกำหนด", color: "var(--muted)" },
                ].map((item) => (
                  <div key={item.status} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div 
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Alert */}
            {status.totalDue > 0 && (
              <motion.div
                variants={fadeInUp}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <AlertCircle style={{ width: "24px", height: "24px", color: "#ef4444", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>คุณมียอดค้างชำระ</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                    ยอด ฿{(status.totalDue + status.penaltyAmount).toLocaleString()}
                    {status.penaltyAmount > 0 && ` (รวมค่าปรับ ฿${status.penaltyAmount})`}
                  </p>
                </div>
                <Link 
                  href="/pay"
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  ชำระเลย
                </Link>
              </motion.div>
            )}

            {status.totalDue === 0 && (
              <motion.div
                variants={fadeInUp}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <CheckCircle2 style={{ width: "24px", height: "24px", color: "#22c55e", flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>ชำระครบถ้วนแล้ว! 🎉</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>ขอบคุณที่ชำระค่าธรรมเนียมตรงเวลา</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!status && !isLoading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "var(--muted)",
            }}
          >
            <div 
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 1rem",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search style={{ width: "32px", height: "32px" }} />
            </div>
            <p style={{ fontWeight: 500, marginBottom: "0.25rem" }}>กรอกรหัสนิสิตเพื่อเริ่มต้น</p>
            <p style={{ fontSize: "0.875rem" }}>ระบบจะแสดงสถานะการชำระของคุณ</p>
          </motion.div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
