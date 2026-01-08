"use client";
// =============================================================================
// Status Page Content - Check Payment Status
// =============================================================================

import React, { useState } from "react";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { useNotification } from "@/providers/notification-provider";

interface PaymentStatus {
  studentId: string;
  fullName: string;
  nickname: string;
  cohortName: string;
  academicYear: number;
  monthlyFee: number;
  months: {
    month: number;
    status: "paid" | "pending" | "unpaid" | "future";
    amount?: number;
    paidAt?: string;
  }[];
  totalPaid: number;
  totalDue: number;
  penaltyAmount: number;
}

export default function StatusPageContent() {
  const { error } = useNotification();
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<PaymentStatus | null>(null);

  const currentYear = new Date().getFullYear() % 100 + 43;
  const currentMonth = new Date().getMonth() + 1;

  const handleSearch = async () => {
    if (!studentId.trim()) {
      error("กรุณากรอกรหัสนิสิต");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual status lookup
      // For now, simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - in production this would come from the server
      const mockMonths = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const isFuture = month > currentMonth;
        const isPaid = Math.random() > 0.3 && !isFuture;
        const isPending = !isPaid && !isFuture && Math.random() > 0.7;

        return {
          month,
          status: isFuture
            ? "future" as const
            : isPaid
            ? "paid" as const
            : isPending
            ? "pending" as const
            : "unpaid" as const,
          amount: isPaid ? 70 : undefined,
          paidAt: isPaid ? new Date().toISOString() : undefined,
        };
      });

      const unpaidCount = mockMonths.filter(
        (m) => m.status === "unpaid"
      ).length;

      setStatus({
        studentId: studentId,
        fullName: "นาย ทดสอบ ระบบ",
        nickname: "ทดสอบ",
        cohortName: "รุ่นที่ 30",
        academicYear: currentYear,
        monthlyFee: 70,
        months: mockMonths,
        totalPaid: mockMonths.filter((m) => m.status === "paid").length * 70,
        totalDue: unpaidCount * 70,
        penaltyAmount: unpaidCount > 0 ? (unpaidCount * 10) - 10 : 0,
      });
    } catch (err) {
      error("ไม่พบข้อมูล", "กรุณาตรวจสอบรหัสนิสิตใหม่อีกครั้ง");
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: "paid" | "pending" | "unpaid" | "future") => {
    switch (status) {
      case "paid":
        return (
          <span className="payment-cell-paid">
            ✓
          </span>
        );
      case "pending":
        return (
          <span className="payment-cell-pending">
            ...
          </span>
        );
      case "unpaid":
        return (
          <span className="payment-cell-unpaid">
            ✗
          </span>
        );
      case "future":
        return (
          <span className="payment-cell-future">
            -
          </span>
        );
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
          
          <Link href="/pay" className="btn-primary btn-sm">
            แจ้งชำระเงิน
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Search Card */}
        <div className="card p-6 md:p-8 mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2">ตรวจสอบสถานะการชำระ</h1>
          <p className="text-muted mb-6">
            กรอกรหัสนิสิตเพื่อดูสถานะการชำระเงินของคุณ
          </p>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="รหัสนิสิต เช่น 65xxxxxx"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 font-mono text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">ค้นหา</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Result */}
        {status && (
          <div className="space-y-6 animate-slide-up">
            {/* Member Info */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="avatar avatar-lg">
                  {status.nickname.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{status.fullName}</h2>
                  <p className="text-muted">
                    <span className="font-mono">{status.studentId}</span> • {status.cohortName}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card text-center">
                <div className="stat-value text-green-600 dark:text-green-400">
                  ฿{status.totalPaid.toLocaleString()}
                </div>
                <div className="stat-label">ชำระแล้ว</div>
              </div>
              
              <div className="stat-card text-center">
                <div className="stat-value text-red-600 dark:text-red-400">
                  ฿{(status.totalDue + status.penaltyAmount).toLocaleString()}
                </div>
                <div className="stat-label">ค้างชำระ</div>
              </div>
              
              <div className="stat-card text-center">
                <div className="stat-value text-yellow-600 dark:text-yellow-400">
                  ฿{status.penaltyAmount.toLocaleString()}
                </div>
                <div className="stat-label">ค่าปรับ</div>
              </div>
            </div>

            {/* Monthly Status Grid */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">
                สถานะรายเดือน (ปี {status.academicYear})
              </h3>
              
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {status.months.map((m) => (
                  <div
                    key={m.month}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="text-xs text-muted">
                      {appConfig.thaiMonthsShort[m.month - 1]}
                    </span>
                    {getStatusBadge(m.status)}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border text-sm">
                <div className="flex items-center gap-2">
                  <div className="payment-cell-paid w-6 h-6 text-xs">✓</div>
                  <span>ชำระแล้ว</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="payment-cell-pending w-6 h-6 text-xs">...</div>
                  <span>รอตรวจสอบ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="payment-cell-unpaid w-6 h-6 text-xs">✗</div>
                  <span>ค้างชำระ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="payment-cell-future w-6 h-6 text-xs">-</div>
                  <span>ยังไม่ถึงกำหนด</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {status.totalDue > 0 && (
              <div className="alert-warning">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium">คุณมียอดค้างชำระ</p>
                  <p className="text-sm">
                    ยอดที่ต้องจ่าย: ฿{(status.totalDue + status.penaltyAmount).toLocaleString()}
                    {status.penaltyAmount > 0 && (
                      <span className="text-xs"> (รวมค่าปรับ ฿{status.penaltyAmount})</span>
                    )}
                  </p>
                </div>
                <Link href="/pay" className="btn-primary btn-sm whitespace-nowrap">
                  ชำระเลย
                </Link>
              </div>
            )}

            {status.totalDue === 0 && (
              <div className="alert-success">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">ชำระครบถ้วนแล้ว! 🎉</p>
                  <p className="text-sm">ขอบคุณที่ชำระค่าธรรมเนียมตรงเวลา</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!status && !isLoading && (
          <div className="text-center py-12 text-muted">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p>กรอกรหัสนิสิตเพื่อตรวจสอบสถานะ</p>
          </div>
        )}
      </main>
    </div>
  );
}
