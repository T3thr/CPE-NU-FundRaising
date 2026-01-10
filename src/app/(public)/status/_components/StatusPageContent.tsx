"use client";
// =============================================================================
// Status Page Content - Full Payment Grid + Search + Year Filter
// Like Admin View but for Public - Read-only with Supabase Integration
// Best practices: Next.js 15+, Tailwind 4.0 Inline Styles
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Minus,
  Users,
  ChevronDown,
  Filter,
  RefreshCw
} from "lucide-react";
import { appConfig } from "@/config/app.config";
import { useNotification } from "@/providers/notification-provider";
import { 
  getMemberPaymentStatus, 
  getPublicPaymentsGrid,
  getAvailableYears,
  type PaymentInfo
} from "../../_actions/public-actions";

// =============================================================================
// Animation Variants
// =============================================================================
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

// =============================================================================
// Types
// =============================================================================
type ViewMode = "search" | "all";

interface PaymentStatusInfo {
  month: number;
  status: "paid" | "pending" | "unpaid" | "future";
  amount?: number;
}

interface MemberStatusResult {
  id: string;
  studentId: string;
  fullName: string;
  nickname: string;
  cohortName: string;
  monthlyFee: number;
  months: PaymentStatusInfo[];
  totalPaid: number;
  totalDue: number;
}

// =============================================================================
// Main Component
// =============================================================================
export default function StatusPageContent() {
  const { error: showError } = useNotification();
  const [mounted, setMounted] = useState(false);
  
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("search");
  
  // Search mode state
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [memberStatus, setMemberStatus] = useState<MemberStatusResult | null>(null);
  
  // All members grid state
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [cohortInfo, setCohortInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);
  
  // Year filter
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  
  const currentMonth = new Date().getMonth() + 1;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    loadAvailableYears();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Load years from DB
  const loadAvailableYears = async () => {
    const years = await getAvailableYears();
    setAvailableYears(years);
  };

  // =============================================================================
  // Search Individual Member
  // =============================================================================
  const handleSearch = async () => {
    if (!studentId.trim() || studentId.length !== 8) {
      showError("รหัสนิสิตไม่ถูกต้อง", "กรุณากรอกรหัสนิสิต 8 หลัก");
      return;
    }

    setIsLoading(true);

    try {
      const result = await getMemberPaymentStatus(studentId, selectedYear);

      if (!result.success || !result.member) {
        showError("ไม่พบข้อมูล", result.error || "กรุณาตรวจสอบรหัสนิสิตใหม่อีกครั้ง");
        setMemberStatus(null);
        return;
      }

      // Build months data
      const months: PaymentStatusInfo[] = [];
      let totalPaid = 0;
      let totalDue = 0;

      for (let i = 0; i < 12; i++) {
        const month = i + 1;
        const payment = result.payments?.find((p: PaymentInfo) => p.month === month);
        const isFuture = month > currentMonth && selectedYear === currentYear;

        let status: PaymentStatusInfo["status"];
        if (isFuture) {
          status = "future";
        } else if (payment?.status === "verified") {
          status = "paid";
          totalPaid += payment.amount || result.member.monthlyFee;
        } else if (payment?.status === "pending") {
          status = "pending";
        } else {
          status = "unpaid";
          totalDue += result.member.monthlyFee;
        }

        months.push({ month, status, amount: payment?.amount });
      }

      setMemberStatus({
        id: result.member.id,
        studentId: result.member.studentId,
        fullName: result.member.fullName,
        nickname: result.member.nickname,
        cohortName: result.member.cohortName,
        monthlyFee: result.member.monthlyFee,
        months,
        totalPaid,
        totalDue,
      });
    } catch (err) {
      console.error(err);
      showError("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
      setMemberStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // Load All Members Grid
  // =============================================================================
  const loadAllMembers = useCallback(async (search?: string) => {
    setIsLoadingGrid(true);
    try {
      const result = await getPublicPaymentsGrid(selectedYear, search);
      if (result.success) {
        setAllMembers(result.members);
        setCohortInfo(result.cohort);
      }
    } catch (err) {
      console.error(err);
      showError("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setIsLoadingGrid(false);
    }
  }, [selectedYear, showError]);

  // Debounced search for grid
  const handleGridSearch = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadAllMembers(value);
    }, 500);
  };

  // Load grid when switching to "all" view
  useEffect(() => {
    if (viewMode === "all") {
      loadAllMembers(searchQuery);
    }
  }, [viewMode, selectedYear, loadAllMembers]); // eslint-disable-line

  // =============================================================================
  // Helpers
  // =============================================================================
  const getStatusIcon = (status: "paid" | "pending" | "unpaid" | "future") => {
    const iconStyle = { width: "16px", height: "16px" };
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
      gap: "4px",
      padding: "0.5rem",
      borderRadius: "8px",
      transition: "all 0.2s",
      minWidth: "48px",
    };
    
    switch (status) {
      case "paid":
        return { ...base, backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)" };
      case "pending":
        return { ...base, backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" };
      case "unpaid":
        return { ...base, backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" };
      case "future":
        return { ...base, backgroundColor: "var(--accent)", border: "1px solid var(--border)" };
    }
  };

  // Academic months (Jul-Jun)
  const academicMonths = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--background)", paddingTop: "2rem" }}>
      <main style={{ maxWidth: viewMode === "all" ? "1200px" : "768px", margin: "0 auto", padding: "0 1rem 2rem", transition: "max-width 0.3s" }}>
        
        {/* Header with View Toggle */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>
              ตรวจสอบสถานะการชำระ
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              {viewMode === "search" ? "ค้นหาด้วยรหัสนิสิต" : "ดูสถานะทั้งหมด"}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setViewMode("search")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: viewMode === "search" ? "2px solid #3b82f6" : "1px solid var(--border)",
                backgroundColor: viewMode === "search" ? "rgba(59, 130, 246, 0.1)" : "var(--card)",
                color: viewMode === "search" ? "#3b82f6" : "var(--foreground)",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Search style={{ width: "16px", height: "16px" }} />
              ค้นหา
            </button>
            <button
              onClick={() => setViewMode("all")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: viewMode === "all" ? "2px solid #3b82f6" : "1px solid var(--border)",
                backgroundColor: viewMode === "all" ? "rgba(59, 130, 246, 0.1)" : "var(--card)",
                color: viewMode === "all" ? "#3b82f6" : "var(--foreground)",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Users style={{ width: "16px", height: "16px" }} />
              ดูทั้งหมด
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Search Mode */}
          {viewMode === "search" && (
            <motion.div
              key="search-mode"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={staggerContainer}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              {/* Search Card */}
              <motion.div
                variants={fadeInUp}
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "2rem",
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
                  <p style={{ color: "var(--muted)" }}>กรอกรหัสนิสิตเพื่อดูสถานะของคุณ</p>
                </div>

                {/* Year Selector + Search */}
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Calendar style={{ width: "18px", height: "18px", color: "var(--muted)" }} />
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
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
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      fontFamily: "monospace",
                      textAlign: "center",
                      letterSpacing: "0.1em",
                      backgroundColor: "var(--accent)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      color: "var(--foreground)",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading || studentId.length !== 8}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "10px",
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

              {/* Individual Status Result */}
              {memberStatus && (
                <>
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
                        {memberStatus.nickname.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>
                          {memberStatus.fullName}
                        </h2>
                        <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                          <span style={{ fontFamily: "monospace" }}>{memberStatus.studentId}</span> • {memberStatus.cohortName}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Summary Stats */}
                  <motion.div
                    variants={fadeInUp}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
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
                        ฿{memberStatus.totalPaid.toLocaleString()}
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
                        ฿{memberStatus.totalDue.toLocaleString()}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ค้างชำระ</p>
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
                      สถานะรายเดือน (ปี {selectedYear})
                    </h3>

                    <div 
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "0.75rem",
                      }}
                    >
                      {memberStatus.months.map((m) => (
                        <div key={m.month} style={getStatusStyle(m.status)}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 500 }}>
                            {appConfig.thaiMonthsShort[m.month - 1]}
                          </span>
                          {getStatusIcon(m.status)}
                          {m.status === "paid" && m.amount && (
                            <span style={{ fontSize: "0.625rem", color: "#22c55e" }}>฿{m.amount}</span>
                          )}
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
                  {memberStatus.totalDue > 0 && (
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
                          ยอด ฿{memberStatus.totalDue.toLocaleString()}
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

                  {memberStatus.totalDue === 0 && (
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
                </>
              )}

              {/* Empty State */}
              {!memberStatus && !isLoading && (
                <motion.div
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
            </motion.div>
          )}

          {/* All Members Grid Mode */}
          {viewMode === "all" && (
            <motion.div
              key="all-mode"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
            >
              {/* Filters */}
              <div 
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "1rem 1.5rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Year Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar style={{ width: "18px", height: "18px", color: "var(--muted)" }} />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>ปี {year}</option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "200px" }}>
                  <Search style={{ width: "18px", height: "18px", color: "var(--muted)" }} />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ หรือ รหัสนิสิต..."
                    value={searchQuery}
                    onChange={(e) => handleGridSearch(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Refresh */}
                <button
                  onClick={() => loadAllMembers(searchQuery)}
                  disabled={isLoadingGrid}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <RefreshCw style={{ width: "18px", height: "18px", animation: isLoadingGrid ? "spin 1s linear infinite" : "none" }} />
                </button>
              </div>

              {/* Grid Table */}
              <div 
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                {isLoadingGrid ? (
                  <div style={{ padding: "3rem", textAlign: "center" }}>
                    <Loader2 style={{ width: "40px", height: "40px", color: "#3b82f6", margin: "0 auto", animation: "spin 1s linear infinite" }} />
                    <p style={{ marginTop: "1rem", color: "var(--muted)" }}>กำลังโหลดข้อมูล...</p>
                  </div>
                ) : allMembers.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--foreground)", position: "sticky", left: 0, backgroundColor: "var(--accent)", zIndex: 10 }}>
                            รหัส
                          </th>
                          <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600, color: "var(--foreground)", position: "sticky", left: "80px", backgroundColor: "var(--accent)", zIndex: 10 }}>
                            ชื่อ
                          </th>
                          {academicMonths.map(month => (
                            <th 
                              key={month} 
                              style={{ 
                                padding: "0.75rem 0.5rem", 
                                textAlign: "center", 
                                fontWeight: 600, 
                                color: month === currentMonth && selectedYear === currentYear ? "#3b82f6" : "var(--muted)",
                                fontSize: "0.75rem",
                                backgroundColor: month === currentMonth && selectedYear === currentYear ? "rgba(59, 130, 246, 0.1)" : "transparent",
                              }}
                            >
                              {appConfig.thaiMonthsShort[month - 1]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allMembers.map((item, rowIndex) => (
                          <tr 
                            key={item.member.id}
                            style={{ borderBottom: rowIndex === allMembers.length - 1 ? "none" : "1px solid var(--border)" }}
                          >
                            <td style={{ padding: "0.5rem 1rem", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--foreground)", position: "sticky", left: 0, backgroundColor: "var(--card)", zIndex: 5 }}>
                              {item.member.studentId}
                            </td>
                            <td style={{ padding: "0.5rem", position: "sticky", left: "80px", backgroundColor: "var(--card)", zIndex: 5 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div 
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: "0.625rem",
                                    fontWeight: 600,
                                    flexShrink: 0,
                                  }}
                                >
                                  {item.member.name.charAt(0)}
                                </div>
                                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--foreground)" }}>
                                  {item.member.name}
                                </span>
                              </div>
                            </td>
                            {academicMonths.map(month => {
                              const payment = item.months[month];
                              const isFuture = month > currentMonth && selectedYear === currentYear;
                              const status = payment?.status === "verified" 
                                ? "paid" 
                                : payment?.status === "pending" 
                                  ? "pending" 
                                  : isFuture 
                                    ? "future" 
                                    : "unpaid";
                              
                              return (
                                <td 
                                  key={month}
                                  style={{ 
                                    padding: "0.25rem", 
                                    textAlign: "center",
                                    backgroundColor: month === currentMonth && selectedYear === currentYear ? "rgba(59, 130, 246, 0.05)" : "transparent",
                                  }}
                                >
                                  <div
                                    style={{
                                      minWidth: "36px",
                                      padding: "4px",
                                      borderRadius: "6px",
                                      margin: "0 auto",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.6875rem",
                                      fontWeight: 600,
                                      backgroundColor: status === "paid" 
                                        ? "rgba(34, 197, 94, 0.15)" 
                                        : status === "pending"
                                          ? "rgba(245, 158, 11, 0.15)"
                                          : status === "unpaid"
                                            ? "rgba(239, 68, 68, 0.15)"
                                            : "var(--accent)",
                                      color: status === "paid" 
                                        ? "#22c55e" 
                                        : status === "pending"
                                          ? "#f59e0b"
                                          : status === "unpaid"
                                            ? "#ef4444"
                                            : "var(--muted)",
                                    }}
                                  >
                                    {status === "paid" && payment?.amount ? `฿${payment.amount}` : status === "paid" ? "✓" : status === "pending" ? "⏳" : status === "unpaid" ? "0" : "-"}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: "3rem", textAlign: "center" }}>
                    <Users style={{ width: "48px", height: "48px", color: "var(--muted)", margin: "0 auto 1rem" }} />
                    <h3 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                      {searchQuery ? "ไม่พบผลลัพธ์" : "ยังไม่มีข้อมูล"}
                    </h3>
                    <p style={{ color: "var(--muted)" }}>
                      {searchQuery ? "ลองค้นหาด้วยคำอื่น" : "ยังไม่มีสมาชิกในระบบ"}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats Summary */}
              {cohortInfo && allMembers.length > 0 && (
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                    {cohortInfo.name} • แสดง {allMembers.length} สมาชิก • ค่าธรรมเนียม ฿{cohortInfo.monthlyFee}/เดือน
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
