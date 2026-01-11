"use client";
// =============================================================================
// Settings Content - REAL DATA & CONFIGURATION
// Based on: src/docs/DESIGN-Database&DataEntry.md
// Best Practice: Next.js 15+ with Server Actions
// =============================================================================

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Settings,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Zap,
  Clock,
  Calendar,
  DollarSign,
  AlertTriangle,
  Send,
  RefreshCw,
  Save,
  Database,
} from "lucide-react";
import { useNotification } from "@/providers/notification-provider";
import { appConfig } from "@/config/app.config";
import {
  getActiveCohort,
  updateCohortSettings,
  getEasySlipStatus,
  getLineMessagingStatus,
  type CohortSettings,
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

interface EasySlipStatus {
  enabled: boolean;
  quotaPerWeek?: number;
  usage?: { used: number; remaining: number };
}

interface LineStatus {
  enabled: boolean;
  targetType?: "group" | "user";
  channelConfigured?: boolean;
  targetConfigured?: boolean;
}

// =============================================================================
// Main Component
// =============================================================================

export default function SettingsContent() {
  const [mounted, setMounted] = useState(false);
  const { success, error: showError } = useNotification();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Data states
  const [cohort, setCohort] = useState<CohortSettings | null>(null);
  const [easySlipStatus, setEasySlipStatus] = useState<EasySlipStatus | null>(null);
  const [lineStatus, setLineStatus] = useState<LineStatus | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Settings form state
  const [formData, setFormData] = useState({
    monthlyFee: 70,
    penaltyFee: 10,
    startMonth: 7,
    endMonth: 3,
    autoVerifyEnabled: true,
    notificationsEnabled: true,
  });

  // Load data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const [cohortData, easySlip, line] = await Promise.all([
          getActiveCohort(),
          getEasySlipStatus(),
          getLineMessagingStatus(),
        ]);

        setCohort(cohortData);
        setEasySlipStatus(easySlip);
        setLineStatus(line);

        if (cohortData) {
          setFormData({
            monthlyFee: cohortData.monthlyFee,
            penaltyFee: cohortData.penaltyFee,
            startMonth: cohortData.startMonth,
            endMonth: cohortData.endMonth,
            autoVerifyEnabled: (cohortData.config as Record<string, boolean>)?.autoVerifyEnabled ?? true,
            notificationsEnabled: (cohortData.config as Record<string, boolean>)?.notificationsEnabled ?? true,
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        showError("โหลดข้อมูลไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      }
    });
  }, [showError]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Handle form changes
  const handleChange = (field: string, value: number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    if (!cohort) return;

    setIsSaving(true);
    try {
      const result = await updateCohortSettings(cohort.id, {
        monthlyFee: formData.monthlyFee,
        penaltyFee: formData.penaltyFee,
        startMonth: formData.startMonth,
        endMonth: formData.endMonth,
        config: {
          ...cohort.config,
          autoVerifyEnabled: formData.autoVerifyEnabled,
          notificationsEnabled: formData.notificationsEnabled,
        },
      });

      if (result.success) {
        success("บันทึกสำเร็จ", "การตั้งค่าถูกบันทึกเรียบร้อยแล้ว");
        setHasChanges(false);
        loadData(); // Refresh data
      } else {
        showError("บันทึกไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      showError("บันทึกไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSaving(false);
    }
  };

  // Test Line message
  const handleTestLineMessage = async () => {
    setIsSendingTest(true);
    try {
      const res = await fetch("/api/line-messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "custom",
          data: {
            message: `🧪 ทดสอบการแจ้งเตือน\n\nระบบ ${cohort?.name || "CPE Funds Hub"} ทำงานปกติ!`,
          },
        }),
      });

      const result = await res.json();
      if (result.success) {
        success("ส่งสำเร็จ", "ข้อความทดสอบถูกส่งไปยัง Line แล้ว");
      } else {
        showError("ส่งไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      showError("ส่งไม่สำเร็จ", "ไม่สามารถเชื่อมต่อ API ได้");
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!mounted) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--background)",
    fontSize: "0.875rem",
    color: "var(--foreground)",
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #475569 0%, #1e293b 100%)",
            }}
          >
            <Settings style={{ width: "24px", height: "24px", color: "white" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>
                ตั้งค่าระบบ
              </h1>
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
              จัดการการตั้งค่าและบริการต่างๆ
            </p>
          </div>
        </div>

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
          รีเฟรชสถานะ
        </button>
      </motion.div>

      {/* Database Connection Status */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{
          padding: "1rem 1.25rem",
          borderRadius: "12px",
          backgroundColor: cohort ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)",
          border: `1px solid ${cohort ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Database style={{ width: "20px", height: "20px", color: cohort ? "#22c55e" : "#ef4444" }} />
        <span style={{ fontSize: "0.875rem", color: cohort ? "#15803d" : "#dc2626", fontWeight: 500 }}>
          {cohort
            ? `เชื่อมต่อฐานข้อมูลสำเร็จ • รุ่น ${cohort.name} (ปีการศึกษา ${cohort.academicYear})`
            : "ไม่พบข้อมูลรุ่น - กรุณาสร้างรุ่นใหม่ในระบบ"}
        </span>
      </motion.div>

      {/* Smart Guidance when no cohort */}
      {!cohort && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            padding: "1.25rem",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#b45309", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            ⚠️ ต้องตั้งค่าข้อมูลพื้นฐานก่อน
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#92400e", marginBottom: "1rem", lineHeight: 1.7 }}>
            คุณยังไม่สามารถตั้งค่าการชำระเงินได้ เนื่องจากยังไม่มีข้อมูลรุ่น (Cohort) ในระบบ กรุณาทำตามขั้นตอนต่อไปนี้:
          </p>
          <ol style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "#92400e", lineHeight: 1.8 }}>
            <li><strong>ขั้นตอนที่ 1:</strong> ไปที่หน้า <a href="/admin/organization" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}>องค์กร</a> เพื่อสร้างข้อมูลองค์กร (ชื่อภาควิชา, บัญชีธนาคาร)</li>
            <li><strong>ขั้นตอนที่ 2:</strong> สร้างรุ่น (เช่น CPE30) โดยกดปุ่ม "สร้างรุ่นใหม่" ในหน้าองค์กร</li>
            <li><strong>ขั้นตอนที่ 3:</strong> กลับมาที่หน้านี้เพื่อตั้งค่าการชำระเงิน</li>
          </ol>
          <div style={{ marginTop: "1rem" }}>
            <a
              href="/admin/organization"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "10px",
                fontSize: "0.875rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                color: "white",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              }}
            >
              ไปหน้าตั้งค่าองค์กร →
            </a>
          </div>
        </motion.div>
      )}

      {/* Service Status */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* EasySlip Status */}
        <motion.div
          variants={fadeInUp}
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                <Zap style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)" }}>EasySlip</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ตรวจสอบ Slip อัตโนมัติ</p>
              </div>
            </div>
            {isPending ? (
              <div style={{ width: "24px", height: "24px", border: "2px solid var(--border)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            ) : easySlipStatus?.enabled ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  color: "#22c55e",
                }}
              >
                <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                เชื่อมต่อแล้ว
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                }}
              >
                <XCircle style={{ width: "12px", height: "12px" }} />
                ไม่ได้เชื่อมต่อ
              </span>
            )}
          </div>

          {easySlipStatus?.enabled && easySlipStatus.usage && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--muted)" }}>โควต้าสัปดาห์นี้</span>
                <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                  {easySlipStatus.usage.remaining}/{easySlipStatus.quotaPerWeek}
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "var(--accent)", borderRadius: "9999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(easySlipStatus.usage.remaining / (easySlipStatus.quotaPerWeek || 50)) * 100}%`,
                    height: "100%",
                    background: easySlipStatus.usage.remaining < 10 ? "linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)" : "linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)",
                    borderRadius: "9999px",
                  }}
                />
              </div>
              {easySlipStatus.usage.remaining < 10 && (
                <p style={{ fontSize: "0.75rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                  <AlertTriangle style={{ width: "12px", height: "12px" }} />
                  โควต้าใกล้หมด!
                </p>
              )}
            </div>
          )}

          {!easySlipStatus?.enabled && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.75rem",
                borderRadius: "10px",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <AlertTriangle style={{ width: "16px", height: "16px", color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "0.8125rem", color: "#f59e0b" }}>
                ตั้งค่า <code style={{ fontFamily: "monospace", backgroundColor: "rgba(245, 158, 11, 0.2)", padding: "2px 6px", borderRadius: "4px" }}>EASYSLIP_API_KEY</code> ใน .env
              </p>
            </div>
          )}
        </motion.div>

        {/* Line Messaging Status */}
        <motion.div
          variants={fadeInUp}
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageCircle style={{ width: "24px", height: "24px", color: "#22c55e" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)" }}>Line Messaging</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>แจ้งเตือนผู้ดูแล</p>
              </div>
            </div>
            {isPending ? (
              <div style={{ width: "24px", height: "24px", border: "2px solid var(--border)", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            ) : lineStatus?.enabled ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  color: "#22c55e",
                }}
              >
                <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                เชื่อมต่อแล้ว
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#ef4444",
                }}
              >
                <XCircle style={{ width: "12px", height: "12px" }} />
                ไม่ได้เชื่อมต่อ
              </span>
            )}
          </div>

          {lineStatus?.enabled && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <CheckCircle2 style={{ width: "14px", height: "14px", color: "#22c55e" }} />
                <span style={{ color: "var(--foreground)" }}>
                  ประเภท: {lineStatus.targetType === "group" ? "กลุ่ม Line" : "ผู้ใช้"}
                </span>
              </div>
              <button
                onClick={handleTestLineMessage}
                disabled={isSendingTest}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  cursor: isSendingTest ? "not-allowed" : "pointer",
                  opacity: isSendingTest ? 0.7 : 1,
                }}
              >
                {isSendingTest ? (
                  <RefreshCw style={{ width: "16px", height: "16px", animation: "spin 0.6s linear infinite" }} />
                ) : (
                  <Send style={{ width: "16px", height: "16px" }} />
                )}
                ทดสอบส่งข้อความ
              </button>
            </div>
          )}

          {!lineStatus?.enabled && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                padding: "0.75rem",
                borderRadius: "10px",
                backgroundColor: lineStatus?.channelConfigured ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                border: `1px solid ${lineStatus?.channelConfigured ? "rgba(34, 197, 94, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
              }}
            >
              {/* Channel Status */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                {lineStatus?.channelConfigured ? (
                  <>
                    <CheckCircle2 style={{ width: "14px", height: "14px", color: "#22c55e" }} />
                    <span style={{ color: "#15803d" }}>Channel Access Token ✓</span>
                  </>
                ) : (
                  <>
                    <XCircle style={{ width: "14px", height: "14px", color: "#f59e0b" }} />
                    <span style={{ color: "#f59e0b" }}>
                      ตั้งค่า <code style={{ fontFamily: "monospace", backgroundColor: "rgba(245, 158, 11, 0.2)", padding: "2px 4px", borderRadius: "4px" }}>LINE_CHANNEL_ACCESS_TOKEN</code>
                    </span>
                  </>
                )}
              </div>
              {/* Target Status */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                {lineStatus?.targetConfigured ? (
                  <>
                    <CheckCircle2 style={{ width: "14px", height: "14px", color: "#22c55e" }} />
                    <span style={{ color: "#15803d" }}>Group/User ID ✓</span>
                  </>
                ) : (
                  <>
                    <XCircle style={{ width: "14px", height: "14px", color: "#f59e0b" }} />
                    <span style={{ color: "#f59e0b" }}>
                      ตั้งค่า <code style={{ fontFamily: "monospace", backgroundColor: "rgba(245, 158, 11, 0.2)", padding: "2px 4px", borderRadius: "4px" }}>LINE_GROUP_ID</code> หรือ <code style={{ fontFamily: "monospace", backgroundColor: "rgba(245, 158, 11, 0.2)", padding: "2px 4px", borderRadius: "4px" }}>LINE_USER_ID</code>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Payment Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DollarSign style={{ width: "20px", height: "20px", color: "#a855f7" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)" }}>ตั้งค่าการชำระเงิน</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>กำหนดค่าธรรมเนียมและค่าปรับ (บันทึกลง Database จริง)</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              ค่าธรรมเนียมรายเดือน (บาท)
            </label>
            <input
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => handleChange("monthlyFee", parseInt(e.target.value) || 0)}
              min={1}
              style={inputStyle}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem" }}>ค่าเริ่มต้น: 70 บาท</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              ค่าปรับล่าช้า (บาท/เดือน)
            </label>
            <input
              type="number"
              value={formData.penaltyFee}
              onChange={(e) => handleChange("penaltyFee", parseInt(e.target.value) || 0)}
              min={10}
              style={inputStyle}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem" }}>ขั้นต่ำ: 10 บาท</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              เดือนเริ่มต้นปีการศึกษา
            </label>
            <select value={formData.startMonth} onChange={(e) => handleChange("startMonth", parseInt(e.target.value))} style={selectStyle}>
              {appConfig.thaiMonths.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              เดือนสิ้นสุดปีการศึกษา
            </label>
            <select value={formData.endMonth} onChange={(e) => handleChange("endMonth", parseInt(e.target.value))} style={selectStyle}>
              {appConfig.thaiMonths.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Feature Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.5rem",
        }}
      >
        <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)", marginBottom: "1.5rem" }}>เปิด/ปิด ฟีเจอร์</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderRadius: "12px",
              backgroundColor: "var(--accent)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Zap style={{ width: "20px", height: "20px", color: "#3b82f6" }} />
              <div>
                <p style={{ fontWeight: 500, color: "var(--foreground)" }}>ตรวจสอบ Slip อัตโนมัติ</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ใช้ EasySlip API ตรวจสอบ Slip</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.autoVerifyEnabled}
              onChange={(e) => handleChange("autoVerifyEnabled", e.target.checked)}
              style={{ width: "20px", height: "20px", accentColor: "#3b82f6" }}
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderRadius: "12px",
              backgroundColor: "var(--accent)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <MessageCircle style={{ width: "20px", height: "20px", color: "#22c55e" }} />
              <div>
                <p style={{ fontWeight: 500, color: "var(--foreground)" }}>แจ้งเตือน Line</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ส่งแจ้งเตือนเมื่อมีการชำระเงินใหม่</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.notificationsEnabled}
              onChange={(e) => handleChange("notificationsEnabled", e.target.checked)}
              style={{ width: "20px", height: "20px", accentColor: "#22c55e" }}
            />
          </label>
        </div>
      </motion.div>

      {/* Cron Jobs Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
              backgroundColor: "rgba(249, 115, 22, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock style={{ width: "20px", height: "20px", color: "#f97316" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--foreground)" }}>งานอัตโนมัติ (Cron Jobs)</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ทำงานผ่าน Vercel Cron</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderRadius: "12px",
              backgroundColor: "var(--accent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Calendar style={{ width: "20px", height: "20px", color: "var(--muted)" }} />
              <div>
                <p style={{ fontWeight: 500, color: "var(--foreground)" }}>แจ้งเตือนประจำเดือน</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ทุกวันที่ 1 เวลา 00:00</p>
              </div>
            </div>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor: formData.notificationsEnabled ? "rgba(34, 197, 94, 0.15)" : "rgba(100, 116, 139, 0.15)",
                color: formData.notificationsEnabled ? "#22c55e" : "#64748b",
              }}
            >
              {formData.notificationsEnabled ? "Active" : "Disabled"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderRadius: "12px",
              backgroundColor: "var(--accent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Clock style={{ width: "20px", height: "20px", color: "var(--muted)" }} />
              <div>
                <p style={{ fontWeight: 500, color: "var(--foreground)" }}>สรุปประจำวัน</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ทุกวัน เวลา 20:00</p>
              </div>
            </div>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor: formData.notificationsEnabled ? "rgba(34, 197, 94, 0.15)" : "rgba(100, 116, 139, 0.15)",
                color: formData.notificationsEnabled ? "#22c55e" : "#64748b",
              }}
            >
              {formData.notificationsEnabled ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}
      >
        {hasChanges && (
          <span style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "#f59e0b" }}>
            <AlertTriangle style={{ width: "16px", height: "16px", marginRight: "0.5rem" }} />
            มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges || !cohort}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            color: "white",
            background: hasChanges && cohort ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "var(--muted)",
            boxShadow: hasChanges && cohort ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
            cursor: hasChanges && cohort && !isSaving ? "pointer" : "not-allowed",
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? (
            <RefreshCw style={{ width: "18px", height: "18px", animation: "spin 0.6s linear infinite" }} />
          ) : (
            <Save style={{ width: "18px", height: "18px" }} />
          )}
          บันทึกการตั้งค่า
        </button>
      </motion.div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
