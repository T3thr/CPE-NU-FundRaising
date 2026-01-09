"use client";
// =============================================================================
// Admin Dashboard - Modern Professional UI
// =============================================================================

import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Eye,
  ChevronRight,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { appConfig } from "@/config/app.config";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Mock data
const dashboardStats = {
  totalMembers: 68,
  activeMembersThisMonth: 45,
  pendingVerification: 5,
  unpaidMembers: 18,
  monthlyGoal: 47600,
  collected: 31500,
  collectionRate: 83,
};

const recentPayments = [
  { id: 1, name: "สมชาย ใจดี", studentId: "65310001", amount: 70, status: "pending", time: "5 นาทีที่แล้ว" },
  { id: 2, name: "สมหญิง รักเรียน", studentId: "65310002", amount: 140, status: "verified", time: "1 ชม. ที่แล้ว" },
  { id: 3, name: "นายสมปอง ดีมาก", studentId: "65310003", amount: 630, status: "verified", time: "2 ชม. ที่แล้ว" },
  { id: 4, name: "อารียา สวยงาม", studentId: "65310004", amount: 70, status: "rejected", time: "3 ชม. ที่แล้ว" },
];

const unpaidList = [
  { id: 1, name: "นาย ก กันยา", studentId: "65310006", monthsOwed: 3, amount: 250 },
  { id: 2, name: "นาย ข ขาว", studentId: "65310012", monthsOwed: 2, amount: 160 },
  { id: 3, name: "นาย ค เขียว", studentId: "65310018", monthsOwed: 5, amount: 390 },
];

// Stats Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
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
          <Icon style={{ width: "20px", height: "20px", color: iconColor }} />
        </div>
        {change && (
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: changeType === "up" ? "#22c55e" : "#ef4444",
            }}
          >
            {changeType === "up" ? (
              <ArrowUpRight style={{ width: "12px", height: "12px" }} />
            ) : (
              <ArrowDownRight style={{ width: "12px", height: "12px" }} />
            )}
            {change}
          </div>
        )}
      </div>
      <div>
        <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.125rem" }}>{value}</p>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{title}</p>
      </div>
    </motion.div>
  );
}

// Payment Status Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: "รอตรวจสอบ", bg: "rgba(245, 158, 11, 0.15)", color: "#d97706" },
    verified: { label: "ยืนยันแล้ว", bg: "rgba(34, 197, 94, 0.15)", color: "#16a34a" },
    rejected: { label: "ปฏิเสธ", bg: "rgba(239, 68, 68, 0.15)", color: "#dc2626" },
  };

  const { label, bg, color } = config[status] || config.pending;

  return (
    <span 
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.75rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        borderRadius: "9999px",
        backgroundColor: bg,
        color: color,
      }}
    >
      {label}
    </span>
  );
}

export default function DashboardContent() {
  const currentMonth = appConfig.thaiMonths[new Date().getMonth()];
  const academicYear = appConfig.academic.currentYear;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>
            ภาพรวม
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            {currentMonth} ปีการศึกษา {academicYear}68
          </p>
        </div>
        <Link
          href="/admin/verify"
          className="btn btn-success"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Eye style={{ width: "16px", height: "16px" }} />
          ตรวจสอบ Slip ({dashboardStats.pendingVerification})
        </Link>
      </div>

      {/* Stats Grid */}
      <motion.div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <StatCard
          title="สมาชิกทั้งหมด"
          value={dashboardStats.totalMembers}
          icon={Users}
          iconBg="rgba(59, 130, 246, 0.15)"
          iconColor="#3b82f6"
        />
        <StatCard
          title="ชำระแล้วเดือนนี้"
          value={dashboardStats.activeMembersThisMonth}
          change="+3"
          changeType="up"
          icon={CreditCard}
          iconBg="rgba(34, 197, 94, 0.15)"
          iconColor="#22c55e"
        />
        <StatCard
          title="รอตรวจสอบ"
          value={dashboardStats.pendingVerification}
          icon={Clock}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#f59e0b"
        />
        <StatCard
          title="ยังไม่ชำระ"
          value={dashboardStats.unpaidMembers}
          change="-2"
          changeType="down"
          icon={AlertCircle}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#ef4444"
        />
      </motion.div>

      {/* Collection Progress */}
      <motion.div
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.5rem",
        }}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>
              ยอดเก็บประจำเดือน
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              เป้าหมาย ฿{dashboardStats.monthlyGoal.toLocaleString()}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp style={{ width: "20px", height: "20px", color: "#22c55e" }} />
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e" }}>
              {dashboardStats.collectionRate}%
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div 
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "var(--surface-tertiary)",
            borderRadius: "9999px",
            overflow: "hidden",
            marginBottom: "0.5rem",
          }}
        >
          <div 
            style={{
              height: "100%",
              width: `${dashboardStats.collectionRate}%`,
              background: "linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)",
              borderRadius: "9999px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
          <span style={{ color: "var(--muted)" }}>
            เก็บได้ ฿{dashboardStats.collected.toLocaleString()}
          </span>
          <span style={{ color: "var(--muted)" }}>
            เหลืออีก ฿{(dashboardStats.monthlyGoal - dashboardStats.collected).toLocaleString()}
          </span>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Recent Payments */}
        <motion.div
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
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
            <h2 style={{ fontWeight: 700, color: "var(--foreground)" }}>การชำระล่าสุด</h2>
            <Link href="/admin/payments" style={{ fontSize: "0.875rem", color: "#3b82f6", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              ดูทั้งหมด <ChevronRight style={{ width: "16px", height: "16px" }} />
            </Link>
          </div>
          <div>
            {recentPayments.map((payment) => (
              <div 
                key={payment.id} 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div 
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    flexShrink: 0,
                  }}
                >
                  {payment.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {payment.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {payment.studentId} • {payment.time}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>฿{payment.amount}</p>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Unpaid Members */}
        <motion.div
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
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
            <h2 style={{ fontWeight: 700, color: "var(--foreground)" }}>สมาชิกค้างชำระ</h2>
            <Link href="/admin/members?filter=unpaid" style={{ fontSize: "0.875rem", color: "#3b82f6", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              ดูทั้งหมด <ChevronRight style={{ width: "16px", height: "16px" }} />
            </Link>
          </div>
          <div>
            {unpaidList.map((member) => (
              <div 
                key={member.id} 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div 
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    flexShrink: 0,
                  }}
                >
                  {member.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {member.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{member.studentId}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontWeight: 700, color: "#ef4444", marginBottom: "0.125rem" }}>฿{member.amount}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ค้าง {member.monthsOwed} เดือน</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
        }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <Link
            href="/admin/members/create"
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
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "var(--foreground)" }}>เพิ่มสมาชิก</p>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>เพิ่มนิสิตใหม่เข้าระบบ</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Link
            href="/admin/reports"
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
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp style={{ width: "24px", height: "24px", color: "#a855f7" }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "var(--foreground)" }}>ดูรายงาน</p>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>สรุปยอดประจำเดือน</p>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Link
            href="/admin/settings"
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
                backgroundColor: "rgba(100, 116, 139, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Settings style={{ width: "24px", height: "24px", color: "#64748b" }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "var(--foreground)" }}>ตั้งค่า</p>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>จัดการระบบ</p>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
