"use client";
// =============================================================================
// Verify Slips Content - REAL DATA FROM SUPABASE
// Features: Pagination, Year filter, EasySlip integration, Responsive images
// Based on: src/docs/DESIGN-Database&DataEntry.md
// =============================================================================

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Clock,
  User,
  CreditCard,
  X,
  Zap,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { useNotification } from "@/providers/notification-provider";
import { appConfig } from "@/config/app.config";
import { getPendingSlips, verifyPayment, getActiveCohort } from "@/app/(admin)/admin/_actions/admin-actions";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// Types
interface MemberInfo {
  student_id: string;
  first_name: string;
  last_name: string;
}

interface PendingSlip {
  id: string;
  amount: number;
  payment_month: number;
  payment_year: number;
  slip_url: string | null;
  slip_trans_ref: string | null;
  created_at: string;
  members: MemberInfo | null;
}

// Normalize Supabase response (handles both array and object)
function normalizeSlipData(rawData: any[]): PendingSlip[] {
  return rawData.map((item) => {
    let memberInfo: MemberInfo | null = null;
    const rawMembers = item.members;
    
    if (Array.isArray(rawMembers) && rawMembers.length > 0) {
      memberInfo = rawMembers[0] as MemberInfo;
    } else if (rawMembers && typeof rawMembers === 'object') {
      memberInfo = rawMembers as MemberInfo;
    }
    
    return {
      id: item.id as string,
      amount: item.amount as number,
      payment_month: item.payment_month as number,
      payment_year: item.payment_year as number,
      slip_url: item.slip_url as string | null,
      slip_trans_ref: item.slip_trans_ref as string | null,
      created_at: item.created_at as string,
      members: memberInfo,
    };
  });
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
  return `${diffDays} วันที่แล้ว`;
}

export default function VerifySlipsContent() {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { success, error: showError } = useNotification();

  // Data states
  const [slips, setSlips] = useState<PendingSlip[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [cohortName, setCohortName] = useState<string | null>(null);

  // UI states
  const [selectedSlip, setSelectedSlip] = useState<PendingSlip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Pagination & Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const pageSize = 12;

  // Load data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const offset = (currentPage - 1) * pageSize;
        const { data, total } = await getPendingSlips(pageSize, offset);
        setSlips(normalizeSlipData(data));
        setTotalCount(total);

        const cohort = await getActiveCohort();
        setCohortName(cohort?.name || null);
      } catch (err) {
        console.error("Error loading slips:", err);
        showError("โหลดข้อมูลไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      }
    });
  }, [currentPage, showError]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, loadData]);

  const handleOpenSlip = (slip: PendingSlip) => {
    setSelectedSlip(slip);
    setIsModalOpen(true);
    setIsImageZoomed(false);
  };

  const handleVerify = async (slipId: string, approve: boolean) => {
    setIsProcessing(true);
    try {
      const result = await verifyPayment(slipId, approve);

      if (result.success) {
        setSlips((prev) => prev.filter((s) => s.id !== slipId));
        setTotalCount((prev) => prev - 1);
        setIsModalOpen(false);
        setSelectedSlip(null);
        setShowRejectDialog(false);

        if (approve) {
          success("ยืนยันสำเร็จ", "บันทึกการชำระเงินเรียบร้อยแล้ว");
        } else {
          showError("ปฏิเสธ Slip", "ระบบจะแจ้งเตือนผู้ใช้ให้อัปโหลดใหม่");
        }
      } else {
        showError("ดำเนินการไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      showError("ดำเนินการไม่สำเร็จ", "ไม่สามารถเชื่อมต่อได้");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkVerify = async () => {
    setIsProcessing(true);
    let successCount = 0;

    for (const slip of slips) {
      if (slip.slip_trans_ref) {
        await verifyPayment(slip.id, true);
        successCount++;
      }
    }

    setIsProcessing(false);
    loadData();
    success(`ยืนยันสำเร็จ ${successCount} รายการ`, "บันทึกการชำระเงินเรียบร้อยแล้ว");
  };

  const autoVerifiableCount = slips.filter((s) => s.slip_trans_ref).length;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (!mounted) return null;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>ตรวจสอบ Slip</h1>
              {cohortName && (
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
                  {cohortName}
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              มี {totalCount} รายการรอตรวจสอบ
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
              <RefreshCw style={{ width: "18px", height: "18px", animation: isPending ? "spin 1s linear infinite" : "none" }} />
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
            {autoVerifiableCount > 0 && (
              <button
                onClick={handleBulkVerify}
                disabled={isProcessing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  color: "white",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  opacity: isProcessing ? 0.7 : 1,
                }}
              >
                {isProcessing ? (
                  <RefreshCw style={{ width: "18px", height: "18px", animation: "spin 0.6s linear infinite" }} />
                ) : (
                  <Zap style={{ width: "18px", height: "18px" }} />
                )}
                ยืนยันทั้งหมด ({autoVerifiableCount})
              </button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            padding: "1rem",
            borderRadius: "12px",
            backgroundColor: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <Info style={{ width: "20px", height: "20px", color: "#3b82f6", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontWeight: 600, color: "#3b82f6", fontSize: "0.9375rem" }}>เคล็ดลับการตรวจสอบ</p>
            <p style={{ fontSize: "0.875rem", color: "#3b82f6", opacity: 0.8, marginTop: "2px" }}>
              Slip ที่มีเครื่องหมาย ✓ สีเขียว หมายถึงผ่าน EasySlip แล้ว สามารถกดยืนยันได้เลย คลิกที่รูปเพื่อขยาย
            </p>
          </div>
        </motion.div>

        {/* Content */}
        {isPending ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <RefreshCw style={{ width: "32px", height: "32px", color: "var(--muted)", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--muted)" }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : slips.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              padding: "4rem 2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <CheckCircle2 style={{ width: "40px", height: "40px", color: "#22c55e" }} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              ไม่มี Slip รอตรวจสอบ 🎉
            </h3>
            <p style={{ color: "var(--muted)" }}>ทุกรายการได้รับการตรวจสอบแล้ว</p>
          </motion.div>
        ) : (
          <>
            {/* Slips Grid - Responsive with smaller images */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1rem",
              }}
            >
              {slips.map((slip) => (
                <motion.div
                  key={slip.id}
                  variants={scaleIn}
                  onClick={() => handleOpenSlip(slip)}
                  style={{
                    backgroundColor: "var(--card)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
                >
                  {/* Slip Preview - Smaller aspect ratio */}
                  <div
                    style={{
                      position: "relative",
                      paddingTop: "100%",
                      backgroundColor: "var(--accent)",
                    }}
                  >
                    {slip.slip_url ? (
                      <img
                        src={slip.slip_url}
                        alt="Payment slip"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--muted)",
                        }}
                      >
                        <CreditCard style={{ width: "32px", height: "32px" }} />
                      </div>
                    )}

                    {/* Badge */}
                    <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                      {slip.slip_trans_ref ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            fontSize: "0.625rem",
                            fontWeight: 500,
                            backgroundColor: "rgba(34, 197, 94, 0.9)",
                            color: "white",
                          }}
                        >
                          <CheckCircle2 style={{ width: "10px", height: "10px" }} />
                          Auto
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            fontSize: "0.625rem",
                            fontWeight: 500,
                            backgroundColor: "rgba(245, 158, 11, 0.9)",
                            color: "white",
                          }}
                        >
                          <AlertTriangle style={{ width: "10px", height: "10px" }} />
                          Manual
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                      <div style={{ minWidth: 0 }}>
                        <h3
                          style={{
                            fontWeight: 600,
                            color: "var(--foreground)",
                            fontSize: "0.8125rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {slip.members?.first_name || "ไม่ทราบชื่อ"}
                        </h3>
                        <p style={{ fontSize: "0.6875rem", color: "var(--muted)", fontFamily: "monospace" }}>
                          {slip.members?.student_id || "-"}
                        </p>
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#3b82f6", flexShrink: 0 }}>
                        ฿{slip.amount}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                      <span>{appConfig.thaiMonthsShort[slip.payment_month - 1]}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <Clock style={{ width: "10px", height: "10px" }} />
                        {formatRelativeTime(slip.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft style={{ width: "16px", height: "16px" }} />
                </button>
                <span style={{ fontSize: "0.875rem", color: "var(--foreground)", padding: "0 1rem" }}>
                  หน้า {currentPage} จาก {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  }}
                >
                  <ChevronRight style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Slip Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSlip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && setIsModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflow: "auto",
                borderRadius: "20px",
                backgroundColor: "var(--card)",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  zIndex: 10,
                }}
              >
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)" }}>ตรวจสอบ Slip</h2>
                <button
                  onClick={() => !isProcessing && setIsModalOpen(false)}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    color: "var(--muted)",
                  }}
                >
                  <X style={{ width: "20px", height: "20px" }} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  {/* Slip Image - Clickable to zoom */}
                  <div
                    onClick={() => setIsImageZoomed(!isImageZoomed)}
                    style={{
                      position: "relative",
                      aspectRatio: isImageZoomed ? "auto" : "3/4",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--accent)",
                      cursor: "zoom-in",
                    }}
                  >
                    {selectedSlip.slip_url ? (
                      <img
                        src={selectedSlip.slip_url}
                        alt="Payment slip"
                        style={{
                          width: "100%",
                          height: isImageZoomed ? "auto" : "100%",
                          objectFit: isImageZoomed ? "contain" : "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CreditCard style={{ width: "48px", height: "48px", color: "var(--muted)" }} />
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ZoomIn style={{ width: "12px", height: "12px" }} />
                      คลิกเพื่อ{isImageZoomed ? "ย่อ" : "ขยาย"}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Member Info */}
                    <div
                      style={{
                        backgroundColor: "var(--accent)",
                        borderRadius: "12px",
                        padding: "1rem",
                      }}
                    >
                      <h4 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <User style={{ width: "16px", height: "16px" }} />
                        ข้อมูลผู้ชำระ
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--muted)" }}>ชื่อ</span>
                          <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                            {selectedSlip.members?.first_name} {selectedSlip.members?.last_name}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--muted)" }}>รหัสนิสิต</span>
                          <span style={{ fontFamily: "monospace", color: "var(--foreground)" }}>{selectedSlip.members?.student_id}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--muted)" }}>เดือน</span>
                          <span style={{ color: "var(--foreground)" }}>{appConfig.thaiMonths[selectedSlip.payment_month - 1]}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--muted)" }}>จำนวนเงิน</span>
                          <span style={{ fontWeight: 700, color: "#3b82f6" }}>฿{selectedSlip.amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* EasySlip Status */}
                    <div
                      style={{
                        backgroundColor: "var(--accent)",
                        borderRadius: "12px",
                        padding: "1rem",
                      }}
                    >
                      <h4 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <CreditCard style={{ width: "16px", height: "16px" }} />
                        ผล EasySlip
                      </h4>

                      {selectedSlip.slip_trans_ref ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "8px",
                              backgroundColor: "rgba(34, 197, 94, 0.15)",
                              color: "#22c55e",
                            }}
                          >
                            <CheckCircle2 style={{ width: "16px", height: "16px" }} />
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>ตรวจสอบอัตโนมัติผ่าน</span>
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                            <span>เลขอ้างอิง: </span>
                            <span style={{ fontFamily: "monospace", color: "var(--foreground)" }}>{selectedSlip.slip_trans_ref}</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            backgroundColor: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                          }}
                        >
                          <AlertTriangle style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }} />
                          <div>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>ต้องตรวจสอบด้วยตนเอง</span>
                            <p style={{ fontSize: "0.75rem", marginTop: "2px", opacity: 0.8 }}>กรุณาตรวจสอบข้อมูลจาก Slip</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                      <button
                        onClick={() => setShowRejectDialog(true)}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          border: "none",
                          color: "white",
                          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          opacity: isProcessing ? 0.7 : 1,
                        }}
                      >
                        <XCircle style={{ width: "18px", height: "18px" }} />
                        ปฏิเสธ
                      </button>
                      <button
                        onClick={() => handleVerify(selectedSlip.id, true)}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          border: "none",
                          color: "white",
                          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          opacity: isProcessing ? 0.7 : 1,
                        }}
                      >
                        {isProcessing ? (
                          <RefreshCw style={{ width: "18px", height: "18px", animation: "spin 0.6s linear infinite" }} />
                        ) : (
                          <CheckCircle2 style={{ width: "18px", height: "18px" }} />
                        )}
                        ยืนยัน
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Dialog */}
      <AnimatePresence>
        {showRejectDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: "100%",
                maxWidth: "400px",
                borderRadius: "20px",
                backgroundColor: "var(--card)",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <AlertTriangle style={{ width: "32px", height: "32px", color: "#ef4444" }} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>ปฏิเสธ Slip นี้?</h3>
              <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>ระบบจะแจ้งเตือนผู้ใช้ให้อัปโหลด Slip ใหม่</p>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setShowRejectDialog(false)}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => selectedSlip && handleVerify(selectedSlip.id, false)}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "white",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    opacity: isProcessing ? 0.7 : 1,
                  }}
                >
                  {isProcessing ? "กำลังดำเนินการ..." : "ปฏิเสธ"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
