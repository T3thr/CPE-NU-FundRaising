"use client";
// =============================================================================
// Admin Dashboard Content - REAL DATA FROM SUPABASE
// Based on: src/docs/DESIGN-Database&DataEntry.md
// Best Practice: Next.js 15+ with Refine
// =============================================================================

import React, { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  UserPlus,
  ArrowRight,
  FileCheck2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { appConfig } from "@/config/app.config";
import {
  getDashboardStats,
  getRecentPayments,
  getUnpaidMembers,
  getActiveCohort,
  type DashboardStats,
  type PaymentRecord,
  type MemberWithPayments,
  type CohortSettings,
} from "../_actions/admin-actions";

// =============================================================================
// Types
// =============================================================================

interface DashboardData {
  stats: DashboardStats;
  recentPayments: PaymentRecord[];
  unpaidMembers: MemberWithPayments[];
  cohort: CohortSettings | null;
}

// =============================================================================
// Stat Card Component
// =============================================================================

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBg,
  iconColor,
  isLoading,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  isLoading?: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        transition: "all 0.2s ease",
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
        {change && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: changeType === "up" ? "#22c55e" : "#ef4444",
            }}
          >
            {changeType === "up" ? (
              <TrendingUp style={{ width: "14px", height: "14px" }} />
            ) : (
              <TrendingDown style={{ width: "14px", height: "14px" }} />
            )}
            {change}
          </div>
        )}
      </div>
      <div>
        {isLoading ? (
          <div
            style={{
              width: "80px",
              height: "28px",
              backgroundColor: "var(--accent)",
              borderRadius: "6px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ) : (
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>
            {value}
          </p>
        )}
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "4px" }}>
          {title}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// Payment Item Component
// =============================================================================

function PaymentItem({ payment }: { payment: PaymentRecord }) {
  const timeAgo = getTimeAgo(payment.createdAt);
  
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background:
            payment.status === "verified"
              ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
              : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: "0.875rem",
          flexShrink: 0,
        }}
      >
        {payment.memberName.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.875rem" }}>
          {payment.memberName}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {payment.studentId} • {timeAgo}
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontWeight: 700, color: "#3b82f6", fontSize: "0.875rem" }}>
          ฿{payment.amount}
        </p>
        <span
          style={{
            fontSize: "0.625rem",
            padding: "2px 8px",
            borderRadius: "9999px",
            backgroundColor: payment.status === "verified" ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
            color: payment.status === "verified" ? "#22c55e" : "#f59e0b",
            fontWeight: 500,
          }}
        >
          {payment.status === "verified" ? "ยืนยันแล้ว" : "รอตรวจสอบ"}
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// Unpaid Member Item Component
// =============================================================================

function UnpaidItem({ member, monthlyFee }: { member: MemberWithPayments; monthlyFee: number }) {
  const monthsUnpaid = Math.ceil(member.unpaidAmount / monthlyFee);
  
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: "0.875rem",
          flexShrink: 0,
        }}
      >
        {member.firstName.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.875rem" }}>
          {member.title}{member.firstName} {member.lastName}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {member.studentId}
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontWeight: 700, color: "#ef4444", fontSize: "0.875rem" }}>
          ฿{member.unpaidAmount}
        </p>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          ค้าง {monthsUnpaid} เดือน
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// Quick Action Component
// =============================================================================

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  iconBg,
  iconColor,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1.25rem",
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        textDecoration: "none",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: "24px", height: "24px", color: iconColor }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.9375rem" }}>
          {title}
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "2px" }}>
          {description}
        </p>
      </div>
      <ArrowRight style={{ width: "20px", height: "20px", color: "var(--muted)" }} />
    </Link>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH");
}

// =============================================================================
// Main Dashboard Component
// =============================================================================

interface DashboardContentProps {
  initialData?: DashboardData | null;
}

export default function DashboardContent({ initialData }: DashboardContentProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<DashboardData | null>(initialData || null);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = appConfig.thaiMonths[new Date().getMonth()];

  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const [stats, recentPayments, unpaidMembers, cohort] = await Promise.all([
          getDashboardStats(),
          getRecentPayments(5),
          getUnpaidMembers(5),
          getActiveCohort(),
        ]);
        setData({ stats, recentPayments, unpaidMembers, cohort });
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!initialData) {
      loadData();
    }
  }, [initialData, loadData]);

  if (!mounted) return null;

  const academicYear = data?.cohort?.academicYear || appConfig.academic.currentYear;
  const monthlyFee = data?.cohort?.monthlyFee || 70;
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>
              ภาพรวม
            </h1>
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
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            {currentMonth} ปีการศึกษา {academicYear}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
            <RefreshCw
              style={{
                width: "18px",
                height: "18px",
                animation: isPending ? "spin 1s linear infinite" : "none",
              }}
            />
            รีเฟรช
          </button>
          <Link
            href="/admin/verify"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              color: "white",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          >
            <FileCheck2 style={{ width: "18px", height: "18px" }} />
            ตรวจสอบ Slip
            {stats.pendingPayments > 0 && (
              <span
                style={{
                  marginLeft: "4px",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  fontSize: "0.75rem",
                }}
              >
                {stats.pendingPayments}
              </span>
            )}
          </Link>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCard
          title="สมาชิกทั้งหมด"
          value={stats.totalMembers}
          icon={Users}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
          isLoading={isPending}
        />
        <StatCard
          title="ชำระแล้วเดือนนี้"
          value={stats.paidThisMonth}
          change={stats.paidThisMonth > 0 ? `+${stats.paidThisMonth}` : undefined}
          changeType="up"
          icon={CheckCircle2}
          iconBg="rgba(34, 197, 94, 0.15)"
          iconColor="#22c55e"
          isLoading={isPending}
        />
        <StatCard
          title="รอตรวจสอบ"
          value={stats.pendingPayments}
          icon={Clock}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
          isLoading={isPending}
        />
        <StatCard
          title="ยังไม่ชำระ"
          value={stats.unpaidMembers}
          icon={AlertCircle}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#ef4444"
          isLoading={isPending}
        />
      </div>

      {/* Collection Progress */}
      <div
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "1rem" }}>
              ยอดเก็บประจำเดือน
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              เป้าหมาย ฿{(stats.activeMembers * monthlyFee).toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            {isPending ? (
              <div style={{ width: "80px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
            ) : (
              <>
                <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>
                  ฿{stats.totalCollected.toLocaleString()}
                </p>
                <p style={{ fontSize: "0.875rem", color: "#22c55e", fontWeight: 500 }}>
                  ~{stats.collectionPercentage}%
                </p>
              </>
            )}
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: "12px",
            backgroundColor: "var(--accent)",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${stats.collectionPercentage}%`,
              height: "100%",
              background: "linear-gradient(90deg, #22c55e 0%, #86efac 100%)",
              borderRadius: "9999px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem", textAlign: "right" }}>
          เหลืออีก ฿{(stats.totalExpected - stats.totalCollected).toLocaleString()}
        </p>
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Recent Payments */}
        <div
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h3 style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "1rem" }}>
              การชำระล่าสุด
            </h3>
            <Link
              href="/admin/payments"
              style={{
                fontSize: "0.8125rem",
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div>
            {isPending ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <RefreshCw style={{ width: "24px", height: "24px", color: "var(--muted)", animation: "spin 1s linear infinite" }} />
              </div>
            ) : data?.recentPayments && data.recentPayments.length > 0 ? (
              data.recentPayments.map((payment) => (
                <PaymentItem key={payment.id} payment={payment} />
              ))
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                ยังไม่มีการชำระเงิน
              </div>
            )}
          </div>
        </div>

        {/* Unpaid Members */}
        <div
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h3 style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "1rem" }}>
              สมาชิกค้างชำระ
            </h3>
            <Link
              href="/admin/members"
              style={{
                fontSize: "0.8125rem",
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div>
            {isPending ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <RefreshCw style={{ width: "24px", height: "24px", color: "var(--muted)", animation: "spin 1s linear infinite" }} />
              </div>
            ) : data?.unpaidMembers && data.unpaidMembers.length > 0 ? (
              data.unpaidMembers.map((member) => (
                <UnpaidItem key={member.id} member={member} monthlyFee={monthlyFee} />
              ))
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                🎉 ทุกคนชำระครบแล้ว!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        <QuickAction
          href="/admin/members/create"
          icon={UserPlus}
          title="เพิ่มสมาชิก"
          description="เพิ่มสมาชิกใหม่เข้าระบบ"
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
        />
        <QuickAction
          href="/admin/reports"
          icon={BarChart3}
          title="ดูรายงาน"
          description="สรุปยอดประจำเดือน"
          iconBg="rgba(34, 197, 94, 0.15)"
          iconColor="#22c55e"
        />
        <QuickAction
          href="/admin/settings"
          icon={Settings}
          title="ตั้งค่า"
          description="จัดการระบบ"
          iconBg="rgba(100, 116, 139, 0.15)"
          iconColor="#64748b"
        />
      </div>

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
