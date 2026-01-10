"use client";
// =============================================================================
// Reports Content - SMART DASHBOARD WITH REAL DATA
// Features: Real-time data, Charts visualization, Refine integration
// Based on: src/docs/DESIGN-Database&DataEntry.md
// =============================================================================

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
} from "lucide-react";
import { appConfig } from "@/config/app.config";
import { useNotification } from "@/providers/notification-provider";
import {
  getDashboardStats,
  getActiveCohort,
  getPaymentsGrid,
  getUnpaidMembers,
  exportPaymentsCSV,
  type DashboardStats,
  type CohortSettings,
  type MemberWithPayments,
} from "@/app/(admin)/admin/_actions/admin-actions";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// =============================================================================
// Types
// =============================================================================

interface MonthlyData {
  month: number;
  monthName: string;
  collected: number;
  expected: number;
  percentage: number;
}

interface ReportData {
  stats: DashboardStats;
  cohort: CohortSettings | null;
  monthlyBreakdown: MonthlyData[];
  topUnpaid: MemberWithPayments[];
}

// =============================================================================
// Components
// =============================================================================

// Stat Card with trend
function StatCardEnhanced({
  title,
  value,
  previousValue,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  format = "number",
  isLoading,
}: {
  title: string;
  value: number;
  previousValue?: number;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  format?: "number" | "currency" | "percentage";
  isLoading?: boolean;
}) {
  const trend = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = trend >= 0;

  const formatValue = (v: number) => {
    switch (format) {
      case "currency":
        return `฿${v.toLocaleString()}`;
      case "percentage":
        return `${v}%`;
      default:
        return v.toLocaleString();
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: "24px", height: "24px", color: iconColor }} />
        </div>
        {previousValue !== undefined && trend !== 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: isPositive ? "#22c55e" : "#ef4444",
            }}
          >
            {isPositive ? <ArrowUpRight style={{ width: "14px", height: "14px" }} /> : <ArrowDownRight style={{ width: "14px", height: "14px" }} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        {isLoading ? (
          <div style={{ width: "80px", height: "28px", backgroundColor: "var(--accent)", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : (
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>{formatValue(value)}</p>
        )}
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "4px" }}>{title}</p>
        {subtitle && <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>{subtitle}</p>}
      </div>
    </motion.div>
  );
}

// Simple Bar Chart
function SimpleBarChart({ data, isLoading }: { data: MonthlyData[]; isLoading: boolean }) {
  const maxValue = Math.max(...data.map((d) => d.expected), 1);

  return (
    <motion.div
      variants={fadeInUp}
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        padding: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BarChart3 style={{ width: "20px", height: "20px", color: "#3b82f6" }} />
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)" }}>ยอดเก็บรายเดือน</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>เปรียบเทียบยอดเก็บจริงกับเป้าหมาย</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw style={{ width: "24px", height: "24px", color: "var(--muted)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "160px" }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "100%", display: "flex", flexDirection: "column-reverse", height: "120px" }}>
                {/* Expected (Background) */}
                <div
                  style={{
                    width: "100%",
                    height: `${(d.expected / maxValue) * 100}%`,
                    backgroundColor: "var(--accent)",
                    borderRadius: "4px 4px 0 0",
                    position: "relative",
                  }}
                >
                  {/* Collected (Foreground) */}
                  <div
                    style={{
                      width: "100%",
                      height: `${d.expected > 0 ? (d.collected / d.expected) * 100 : 0}%`,
                      background: d.percentage >= 80 ? "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)" : d.percentage >= 50 ? "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)" : "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
                      borderRadius: "4px 4px 0 0",
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      transition: "height 0.5s ease",
                    }}
                  />
                </div>
              </div>
              <p style={{ fontSize: "0.6875rem", color: "var(--muted)", marginTop: "0.5rem" }}>{d.monthName}</p>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem", fontSize: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)" }} />
          <span style={{ color: "var(--muted)" }}>ยอดเก็บจริง</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: "var(--accent)" }} />
          <span style={{ color: "var(--muted)" }}>เป้าหมาย</span>
        </div>
      </div>
    </motion.div>
  );
}

// Collection Summary Donut
function CollectionDonut({ stats, cohort, isLoading }: { stats: DashboardStats; cohort: CohortSettings | null; isLoading: boolean }) {
  const percentage = stats.collectionPercentage;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      variants={fadeInUp}
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        padding: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PieChart style={{ width: "20px", height: "20px", color: "#22c55e" }} />
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)" }}>ภาพรวมการเก็บเงิน</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ปีการศึกษา {cohort?.academicYear || appConfig.academic.currentYear}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
        {/* Donut Chart */}
        <div style={{ position: "relative", width: "140px", height: "140px" }}>
          <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
            {/* Background circle */}
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--accent)" strokeWidth="12" />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#ef4444"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={isLoading ? circumference : strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            {isLoading ? (
              <div style={{ width: "40px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }} />
            ) : (
              <>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>{percentage}%</p>
                <p style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>เก็บได้</p>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 style={{ width: "16px", height: "16px", color: "#22c55e" }} />
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>฿{stats.totalCollected.toLocaleString()}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>เก็บได้แล้ว</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock style={{ width: "16px", height: "16px", color: "#f59e0b" }} />
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>฿{(stats.totalExpected - stats.totalCollected).toLocaleString()}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ยังไม่เก็บ</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Activity style={{ width: "16px", height: "16px", color: "#3b82f6" }} />
            <div>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>฿{stats.totalExpected.toLocaleString()}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>เป้าหมาย</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Top Unpaid Members
function TopUnpaidMembers({ members, isLoading, monthlyFee }: { members: MemberWithPayments[]; isLoading: boolean; monthlyFee: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle style={{ width: "20px", height: "20px", color: "#ef4444" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)" }}>สมาชิกค้างชำระมากที่สุด</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ต้องติดตามเป็นพิเศษ</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <RefreshCw style={{ width: "24px", height: "24px", color: "var(--muted)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : members.length > 0 ? (
        <div>
          {members.map((member, idx) => {
            const monthsUnpaid = Math.ceil(member.unpaidAmount / monthlyFee);
            return (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.875rem 1.25rem",
                  borderBottom: idx === members.length - 1 ? "none" : "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${idx < 3 ? "#ef4444" : "#f59e0b"} 0%, ${idx < 3 ? "#dc2626" : "#d97706"} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, color: "var(--foreground)", fontSize: "0.875rem" }}>
                    {member.firstName} {member.lastName}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "monospace" }}>{member.studentId}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, color: "#ef4444", fontSize: "0.875rem" }}>฿{member.unpaidAmount.toLocaleString()}</p>
                  <p style={{ fontSize: "0.6875rem", color: "var(--muted)" }}>ค้าง {monthsUnpaid} เดือน</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <CheckCircle2 style={{ width: "48px", height: "48px", color: "#22c55e", margin: "0 auto 1rem" }} />
          <p style={{ color: "var(--muted)" }}>🎉 ทุกคนชำระครบแล้ว!</p>
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ReportsContent() {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { success: showSuccess, error: showError } = useNotification();

  // Data states
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Year filter
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Load data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const [stats, cohort, topUnpaid] = await Promise.all([getDashboardStats(), getActiveCohort(), getUnpaidMembers(10)]);

        // Generate monthly breakdown
        const monthlyBreakdown: MonthlyData[] = [];
        const currentMonth = new Date().getMonth() + 1;
        const monthlyFee = cohort?.monthlyFee || 70;
        const memberCount = stats.activeMembers;

        // Get payments grid for monthly breakdown
        let paymentsGrid: Array<{
          months: Record<number, { id: string; status: string; amount: number }>;
        }> = [];
        if (cohort) {
          paymentsGrid = await getPaymentsGrid(cohort.id, selectedYear);
        }

        for (let m = 1; m <= currentMonth; m++) {
          const expected = memberCount * monthlyFee;
          let collected = 0;

          paymentsGrid.forEach(({ months }) => {
            if (months[m]?.status === "verified") {
              collected += monthlyFee;
            }
          });

          monthlyBreakdown.push({
            month: m,
            monthName: appConfig.thaiMonthsShort[m - 1],
            collected,
            expected,
            percentage: expected > 0 ? Math.round((collected / expected) * 100) : 0,
          });
        }

        setData({
          stats,
          cohort,
          monthlyBreakdown,
          topUnpaid,
        });
        setError(null);
      } catch (err) {
        console.error("Error loading reports:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
    });
  }, [selectedYear]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, loadData]);

  // Export
  const handleExport = async () => {
    if (!data?.cohort) {
      showError("ไม่พบข้อมูล", "กรุณารอให้ข้อมูลโหลดเสร็จ");
      return;
    }

    try {
      const csv = await exportPaymentsCSV(data.cohort.id, selectedYear);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${data.cohort.name}_${selectedYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess("Export สำเร็จ", "ดาวน์โหลดรายงานเรียบร้อย");
    } catch {
      showError("Export ไม่สำเร็จ", "เกิดข้อผิดพลาด");
    }
  };

  const stats = data?.stats || {
    totalMembers: 0,
    activeMembers: 0,
    paidThisMonth: 0,
    pendingPayments: 0,
    unpaidMembers: 0,
    totalCollected: 0,
    totalExpected: 0,
    collectionPercentage: 0,
  };

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>รายงาน</h1>
            {data?.cohort && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "#3b82f6",
                }}
              >
                {data.cohort.name}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>สรุปข้อมูลและสถิติการเก็บเงิน (Real-time)</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={loadData}
            disabled={isPending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            <RefreshCw style={{ width: "18px", height: "18px", animation: isPending ? "spin 1s linear infinite" : "none" }} />
            รีเฟรช
          </button>
          <div style={{ position: "relative" }}>
            <Calendar
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "18px",
                height: "18px",
                color: "var(--muted)",
              }}
            />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: "0.625rem 1rem 0.625rem 2.5rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                fontSize: "0.875rem",
                color: "var(--foreground)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => (
                <option key={year} value={year}>
                  ปี พ.ศ. {year + 543}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              color: "white",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              cursor: "pointer",
            }}
          >
            <Download style={{ width: "18px", height: "18px" }} />
            Export รายงาน
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertTriangle style={{ width: "20px", height: "20px", color: "#ef4444" }} />
          <span style={{ color: "#ef4444", fontSize: "0.875rem" }}>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCardEnhanced
          title="สมาชิกทั้งหมด"
          value={stats.totalMembers}
          icon={Users}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
          isLoading={isPending}
        />
        <StatCardEnhanced title="ชำระแล้วเดือนนี้" value={stats.paidThisMonth} subtitle={`จาก ${stats.activeMembers} คน`} icon={CheckCircle2} iconBg="rgba(34, 197, 94, 0.15)" iconColor="#22c55e" isLoading={isPending} />
        <StatCardEnhanced title="ยอดเก็บได้" value={stats.totalCollected} format="currency" icon={CreditCard} iconBg="rgba(168, 85, 247, 0.15)" iconColor="#a855f7" isLoading={isPending} />
        <StatCardEnhanced
          title="อัตราสำเร็จ"
          value={stats.collectionPercentage}
          format="percentage"
          icon={stats.collectionPercentage >= 80 ? TrendingUp : TrendingDown}
          iconBg={stats.collectionPercentage >= 80 ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
          iconColor={stats.collectionPercentage >= 80 ? "#22c55e" : "#ef4444"}
          isLoading={isPending}
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <SimpleBarChart data={data?.monthlyBreakdown || []} isLoading={isPending} />
        <CollectionDonut stats={stats} cohort={data?.cohort || null} isLoading={isPending} />
      </motion.div>

      {/* Top Unpaid */}
      <TopUnpaidMembers members={data?.topUnpaid || []} isLoading={isPending} monthlyFee={data?.cohort?.monthlyFee || 70} />

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
