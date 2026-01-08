"use client";
// =============================================================================
// Payments Content - Payment Grid View
// =============================================================================

import React, { useState } from "react";
import { PaymentGrid, PaymentStats } from "@/components/payments";
import { appConfig } from "@/config/app.config";

// Mock data
const mockMembers = [
  { id: "1", cohort_id: "1", student_id: "65310001", full_name: "สมชาย ใจดี", nickname: "ชาย", email: null, phone: null, line_id: null, is_active: true, created_at: "", updated_at: "" },
  { id: "2", cohort_id: "1", student_id: "65310002", full_name: "สมหญิง รักเรียน", nickname: "หญิง", email: null, phone: null, line_id: null, is_active: true, created_at: "", updated_at: "" },
  { id: "3", cohort_id: "1", student_id: "65310003", full_name: "นายพร้อม เสมอ", nickname: "พร้อม", email: null, phone: null, line_id: null, is_active: true, created_at: "", updated_at: "" },
  { id: "4", cohort_id: "1", student_id: "65310004", full_name: "นางสาว ขยัน ทำงาน", nickname: "ขยัน", email: null, phone: null, line_id: null, is_active: true, created_at: "", updated_at: "" },
  { id: "5", cohort_id: "1", student_id: "65310005", full_name: "นาย เก่ง มาก", nickname: "เก่ง", email: null, phone: null, line_id: null, is_active: true, created_at: "", updated_at: "" },
];

const generateMockPayments = () => {
  const currentMonth = new Date().getMonth() + 1;
  
  return mockMembers.map((member) => {
    const months: Record<number, { status: string; amount: number; paymentId?: string }> = {};
    
    for (let month = 1; month <= 12; month++) {
      if (month > currentMonth) {
        months[month] = { status: "future", amount: 0 };
      } else {
        const rand = Math.random();
        if (rand > 0.3) {
          months[month] = { status: "verified", amount: 70, paymentId: `pay-${member.id}-${month}` };
        } else if (rand > 0.1) {
          months[month] = { status: "pending", amount: 70, paymentId: `pay-${member.id}-${month}` };
        } else {
          months[month] = { status: "unpaid", amount: 0 };
        }
      }
    }
    
    return { member, months };
  });
};

export default function PaymentsContent() {
  const currentYear = new Date().getFullYear() % 100 + 43;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isLoading, setIsLoading] = useState(false);
  
  const paymentsData = generateMockPayments();

  // Calculate stats
  const stats = {
    totalMembers: mockMembers.length,
    paidCount: 0,
    pendingCount: 0,
    unpaidCount: 0,
    totalCollected: 0,
    totalExpected: 0,
  };

  const currentMonth = new Date().getMonth() + 1;
  
  paymentsData.forEach(({ months }) => {
    Object.entries(months).forEach(([monthStr, data]) => {
      const month = parseInt(monthStr);
      if (month <= currentMonth) {
        stats.totalExpected += 70;
        if (data.status === "verified") {
          stats.paidCount++;
          stats.totalCollected += data.amount;
        } else if (data.status === "pending") {
          stats.pendingCount++;
        } else if (data.status === "unpaid") {
          stats.unpaidCount++;
        }
      }
    });
  });

  const handleCellClick = (memberId: string, month: number, status: string) => {
    console.log("Cell clicked:", { memberId, month, status });
    // TODO: Open modal for payment details or manual entry
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">ตารางการชำระเงิน</h1>
          <p className="text-muted">ดูสถานะการชำระของสมาชิกทั้งหมด</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-32"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
              <option key={year} value={year}>
                ปี {year}
              </option>
            ))}
          </select>
          <button className="btn-secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <PaymentStats
        totalMembers={stats.totalMembers}
        paidCount={Math.floor(stats.paidCount / currentMonth)}
        pendingCount={Math.floor(stats.pendingCount / currentMonth)}
        unpaidCount={Math.floor(stats.unpaidCount / currentMonth)}
        totalCollected={stats.totalCollected}
        totalExpected={stats.totalExpected}
      />

      {/* Payment Grid */}
      <div className="card p-4 md:p-6">
        <PaymentGrid
          members={mockMembers}
          paymentsData={paymentsData}
          year={selectedYear}
          onCellClick={handleCellClick}
          isLoading={isLoading}
        />
      </div>

      {/* Info */}
      <div className="alert-info">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium">เคล็ดลับ</p>
          <p className="text-sm">
            คลิกที่ช่องเพื่อดูรายละเอียดหรือเพิ่มการชำระแบบ Manual
          </p>
        </div>
      </div>
    </div>
  );
}
