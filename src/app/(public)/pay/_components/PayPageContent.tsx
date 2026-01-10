"use client";
// =============================================================================
// Pay Page Content - Real-time Validation + QR Payment + Supabase Integration
// Design: User-centric, Interactive, No upload needed
// Best practices: Next.js 15+, Tailwind 4.0 Inline Styles
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  CreditCard,
  QrCode,
  Smartphone,
  Copy,
  CheckCircle2,
  Loader2,
  Home,
  Search,
  AlertCircle,
  User,
  Calendar,
  Sparkles
} from "lucide-react";
import { appConfig } from "@/config/app.config";
import { useNotification } from "@/providers/notification-provider";
import { 
  lookupMember, 
  getMemberPaymentStatus,
  createPaymentTransaction,
  type MemberLookupResult 
} from "../../_actions/public-actions";

// =============================================================================
// Animation Variants
// =============================================================================
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// =============================================================================
// Types
// =============================================================================
type Step = "input" | "months" | "payment" | "waiting" | "success";

interface MonthPaymentInfo {
  month: number;
  status: "paid" | "pending" | "unpaid" | "future";
  amount?: number;
}

// =============================================================================
// Main Component
// =============================================================================
export default function PayPageContent() {
  const { success, error: showError } = useNotification();
  const [mounted, setMounted] = useState(false);
  
  // Flow states
  const [step, setStep] = useState<Step>("input");
  const [studentId, setStudentId] = useState("");
  const [memberInfo, setMemberInfo] = useState<MemberLookupResult["member"] | null>(null);
  const [monthsData, setMonthsData] = useState<MonthPaymentInfo[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  
  // Loading & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<"idle" | "valid" | "invalid" | "checking">("idle");
  const [validationMessage, setValidationMessage] = useState("");
  
  // Payment states
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Year selection
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [checkInterval]);

  const currentMonth = new Date().getMonth() + 1;
  const totalAmount = selectedMonths.length * (memberInfo?.monthlyFee || appConfig.payment.defaultMonthlyFee);

  // =============================================================================
  // Real-time Student ID Validation (Debounced)
  // =============================================================================
  const validateStudentId = useCallback(async (id: string) => {
    if (!id || id.length !== 8) {
      setValidationResult("idle");
      setValidationMessage("");
      return;
    }

    setIsValidating(true);
    setValidationResult("checking");
    setValidationMessage("กำลังตรวจสอบ...");

    try {
      const result = await lookupMember(id);
      
      if (result.success && result.member) {
        setValidationResult("valid");
        setValidationMessage(`✓ ${result.member.fullName} (${result.member.cohortName})`);
        setMemberInfo(result.member);
      } else {
        setValidationResult("invalid");
        setValidationMessage(result.error || "ไม่พบข้อมูล");
        setMemberInfo(null);
      }
    } catch {
      setValidationResult("invalid");
      setValidationMessage("เกิดข้อผิดพลาดในการตรวจสอบ");
      setMemberInfo(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Debounced validation on input change
  const handleStudentIdChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 8);
    setStudentId(cleaned);
    setValidationResult("idle");
    setValidationMessage("");
    setMemberInfo(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (cleaned.length === 8) {
      debounceRef.current = setTimeout(() => {
        validateStudentId(cleaned);
      }, 500);
    }
  };

  // =============================================================================
  // Step 1: Proceed to Month Selection
  // =============================================================================
  const handleProceedToMonths = async () => {
    if (!memberInfo) {
      showError("กรุณากรอกรหัสนิสิต", "และรอการตรวจสอบ");
      return;
    }

    setIsLoading(true);
    try {
      const result = await getMemberPaymentStatus(studentId, selectedYear);
      
      if (!result.success) {
        showError("เกิดข้อผิดพลาด", result.error || "ไม่สามารถดึงข้อมูลได้");
        return;
      }

      // Build months data
      const months: MonthPaymentInfo[] = [];
      for (let i = 0; i < 12; i++) {
        const month = i + 1;
        const payment = result.payments?.find(p => p.month === month);
        const isFuture = month > currentMonth && selectedYear === currentYear;

        let status: MonthPaymentInfo["status"];
        if (isFuture) {
          status = "future";
        } else if (payment?.status === "verified") {
          status = "paid";
        } else if (payment?.status === "pending") {
          status = "pending";
        } else {
          status = "unpaid";
        }

        months.push({ month, status, amount: payment?.amount });
      }

      setMonthsData(months);
      setStep("months");
    } catch (err) {
      console.error(err);
      showError("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // Step 2: Month Selection
  // =============================================================================
  const handleMonthToggle = (month: number) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month].sort((a, b) => a - b)
    );
  };

  const handleSelectAllUnpaid = () => {
    const unpaidMonths = monthsData
      .filter(m => m.status === "unpaid")
      .map(m => m.month);
    setSelectedMonths(unpaidMonths);
  };

  // =============================================================================
  // Step 3: Start Payment
  // =============================================================================
  const handleStartPayment = async () => {
    if (selectedMonths.length === 0) {
      showError("กรุณาเลือกเดือน", "เลือกเดือนที่ต้องการชำระ");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createPaymentTransaction(studentId, selectedMonths, selectedYear);
      
      if (!result.success) {
        showError("ไม่สามารถสร้างรายการได้", result.error || "ลองใหม่อีกครั้ง");
        return;
      }

      setStep("payment");
    } catch {
      showError("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // Step 4: Confirm Payment & Auto-check
  // =============================================================================
  const handleConfirmPayment = () => {
    setStep("waiting");
    
    // Start polling for payment verification
    const interval = setInterval(async () => {
      // In production, check payment status via EasySlip
      // For demo, auto-success after 5s
    }, 3000);
    
    setCheckInterval(interval);
    
    // Demo: Auto success after 5 seconds
    setTimeout(() => {
      if (interval) clearInterval(interval);
      setStep("success");
      success("ชำระเงินสำเร็จ!", "ระบบตรวจพบการโอนเงินแล้ว");
    }, 5000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(appConfig.defaultBank.accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // =============================================================================
  // Render
  // =============================================================================
  if (!mounted) return null;

  const getValidationStyle = () => {
    switch (validationResult) {
      case "valid":
        return { borderColor: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.05)" };
      case "invalid":
        return { borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.05)" };
      case "checking":
        return { borderColor: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.05)" };
      default:
        return { borderColor: "var(--border)", backgroundColor: "var(--accent)" };
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--background)", paddingTop: "2rem" }}>
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "0 1rem 2rem" }}>
        {/* Progress Steps */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>
          {["input", "months", "payment", "success"].map((s, i) => {
            const stepOrder = ["input", "months", "payment", "success"];
            const currentIndex = stepOrder.indexOf(step === "waiting" ? "payment" : step);
            const isActive = i <= currentIndex;
            const isComplete = i < currentIndex;
            
            return (
              <React.Fragment key={s}>
                <div 
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    backgroundColor: isActive ? "#3b82f6" : "var(--accent)",
                    color: isActive ? "white" : "var(--muted)",
                    transition: "all 0.3s",
                  }}
                >
                  {isComplete ? <Check style={{ width: "18px", height: "18px" }} /> : i + 1}
                </div>
                {i < 3 && (
                  <div 
                    style={{
                      width: "48px",
                      height: "4px",
                      borderRadius: "2px",
                      backgroundColor: i < currentIndex ? "#3b82f6" : "var(--accent)",
                      transition: "all 0.3s",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Input Student ID with Real-time Validation */}
          {step === "input" && (
            <motion.div
              key="input"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "2rem",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div 
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 1rem",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CreditCard style={{ width: "32px", height: "32px", color: "white" }} />
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                  ชำระเงินกองกลาง
                </h1>
                <p style={{ color: "var(--muted)" }}>กรอกรหัสนิสิตเพื่อเริ่มต้น</p>
              </div>

              {/* Student ID Input with Real-time Validation */}
              <div style={{ marginBottom: "1rem" }}>
                <label 
                  htmlFor="studentId"
                  style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--foreground)" }}
                >
                  รหัสนิสิต
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="studentId"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    placeholder="เช่น 66360001"
                    value={studentId}
                    onChange={(e) => handleStudentIdChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && validationResult === "valid" && handleProceedToMonths()}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      paddingRight: "3rem",
                      fontSize: "1.25rem",
                      fontFamily: "monospace",
                      textAlign: "center",
                      letterSpacing: "0.1em",
                      border: "2px solid",
                      borderRadius: "12px",
                      color: "var(--foreground)",
                      outline: "none",
                      transition: "all 0.2s",
                      ...getValidationStyle(),
                    }}
                  />
                  <div 
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {isValidating && (
                      <Loader2 style={{ width: "20px", height: "20px", color: "#3b82f6", animation: "spin 1s linear infinite" }} />
                    )}
                    {validationResult === "valid" && (
                      <CheckCircle2 style={{ width: "20px", height: "20px", color: "#22c55e" }} />
                    )}
                    {validationResult === "invalid" && (
                      <AlertCircle style={{ width: "20px", height: "20px", color: "#ef4444" }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Message */}
              {validationMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    marginBottom: "1.5rem",
                    backgroundColor: validationResult === "valid" 
                      ? "rgba(34, 197, 94, 0.1)" 
                      : validationResult === "invalid"
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(59, 130, 246, 0.1)",
                  }}
                >
                  {validationResult === "valid" && <User style={{ width: "18px", height: "18px", color: "#22c55e" }} />}
                  {validationResult === "invalid" && <AlertCircle style={{ width: "18px", height: "18px", color: "#ef4444" }} />}
                  {validationResult === "checking" && <Sparkles style={{ width: "18px", height: "18px", color: "#3b82f6" }} />}
                  <span 
                    style={{ 
                      fontSize: "0.875rem",
                      color: validationResult === "valid" 
                        ? "#15803d" 
                        : validationResult === "invalid" 
                          ? "#dc2626"
                          : "#3b82f6",
                      fontWeight: 500,
                    }}
                  >
                    {validationMessage}
                  </span>
                </motion.div>
              )}

              <button
                onClick={handleProceedToMonths}
                disabled={isLoading || validationResult !== "valid"}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "12px",
                  border: "none",
                  background: validationResult === "valid" 
                    ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                    : "var(--accent)",
                  color: validationResult === "valid" ? "white" : "var(--muted)",
                  cursor: validationResult === "valid" ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isLoading ? (
                  <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <>ถัดไป</>
                )}
              </button>
            </motion.div>
          )}

          {/* Step 2: Select Months */}
          {step === "months" && memberInfo && (
            <motion.div
              key="months"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "2rem",
              }}
            >
              <button
                onClick={() => { setStep("input"); setSelectedMonths([]); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  padding: "0.5rem",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                <ArrowLeft style={{ width: "16px", height: "16px" }} />
                ย้อนกลับ
              </button>

              {/* Member Info */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  backgroundColor: "var(--accent)",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                }}
              >
                <div 
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {memberInfo.nickname.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{memberInfo.fullName}</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                    {studentId} • {memberInfo.cohortName}
                  </p>
                </div>
              </div>

              {/* Year Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Calendar style={{ width: "18px", height: "18px", color: "var(--muted)" }} />
                <span style={{ fontWeight: 500, color: "var(--foreground)" }}>ปี:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setSelectedMonths([]);
                    // Reload months data
                    handleProceedToMonths();
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    cursor: "pointer",
                  }}
                >
                  {[currentYear, currentYear - 1].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
                เลือกเดือนที่ต้องการชำระ
              </h2>

              {/* Quick Select All Unpaid */}
              {monthsData.filter(m => m.status === "unpaid").length > 1 && (
                <button
                  onClick={handleSelectAllUnpaid}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    backgroundColor: selectedMonths.length === monthsData.filter(m => m.status === "unpaid").length 
                      ? "rgba(34, 197, 94, 0.15)" 
                      : "var(--accent)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle2 
                    style={{ 
                      width: "16px", 
                      height: "16px", 
                      display: "inline", 
                      marginRight: "0.5rem",
                      color: selectedMonths.length === monthsData.filter(m => m.status === "unpaid").length ? "#22c55e" : "var(--muted)"
                    }} 
                  />
                  เลือกทั้งหมดที่ค้างชำระ ({monthsData.filter(m => m.status === "unpaid").length} เดือน)
                </button>
              )}

              {/* Month Grid - Interactive */}
              <div 
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                {monthsData.map((m) => {
                  const canSelect = m.status === "unpaid";
                  const isSelected = selectedMonths.includes(m.month);
                  
                  return (
                    <button
                      key={m.month}
                      onClick={() => canSelect && handleMonthToggle(m.month)}
                      disabled={!canSelect}
                      style={{
                        padding: "0.75rem 0.5rem",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #3b82f6" : "1px solid var(--border)",
                        backgroundColor: isSelected 
                          ? "rgba(59, 130, 246, 0.15)" 
                          : m.status === "future"
                            ? "var(--accent)"
                            : m.status === "paid"
                              ? "rgba(34, 197, 94, 0.1)"
                              : m.status === "pending"
                                ? "rgba(245, 158, 11, 0.1)"
                                : "var(--card)",
                        color: m.status === "future" 
                          ? "var(--muted)" 
                          : m.status === "paid"
                            ? "#22c55e"
                            : m.status === "pending"
                              ? "#f59e0b"
                              : isSelected 
                                ? "#3b82f6" 
                                : "var(--foreground)",
                        cursor: canSelect ? "pointer" : "default",
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: "0.8125rem",
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {appConfig.thaiMonthsShort[m.month - 1]}
                      {m.status === "paid" && <Check style={{ width: "14px", height: "14px" }} />}
                      {m.status === "pending" && <Clock style={{ width: "14px", height: "14px" }} />}
                      {m.status === "paid" && m.amount && (
                        <span style={{ fontSize: "0.625rem" }}>฿{m.amount}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                  <span style={{ color: "var(--muted)" }}>ชำระแล้ว</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
                  <span style={{ color: "var(--muted)" }}>รอตรวจสอบ</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                  <span style={{ color: "var(--muted)" }}>ค้างชำระ</span>
                </div>
              </div>

              {/* Amount Summary */}
              <div 
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--accent)",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--muted)" }}>จำนวนเดือน</span>
                  <span style={{ fontWeight: 500, color: "var(--foreground)" }}>{selectedMonths.length} เดือน</span>
                </div>
                <div 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--foreground)" }}>ยอดที่ต้องโอน</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>
                    ฿{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartPayment}
                disabled={selectedMonths.length === 0 || isLoading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "12px",
                  border: "none",
                  background: selectedMonths.length > 0 
                    ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                    : "var(--accent)",
                  color: selectedMonths.length > 0 ? "white" : "var(--muted)",
                  cursor: selectedMonths.length > 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isLoading ? (
                  <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <>
                    <QrCode style={{ width: "20px", height: "20px" }} />
                    ไปหน้าชำระเงิน
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Step 3 & 4: Payment & Waiting */}
          {(step === "payment" || step === "waiting") && (
            <motion.div
              key="payment"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              {step === "payment" && (
                <button
                  onClick={() => setStep("months")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                    padding: "0.5rem",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  <ArrowLeft style={{ width: "16px", height: "16px" }} />
                  ย้อนกลับ
                </button>
              )}

              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                {step === "waiting" ? "กำลังตรวจสอบการโอน..." : "สแกน QR เพื่อโอนเงิน"}
              </h2>
              <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
                {step === "waiting" 
                  ? "ระบบกำลังตรวจสอบการโอนอัตโนมัติ กรุณารอสักครู่" 
                  : `ยอดโอน ฿${totalAmount.toLocaleString()}`
                }
              </p>

              {/* QR Code */}
              <div 
                style={{
                  width: "200px",
                  height: "200px",
                  margin: "0 auto 1.5rem",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--border)",
                }}
              >
                {step === "waiting" ? (
                  <>
                    <Loader2 style={{ width: "48px", height: "48px", color: "#3b82f6", animation: "spin 1s linear infinite" }} />
                    <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#64748b" }}>กำลังตรวจสอบ...</p>
                  </>
                ) : (
                  <>
                    <QrCode style={{ width: "120px", height: "120px", color: "#1e293b" }} />
                    <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#64748b" }}>PromptPay QR</p>
                  </>
                )}
              </div>

              {/* Bank Info */}
              <div 
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--accent)",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>ธนาคาร</p>
                    <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{appConfig.defaultBank.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>เลขบัญชี</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <p style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--foreground)" }}>
                        {appConfig.defaultBank.accountNo}
                      </p>
                      <button 
                        onClick={handleCopyAccount}
                        style={{ 
                          padding: "4px", 
                          backgroundColor: "transparent", 
                          border: "none", 
                          cursor: "pointer",
                          color: copied ? "#22c55e" : "var(--muted)",
                        }}
                      >
                        {copied ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>ชื่อบัญชี</p>
                  <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{appConfig.defaultBank.accountName}</p>
                </div>
              </div>

              {step === "payment" && (
                <button
                  onClick={handleConfirmPayment}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <Smartphone style={{ width: "20px", height: "20px" }} />
                  โอนเงินแล้ว
                </button>
              )}

              {step === "waiting" && (
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1rem",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "12px",
                    color: "#3b82f6",
                  }}
                >
                  <Clock style={{ width: "20px", height: "20px" }} />
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontWeight: 600 }}>รอการตรวจสอบอัตโนมัติ</p>
                    <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>ระบบจะแจ้งผลภายใน 1-5 นาที</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={scaleIn}
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div 
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 1.5rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 style={{ width: "40px", height: "40px", color: "#22c55e" }} />
              </div>

              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                ชำระเงินสำเร็จ! 🎉
              </h2>
              <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
                ระบบตรวจพบการโอนเงินเรียบร้อยแล้ว
              </p>

              <div 
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--accent)",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                }}
              >
                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>รหัสนิสิต</p>
                  <p style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--foreground)" }}>{studentId}</p>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>จำนวนเงิน</p>
                  <p style={{ fontWeight: 600, color: "#22c55e" }}>฿{totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>เดือนที่ชำระ</p>
                  <p style={{ fontWeight: 500, color: "var(--foreground)" }}>
                    {selectedMonths.map(m => appConfig.thaiMonthsShort[m - 1]).join(", ")}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <Link 
                  href="/status"
                  style={{
                    flex: 1,
                    padding: "1rem",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Search style={{ width: "18px", height: "18px" }} />
                  ดูสถานะ
                </Link>
                <Link 
                  href="/"
                  style={{
                    flex: 1,
                    padding: "1rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Home style={{ width: "18px", height: "18px" }} />
                  หน้าแรก
                </Link>
              </div>
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
