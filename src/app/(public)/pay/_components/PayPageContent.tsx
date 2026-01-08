"use client";
// =============================================================================
// Pay Page Content - Payment Submission Form
// =============================================================================

import React, { useState } from "react";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { SlipUploader } from "@/components/payments";
import { useNotification } from "@/providers/notification-provider";

interface FormData {
  studentId: string;
  fullName: string;
  amount: number;
  selectedMonths: number[];
  slipFile: File | null;
  slipPreview: string;
}

export default function PayPageContent() {
  const { success, error } = useNotification();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    studentId: "",
    fullName: "",
    amount: appConfig.payment.defaultMonthlyFee,
    selectedMonths: [],
    slipFile: null,
    slipPreview: "",
  });

  // Get current academic year (Thai format: 68, 69, etc.)
  const currentYear = new Date().getFullYear() % 100 + 43; // Convert to Buddhist Era short
  const currentMonth = new Date().getMonth() + 1;

  // Generate month options for current academic year
  const monthOptions = appConfig.thaiMonths.map((name, index) => ({
    value: index + 1,
    label: name,
    isPast: index + 1 < currentMonth,
  }));

  const handleMonthToggle = (month: number) => {
    setFormData((prev) => {
      const isSelected = prev.selectedMonths.includes(month);
      const newMonths = isSelected
        ? prev.selectedMonths.filter((m) => m !== month)
        : [...prev.selectedMonths, month].sort((a, b) => a - b);
      
      // Calculate amount
      const baseAmount = newMonths.length * appConfig.payment.defaultMonthlyFee;
      
      return {
        ...prev,
        selectedMonths: newMonths,
        amount: baseAmount,
      };
    });
  };

  const handleSlipUpload = (file: File, preview: string) => {
    setFormData((prev) => ({
      ...prev,
      slipFile: file,
      slipPreview: preview,
    }));
  };

  const handleSlipRemove = () => {
    setFormData((prev) => ({
      ...prev,
      slipFile: null,
      slipPreview: "",
    }));
  };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.selectedMonths.length || !formData.slipFile) {
      error("กรุณากรอกข้อมูลให้ครบ", "ตรวจสอบรหัสนิสิต เดือนที่จ่าย และ Slip");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual payment submission
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      success(
        "แจ้งชำระเงินสำเร็จ!",
        "รอการตรวจสอบจากเหรัญญิก โดยปกติใช้เวลา 1-2 วัน"
      );
      
      setStep(3); // Show success step
    } catch (err) {
      error("เกิดข้อผิดพลาด", "กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
              💰
            </div>
            <span className="font-bold text-foreground">{appConfig.name}</span>
          </Link>
          
          <Link href="/status" className="btn-ghost btn-sm">
            ตรวจสอบสถานะ
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? "bg-primary-500 text-white"
                      : "bg-muted/20 text-muted"
                  }`}
                >
                  {s === 3 && step === 3 ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-1 rounded transition-all ${
                      step > s ? "bg-primary-500" : "bg-muted/20"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Select Member & Months */}
        {step === 1 && (
          <div className="card p-6 md:p-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">แจ้งชำระเงิน</h1>
            
            {/* Student ID */}
            <div className="mb-6">
              <label htmlFor="studentId">รหัสนิสิต</label>
              <input
                id="studentId"
                type="text"
                placeholder="เช่น 65xxxxxx"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, studentId: e.target.value }))
                }
                className="font-mono text-lg"
              />
            </div>

            {/* Name (optional) */}
            <div className="mb-6">
              <label htmlFor="fullName">ชื่อ-นามสกุล (ไม่จำเป็น)</label>
              <input
                id="fullName"
                type="text"
                placeholder="เพื่อยืนยันตัวตน"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </div>

            {/* Month Selection */}
            <div className="mb-6">
              <label>เลือกเดือนที่ต้องการจ่าย (ปี {currentYear})</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {monthOptions.map((month) => {
                  const isSelected = formData.selectedMonths.includes(month.value);
                  
                  return (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() => handleMonthToggle(month.value)}
                      className={`
                        py-3 px-2 rounded-lg text-sm font-medium transition-all
                        ${isSelected
                          ? "bg-primary-500 text-white shadow-md scale-105"
                          : "bg-muted/10 text-foreground hover:bg-muted/20"
                        }
                      `}
                    >
                      {month.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Display */}
            <div className="bg-muted/5 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted">จำนวนเดือน</span>
                <span className="font-semibold">
                  {formData.selectedMonths.length} เดือน
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="font-medium">ยอดที่ต้องโอน</span>
                <span className="text-2xl font-bold text-primary-600">
                  ฿{formData.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Note about late fee */}
            <div className="alert-warning mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">หมายเหตุ</p>
                <p className="text-sm">
                  หากจ่ายค้างชำระ จะมีค่าปรับ {appConfig.payment.defaultPenaltyFee} บาท/เดือน
                  (รวมเป็น {appConfig.payment.defaultMonthlyFee + appConfig.payment.defaultPenaltyFee} บาท/เดือน)
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.studentId || !formData.selectedMonths.length}
              className="btn-primary w-full"
            >
              ถัดไป: อัปโหลด Slip
            </button>
          </div>
        )}

        {/* Step 2: Upload Slip */}
        {step === 2 && (
          <div className="card p-6 md:p-8 animate-fade-in">
            <button
              onClick={() => setStep(1)}
              className="btn-ghost btn-sm mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </button>
            
            <h2 className="text-2xl font-bold mb-2">อัปโหลด Slip</h2>
            <p className="text-muted mb-6">
              โอนเงิน ฿{formData.amount.toLocaleString()} แล้วอัปโหลดหลักฐาน
            </p>

            {/* Bank Info */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted">ธนาคาร</p>
                  <p className="font-semibold text-primary-700 dark:text-primary-300">
                    {appConfig.defaultBank.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">เลขบัญชี</p>
                  <p className="font-mono font-semibold text-primary-700 dark:text-primary-300">
                    {appConfig.defaultBank.accountNo}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted">ชื่อบัญชี</p>
                  <p className="font-semibold text-primary-700 dark:text-primary-300">
                    {appConfig.defaultBank.accountName}
                  </p>
                </div>
              </div>
            </div>

            {/* Slip Uploader */}
            <div className="mb-6">
              <SlipUploader
                onUpload={handleSlipUpload}
                onRemove={handleSlipRemove}
                preview={formData.slipPreview}
                isLoading={isSubmitting}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!formData.slipFile || isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ยืนยันการชำระเงิน
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="card p-6 md:p-8 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">แจ้งชำระเงินสำเร็จ!</h2>
            <p className="text-muted mb-6">
              รหัสนิสิต: <span className="font-mono font-semibold">{formData.studentId}</span>
              <br />
              จำนวน: <span className="font-semibold">฿{formData.amount.toLocaleString()}</span>
              <br />
              เดือน: <span className="font-semibold">
                {formData.selectedMonths.map(m => appConfig.thaiMonthsShort[m - 1]).join(", ")}
              </span>
            </p>

            <div className="alert-info mb-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <p className="font-medium">รอตรวจสอบ</p>
                <p className="text-sm">
                  เหรัญญิกจะตรวจสอบ Slip และอัปเดตสถานะภายใน 1-2 วัน
                  สามารถตรวจสอบได้ที่หน้า "ตรวจสอบสถานะ"
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/status" className="btn-primary flex-1">
                ตรวจสอบสถานะ
              </Link>
              <Link href="/" className="btn-secondary flex-1">
                กลับหน้าแรก
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
