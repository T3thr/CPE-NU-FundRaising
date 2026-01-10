"use client";
// =============================================================================
// Payment Grid Component - Main Payment Status View
// =============================================================================

import React, { useMemo } from "react";
import { appConfig, themeConfig } from "@/config/app.config";
import type { Member } from "@/types/database";

interface PaymentGridProps {
  members: Member[];
  paymentsData: {
    member: Member;
    months: Record<number, { status: string; amount: number; paymentId?: string }>;
  }[];
  year: number;
  onCellClick?: (memberId: string, month: number, status: string) => void;
  isLoading?: boolean;
}

export function PaymentGrid({
  members,
  paymentsData,
  year,
  onCellClick,
  isLoading = false,
}: PaymentGridProps) {
  // Get months to display based on academic year
  const months = useMemo(() => {
    const allMonths: number[] = [];
    const startMonth = appConfig.academic.startMonth;
    
    // Academic year typically runs from June to May
    for (let m = startMonth; m <= 12; m++) allMonths.push(m);
    for (let m = 1; m < startMonth; m++) allMonths.push(m);
    
    return allMonths;
  }, []);

  // Determine which months are in the future
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear() % 100; // Get 2-digit year

  const isFutureMonth = (month: number) => {
    // For academic year format (e.g., 68)
    if (year < currentYear) return false;
    if (year > currentYear) return true;
    return month > currentMonth;
  };

  const getCellClass = (status: string, month: number) => {
    if (isFutureMonth(month)) {
      return "payment-cell-future";
    }
    
    switch (status) {
      case "verified":
        return "payment-cell-paid";
      case "pending":
        return "payment-cell-pending";
      case "rejected":
      case "unpaid":
      default:
        return "payment-cell-unpaid";
    }
  };

  const getCellContent = (status: string, amount: number) => {
    switch (status) {
      case "verified":
        return "✓";
      case "pending":
        return "...";
      case "rejected":
        return "✗";
      default:
        return "0";
    }
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="sticky left-0 bg-muted/5 z-10">รหัส</th>
              <th className="sticky left-16 bg-muted/5 z-10">ชื่อ</th>
              {months.map((month) => (
                <th key={month} className="text-center w-12">
                  {appConfig.thaiMonthsShort[month - 1]}
                </th>
              ))}
              <th className="text-right">ค้างชำระ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index}>
                <td className="sticky left-0 bg-card z-10">
                  <div className="skeleton h-4 w-16" />
                </td>
                <td className="sticky left-16 bg-card z-10">
                  <div className="skeleton h-4 w-24" />
                </td>
                {months.map((month) => (
                  <td key={month} className="p-1">
                    <div className="skeleton h-10 w-10 mx-auto rounded-lg" />
                  </td>
                ))}
                <td>
                  <div className="skeleton h-4 w-16 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-container overflow-x-auto">
      <table className="table min-w-max">
        <thead>
          <tr>
            <th className="sticky left-0 bg-muted/5 z-10 min-w-[80px]">รหัส</th>
            <th className="sticky left-20 bg-muted/5 z-10 min-w-[120px]">ชื่อ</th>
            {months.map((month) => (
              <th key={month} className="text-center w-14 px-1">
                <span className="block text-xs font-medium">
                  {appConfig.thaiMonthsShort[month - 1]}
                </span>
              </th>
            ))}
            <th className="text-right min-w-[100px]">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {paymentsData.map(({ member, months: monthsData }) => {
            // Calculate unpaid months and penalty
            const unpaidCount = months.filter(
              (month) =>
                !isFutureMonth(month) &&
                (!monthsData[month] || monthsData[month].status !== "verified")
            ).length;
            
            const penalty = unpaidCount > 0 
              ? (unpaidCount * 80) - 10 // 80 per month, minus 10 for current month
              : 0;

            return (
              <tr key={member.id} className="group">
                <td className="sticky left-0 bg-card z-10 font-mono text-sm">
                  {member.student_id}
                </td>
                <td className="sticky left-20 bg-card z-10">
                  <div className="flex items-center gap-2">
                    <div className="avatar avatar-sm">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm truncate max-w-[100px]">
                        {member.nickname || member.full_name.split(" ")[0]}
                      </div>
                    </div>
                  </div>
                </td>
                {months.map((month) => {
                  const cellData = monthsData[month] || { status: "unpaid", amount: 0 };
                  const isFuture = isFutureMonth(month);

                  return (
                    <td key={month} className="p-1">
                      <button
                        className={`${getCellClass(cellData.status, month)} ${
                          !isFuture && onCellClick ? "cursor-pointer hover:scale-105" : ""
                        }`}
                        onClick={() => {
                          if (!isFuture && onCellClick) {
                            onCellClick(member.id, month, cellData.status);
                          }
                        }}
                        disabled={isFuture}
                        title={
                          isFuture
                            ? "ยังไม่ถึงกำหนด"
                            : cellData.status === "verified"
                            ? `ชำระแล้ว ${cellData.amount} บาท`
                            : cellData.status === "pending"
                            ? "รอตรวจสอบ"
                            : "ยังไม่ชำระ"
                        }
                      >
                        {isFuture ? "-" : getCellContent(cellData.status, cellData.amount)}
                      </button>
                    </td>
                  );
                })}
                <td className="text-right">
                  {unpaidCount > 0 ? (
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                      ค้าง {unpaidCount} เดือน
                      <br />
                      <span className="text-xs">
                        ต้องจ่าย {Math.max(0, penalty).toLocaleString()} บาท
                      </span>
                    </span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 text-sm">
                      ✓ ครบ
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-4 py-3 bg-muted/5 rounded-lg text-sm">
        <span className="text-muted">สัญลักษณ์:</span>
        <div className="flex items-center gap-2">
          <div className="payment-cell-paid w-6 h-6 text-xs">✓</div>
          <span>ชำระแล้ว</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="payment-cell-pending w-6 h-6 text-xs">...</div>
          <span>รอตรวจสอบ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="payment-cell-unpaid w-6 h-6 text-xs">0</div>
          <span>ค้างชำระ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="payment-cell-future w-6 h-6 text-xs">-</div>
          <span>ยังไม่ถึงกำหนด</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Payment Summary Stats
// =============================================================================

interface PaymentStatsProps {
  totalMembers: number;
  paidCount: number;
  pendingCount: number;
  unpaidCount: number;
  totalCollected: number;
  totalExpected: number;
}

export function PaymentStats({
  totalMembers,
  paidCount,
  pendingCount,
  unpaidCount,
  totalCollected,
  totalExpected,
}: PaymentStatsProps) {
  const collectionRate = totalExpected > 0 
    ? Math.round((totalCollected / totalExpected) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div className="stat-card">
        <div className="stat-label">สมาชิกทั้งหมด</div>
        <div className="stat-value">{totalMembers}</div>
      </div>
      
      <div className="stat-card border-l-4 border-green-500">
        <div className="stat-label">ชำระแล้ว</div>
        <div className="stat-value text-green-600 dark:text-green-400">
          {paidCount}
        </div>
        <div className="stat-change-positive">
          {totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0}%
        </div>
      </div>
      
      <div className="stat-card border-l-4 border-yellow-500">
        <div className="stat-label">รอตรวจสอบ</div>
        <div className="stat-value text-yellow-600 dark:text-yellow-400">
          {pendingCount}
        </div>
      </div>
      
      <div className="stat-card border-l-4 border-red-500">
        <div className="stat-label">ค้างชำระ</div>
        <div className="stat-value text-red-600 dark:text-red-400">
          {unpaidCount}
        </div>
        <div className="stat-change-negative">
          {totalMembers > 0 ? Math.round((unpaidCount / totalMembers) * 100) : 0}%
        </div>
      </div>
      
      <div className="stat-card border-l-4 border-primary-500">
        <div className="stat-label">ยอดเก็บแล้ว</div>
        <div className="stat-value">
          ฿{totalCollected.toLocaleString()}
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-label">อัตราการเก็บ</div>
        <div className="stat-value">{collectionRate}%</div>
        <div className="w-full bg-muted/20 rounded-full h-2 mt-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
