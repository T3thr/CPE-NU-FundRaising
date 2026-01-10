"use client";
// =============================================================================
// Payments Content - REAL DATA FROM SUPABASE
// Features: Amount display, Inline edit, Year filtering, Export, Migration
// Based on: src/docs/DESIGN-Database&DataEntry.md
// =============================================================================

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { Download, Calendar, Users, CheckCircle2, Clock, XCircle, Info, RefreshCw, AlertTriangle, Sparkles, Pencil, Check, X } from "lucide-react";
import { appConfig } from "@/config/app.config";
import { getPaymentsGrid, getActiveCohort, exportPaymentsCSV, migratePayments, upsertPayment, type CohortSettings } from "@/app/(admin)/admin/_actions/admin-actions";
import { useNotification } from "@/providers/notification-provider";
import SmartMigrationModal from "./SmartMigrationModal";

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

// Types
interface PaymentInfo {
  id: string;
  status: string;
  amount: number;
}

interface PaymentGridItem {
  member: {
    id: string;
    studentId: string;
    name: string;
    fullName: string;
    status: string;
  };
  months: Record<number, PaymentInfo>;
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  isLoading?: boolean;
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
        alignItems: "center",
        gap: "1rem",
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
      <div>
        {isLoading ? (
          <div style={{ width: "60px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : (
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>{value}</p>
        )}
        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{title}</p>
      </div>
    </motion.div>
  );
}

export default function PaymentsContent() {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { success, error: showError } = useNotification();

  // Data states
  const [cohort, setCohort] = useState<CohortSettings | null>(null);
  const [paymentsData, setPaymentsData] = useState<PaymentGridItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Year filter
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Migration modal
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);

  // Editing state for inline amount edit
  const [editingCell, setEditingCell] = useState<{ memberId: string; month: number } | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Calculate academic months based on cohort settings
  const getAcademicMonths = useCallback(() => {
    const startMonth = cohort?.startMonth || 7; // July default
    const months = [];
    for (let i = 0; i < 9; i++) {
      const month = ((startMonth - 1 + i) % 12) + 1;
      months.push(month);
    }
    return months;
  }, [cohort]);

  // Load data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const cohortData = await getActiveCohort();
        setCohort(cohortData);

        if (cohortData) {
          const data = await getPaymentsGrid(cohortData.id, selectedYear);
          setPaymentsData(data);
        }
        setError(null);
      } catch (err) {
        console.error("Error loading payments:", err);
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

  // Handle export
  const handleExport = async () => {
    if (!cohort) {
      showError("ไม่พบข้อมูล", "กรุณารอให้ข้อมูลโหลดเสร็จ");
      return;
    }

    try {
      const csv = await exportPaymentsCSV(cohort.id, selectedYear);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments_${cohort.name}_${selectedYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      success("Export สำเร็จ", "ดาวน์โหลดไฟล์ CSV เรียบร้อย");
    } catch {
      showError("Export ไม่สำเร็จ", "เกิดข้อผิดพลาดในการส่งออก");
    }
  };

  // Handle migration
  const handleMigration = async (records: Parameters<typeof migratePayments>[0]) => {
    const result = await migratePayments(records, cohort?.id);
    if (result.success || result.inserted > 0) {
      success(
        "Migration สำเร็จ",
        `นำเข้า ${result.inserted} รายการ${result.skipped > 0 ? `, ข้าม ${result.skipped} รายการ (ซ้ำ)` : ""}`
      );
      loadData(); // Refresh data
    } else {
      showError("Migration ไม่สำเร็จ", result.errors[0] || "เกิดข้อผิดพลาด");
    }
  };

  // Start editing a cell
  const handleStartEdit = (memberId: string, month: number, currentAmount: number | undefined) => {
    setEditingCell({ memberId, month });
    setEditAmount(currentAmount?.toString() || "70");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditAmount("");
  };

  // Save edited amount
  const handleSavePayment = async () => {
    if (!editingCell || !cohort) return;

    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      showError("จำนวนเงินไม่ถูกต้อง", "กรุณาระบุจำนวนเงินที่ถูกต้อง");
      return;
    }

    setIsSaving(true);
    try {
      const result = await upsertPayment({
        cohortId: cohort.id,
        memberId: editingCell.memberId,
        month: editingCell.month,
        year: selectedYear,
        amount: amount,
        status: "verified",
      });

      if (result.success) {
        success("บันทึกสำเร็จ", `บันทึกยอด ฿${amount} เรียบร้อยแล้ว`);
        loadData();
      } else {
        showError("บันทึกไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      showError("บันทึกไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSaving(false);
      handleCancelEdit();
    }
  };

  // Calculate stats
  const academicMonths = getAcademicMonths();
  const currentMonth = new Date().getMonth() + 1;
  const monthlyFee = cohort?.monthlyFee || 70;

  let paidCount = 0;
  let pendingCount = 0;
  let unpaidCount = 0;
  let totalCollected = 0;

  paymentsData.forEach(({ months }) => {
    academicMonths.forEach((month) => {
      const payment = months[month];
      if (payment?.status === "verified") {
        paidCount++;
        totalCollected += payment.amount || monthlyFee;
      } else if (payment?.status === "pending") {
        pendingCount++;
      } else if (month <= currentMonth) {
        unpaidCount++;
      }
    });
  });

  const totalExpected = paymentsData.length * academicMonths.filter((m) => m <= currentMonth).length * monthlyFee;
  const completionPercentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Status color mapping
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "verified":
        return { bg: "#22c55e", symbol: "✓" };
      case "pending":
        return { bg: "#f59e0b", symbol: "○" };
      case "unpaid":
        return { bg: "#ef4444", symbol: "✗" };
      default:
        return { bg: "var(--accent)", symbol: "-" };
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>ตารางการชำระเงิน</h1>
            {cohort && (
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
                {cohort.name}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            ดูสถานะการชำระของสมาชิกทั้งหมด • เดือนเริ่มต้น: {appConfig.thaiMonths[(cohort?.startMonth || 7) - 1]}
          </p>
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
            <RefreshCw
              style={{
                width: "18px",
                height: "18px",
                animation: isPending ? "spin 1s linear infinite" : "none",
              }}
            />
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
              {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <option key={year} value={year}>
                  ปี พ.ศ. {year + 543}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsMigrationOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            }}
          >
            <Sparkles style={{ width: "18px", height: "18px" }} />
            Migration
          </button>
          <button
            onClick={handleExport}
            disabled={paymentsData.length === 0}
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
              cursor: paymentsData.length === 0 ? "not-allowed" : "pointer",
              opacity: paymentsData.length === 0 ? 0.5 : 1,
            }}
          >
            <Download style={{ width: "18px", height: "18px" }} />
            Export
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
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCard title="สมาชิกทั้งหมด" value={paymentsData.length} icon={Users} iconBg="rgba(59, 130, 246, 0.15)" iconColor="#3b82f6" isLoading={isPending} />
        <StatCard title="ชำระแล้ว" value={paidCount} icon={CheckCircle2} iconBg="rgba(34, 197, 94, 0.15)" iconColor="#22c55e" isLoading={isPending} />
        <StatCard title="รอตรวจสอบ" value={pendingCount} icon={Clock} iconBg="rgba(245, 158, 11, 0.15)" iconColor="#f59e0b" isLoading={isPending} />
        <StatCard title="ยังไม่ชำระ" value={unpaidCount} icon={XCircle} iconBg="rgba(239, 68, 68, 0.15)" iconColor="#ef4444" isLoading={isPending} />
      </motion.div>

      {/* Collection Summary */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "1rem" }}>สรุปยอดเก็บ</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              ปีการศึกษา {(cohort?.academicYear || 68) + 2500} • ค่าธรรมเนียม ฿{monthlyFee}/เดือน
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            {isPending ? (
              <div style={{ width: "80px", height: "24px", backgroundColor: "var(--accent)", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
            ) : (
              <>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>฿{totalCollected.toLocaleString()}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>จากเป้าหมาย ฿{totalExpected.toLocaleString()}</p>
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
              width: `${completionPercentage}%`,
              height: "100%",
              background: "linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)",
              borderRadius: "9999px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem", textAlign: "right" }}>
          {completionPercentage}% • เหลือ ฿{(totalExpected - totalCollected).toLocaleString()}
        </p>
      </motion.div>

      {/* Payment Grid Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {isPending ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <RefreshCw style={{ width: "32px", height: "32px", color: "var(--muted)", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--muted)" }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : paymentsData.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                  <th
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      whiteSpace: "nowrap",
                      position: "sticky",
                      left: 0,
                      backgroundColor: "var(--accent)",
                      zIndex: 10,
                    }}
                  >
                    รหัส
                  </th>
                  <th
                    style={{
                      padding: "0.75rem 0.75rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      whiteSpace: "nowrap",
                      position: "sticky",
                      left: "80px",
                      backgroundColor: "var(--accent)",
                      zIndex: 10,
                    }}
                  >
                    ชื่อ
                  </th>
                  {academicMonths.map((month) => (
                    <th
                      key={month}
                      style={{
                        padding: "0.75rem 0.5rem",
                        textAlign: "center",
                        fontWeight: 500,
                        color: month === currentMonth ? "#3b82f6" : "var(--muted)",
                        minWidth: "40px",
                        backgroundColor: month === currentMonth ? "rgba(59, 130, 246, 0.1)" : undefined,
                      }}
                    >
                      {appConfig.thaiMonthsShort[month - 1]}
                    </th>
                  ))}
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap" }}>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {paymentsData.map(({ member, months }, rowIndex) => {
                  const paidCount = academicMonths.filter((m) => months[m]?.status === "verified").length;
                  const isComplete = paidCount === academicMonths.length;
                  const unpaidMonths = academicMonths.filter((m) => m <= currentMonth && !months[m]);

                  return (
                    <tr key={member.id} style={{ borderBottom: rowIndex === paymentsData.length - 1 ? "none" : "1px solid var(--border)" }}>
                      <td
                        style={{
                          padding: "0.75rem 1rem",
                          fontFamily: "monospace",
                          color: "var(--foreground)",
                          fontSize: "0.75rem",
                          position: "sticky",
                          left: 0,
                          backgroundColor: "var(--card)",
                          zIndex: 5,
                        }}
                      >
                        {member.studentId}
                      </td>
                      <td style={{ padding: "0.75rem 0.75rem", position: "sticky", left: "80px", backgroundColor: "var(--card)", zIndex: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: member.status === "active" ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.625rem",
                              flexShrink: 0,
                            }}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 500, color: "var(--foreground)", fontSize: "0.8125rem" }}>{member.name}</span>
                        </div>
                      </td>
                      {academicMonths.map((month) => {
                        const payment = months[month];
                        const status = payment?.status || (month > currentMonth ? "future" : "unpaid");
                        const { bg } = getStatusStyle(status);
                        const isEditing = editingCell?.memberId === member.id && editingCell?.month === month;

                        return (
                          <td
                            key={month}
                            style={{
                              padding: "0.25rem",
                              textAlign: "center",
                              backgroundColor: month === currentMonth ? "rgba(59, 130, 246, 0.05)" : undefined,
                            }}
                          >
                            {isEditing ? (
                              // Editing mode
                              <div style={{ display: "flex", alignItems: "center", gap: "2px", justifyContent: "center" }}>
                                <input
                                  type="number"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSavePayment();
                                    if (e.key === "Escape") handleCancelEdit();
                                  }}
                                  autoFocus
                                  style={{
                                    width: "50px",
                                    padding: "4px 6px",
                                    borderRadius: "6px",
                                    border: "1px solid #3b82f6",
                                    fontSize: "0.75rem",
                                    textAlign: "center",
                                    outline: "none",
                                  }}
                                />
                                <button
                                  onClick={handleSavePayment}
                                  disabled={isSaving}
                                  style={{
                                    padding: "4px",
                                    borderRadius: "4px",
                                    border: "none",
                                    backgroundColor: "#22c55e",
                                    color: "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Check style={{ width: "12px", height: "12px" }} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  style={{
                                    padding: "4px",
                                    borderRadius: "4px",
                                    border: "none",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <X style={{ width: "12px", height: "12px" }} />
                                </button>
                              </div>
                            ) : (
                              // Display mode - show amount
                              <div
                                onClick={() => status !== "future" && handleStartEdit(member.id, month, payment?.amount)}
                                style={{
                                  minWidth: "44px",
                                  padding: "4px 6px",
                                  borderRadius: "6px",
                                  backgroundColor: status === "future" ? "var(--accent)" : `${bg}15`,
                                  color: status === "future" ? "var(--muted)" : bg,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "2px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor: status !== "future" ? "pointer" : "default",
                                  transition: "all 0.15s ease",
                                }}
                                title={status === "verified" ? `ชำระแล้ว ฿${payment?.amount || monthlyFee}` : status === "pending" ? "รอตรวจสอบ" : status === "unpaid" ? "คลิกเพื่อเพิ่มยอดชำระ" : "ยังไม่ถึงกำหนด"}
                              >
                                {status === "verified" && payment?.amount ? (
                                  `฿${payment.amount}`
                                ) : status === "pending" ? (
                                  <Clock style={{ width: "14px", height: "14px" }} />
                                ) : status === "unpaid" ? (
                                  "0"
                                ) : (
                                  "-"
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                        {isComplete ? (
                          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#22c55e" }}>✓ ครบ</span>
                        ) : unpaidMonths.length > 0 ? (
                          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#ef4444" }}>ค้าง {unpaidMonths.length} เดือน</span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted)" }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Users style={{ width: "48px", height: "48px", color: "var(--muted)", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.5rem" }}>ยังไม่มีข้อมูล</h3>
            <p style={{ color: "var(--muted)" }}>กรุณาเพิ่มสมาชิกก่อนดูตารางการชำระเงิน</p>
          </div>
        )}
      </motion.div>

      {/* Legend & Info */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1rem 1.25rem",
          backgroundColor: "rgba(59, 130, 246, 0.08)",
          borderRadius: "12px",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Info style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
          <span style={{ fontSize: "0.875rem", color: "#3b82f6", fontWeight: 500 }}>คลิกที่ช่องเพื่อดูรายละเอียดหรือเพิ่มการชำระแบบ Manual</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8125rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
              ✓
            </div>
            <span style={{ color: "var(--muted)" }}>ชำระแล้ว</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
              ○
            </div>
            <span style={{ color: "var(--muted)" }}>รอตรวจสอบ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
              ✗
            </div>
            <span style={{ color: "var(--muted)" }}>ยังไม่ชำระ</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "var(--accent)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>-</div>
            <span style={{ color: "var(--muted)" }}>ยังไม่ถึงกำหนด</span>
          </div>
        </div>
      </motion.div>

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

      {/* Smart Migration Modal */}
      <SmartMigrationModal
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
        onMigrate={handleMigration}
        cohortId={cohort?.id}
        selectedYear={selectedYear}
        monthlyFee={monthlyFee}
      />
    </div>
  );
}
