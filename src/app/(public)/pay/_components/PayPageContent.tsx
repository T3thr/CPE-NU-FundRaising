"use client";
// =============================================================================
// Pay Page Content - User-Centric Payment Flow
// Design: ง่าย, รวดเร็ว, ไม่ต้อง upload slip (Auto-detect via EasySlip)
// =============================================================================

import React, { useState, useEffect } from "react";
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
  Search
} from "lucide-react";
import { appConfig } from "@/config/app.config";
import { useNotification } from "@/providers/notification-provider";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// Flow: 1. กรอกรหัสนิสิต → 2. เลือกเดือน → 3. สแกน QR → 4. รอระบบตรวจสอบอัตโนมัติ
type Step = "input" | "months" | "payment" | "waiting" | "success";

export default function PayPageContent() {
  const { success, error } = useNotification();
  const [mounted, setMounted] = useState(false);
  
  const [step, setStep] = useState<Step>("input");
  const [studentId, setStudentId] = useState("");
  const [memberInfo, setMemberInfo] = useState<{
    fullName: string;
    nickname: string;
    cohortName: string;
    unpaidMonths: number[];
  } | null>(null);
  
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [checkInterval]);

  const currentMonth = new Date().getMonth() + 1;
  const totalAmount = selectedMonths.length * appConfig.payment.defaultMonthlyFee;

  // Step 1: ค้นหาข้อมูลสมาชิก
  const handleLookup = async () => {
    if (!studentId.trim() || studentId.length !== 8) {
      error("รหัสนิสิตไม่ถูกต้อง", "กรุณากรอกรหัสนิสิต 8 หลัก");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(r => setTimeout(r, 1000));
      
      // Mock member data
      setMemberInfo({
        fullName: "นาย สมชาย ใจดี",
        nickname: "ชาย",
        cohortName: "CPE รุ่นที่ 32",
        unpaidMonths: [1, 2, 3].filter(m => m <= currentMonth),
      });
      
      setStep("months");
    } catch {
      error("ไม่พบข้อมูล", "ตรวจสอบรหัสนิสิตอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: เลือกเดือน
  const handleMonthToggle = (month: number) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    if (memberInfo) {
      setSelectedMonths([...memberInfo.unpaidMonths]);
    }
  };

  // Step 3: สร้าง Transaction และเริ่ม Polling
  const handleStartPayment = async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setStep("payment");
    } catch {
      error("เกิดข้อผิดพลาด", "ลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: เริ่ม Auto-check
  const handleConfirmPayment = () => {
    setStep("waiting");
    
    const interval = setInterval(async () => {
      try {
        // TODO: Check payment status from EasySlip
      } catch (e) {
        console.error("Check error:", e);
      }
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

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", backgroundColor: "var(--background)", paddingTop: "2rem" }}>
      {/* Main Content */}
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
          {/* Step 1: Input Student ID */}
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

              <div style={{ marginBottom: "1.5rem" }}>
                <label 
                  htmlFor="studentId"
                  style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "var(--foreground)" }}
                >
                  รหัสนิสิต
                </label>
                <input
                  id="studentId"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  placeholder="เช่น 65360001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    fontSize: "1.25rem",
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
              </div>

              <button
                onClick={handleLookup}
                disabled={isLoading || studentId.length !== 8}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1rem",
                  fontWeight: 600,
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
                onClick={() => setStep("input")}
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

              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
                เลือกเดือนที่ต้องการชำระ
              </h2>

              {/* Quick Select */}
              {memberInfo.unpaidMonths.length > 1 && (
                <button
                  onClick={handleSelectAll}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "1rem",
                    backgroundColor: selectedMonths.length === memberInfo.unpaidMonths.length 
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
                      color: selectedMonths.length === memberInfo.unpaidMonths.length ? "#22c55e" : "var(--muted)"
                    }} 
                  />
                  เลือกทั้งหมด ({memberInfo.unpaidMonths.length} เดือน = ฿{memberInfo.unpaidMonths.length * appConfig.payment.defaultMonthlyFee})
                </button>
              )}

              {/* Month Grid */}
              <div 
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                {appConfig.thaiMonths.map((monthName, index) => {
                  const month = index + 1;
                  const isUnpaid = memberInfo.unpaidMonths.includes(month);
                  const isSelected = selectedMonths.includes(month);
                  const isFuture = month > currentMonth;
                  const canSelect = isUnpaid && !isFuture;
                  
                  return (
                    <button
                      key={month}
                      onClick={() => canSelect && handleMonthToggle(month)}
                      disabled={!canSelect}
                      style={{
                        padding: "0.875rem 0.5rem",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #3b82f6" : "1px solid var(--border)",
                        backgroundColor: isSelected 
                          ? "rgba(59, 130, 246, 0.15)" 
                          : isFuture 
                            ? "var(--accent)" 
                            : !isUnpaid 
                              ? "rgba(34, 197, 94, 0.1)" 
                              : "var(--card)",
                        color: isFuture 
                          ? "var(--muted)" 
                          : !isUnpaid 
                            ? "#22c55e" 
                            : isSelected 
                              ? "#3b82f6" 
                              : "var(--foreground)",
                        cursor: canSelect ? "pointer" : "default",
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: "0.875rem",
                      }}
                    >
                      {monthName}
                      {!isUnpaid && !isFuture && (
                        <Check style={{ width: "14px", height: "14px", marginLeft: "4px", display: "inline" }} />
                      )}
                    </button>
                  );
                })}
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

          {/* Step 3: Payment QR */}
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

              {/* QR Code Placeholder */}
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

          {/* Step 4: Success */}
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
