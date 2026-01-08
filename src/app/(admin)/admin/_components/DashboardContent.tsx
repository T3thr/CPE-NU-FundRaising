"use client";
// =============================================================================
// Dashboard Content - Admin Overview
// =============================================================================

import React from "react";
import Link from "next/link";
import { appConfig } from "@/config/app.config";

// Mock data for demonstration
const mockStats = {
  totalMembers: 68,
  paidThisMonth: 45,
  pendingVerification: 5,
  unpaidThisMonth: 18,
  totalCollected: 47600,
  totalExpected: 57120,
  collectionRate: 83,
};

const mockRecentPayments = [
  { id: "1", studentId: "65310001", name: "สมชาย ใจดี", amount: 70, month: "ม.ค.", status: "pending", createdAt: "2 นาทีที่แล้ว" },
  { id: "2", studentId: "65310002", name: "สมหญิง รักเรียน", amount: 140, month: "ม.ค.-ก.พ.", status: "verified", createdAt: "1 ชั่วโมงที่แล้ว" },
  { id: "3", studentId: "65310003", name: "นายพร้อม เสมอ", amount: 70, month: "ม.ค.", status: "verified", createdAt: "2 ชั่วโมงที่แล้ว" },
  { id: "4", studentId: "65310004", name: "นางสาว ขยัน ทำงาน", amount: 70, month: "ม.ค.", status: "pending", createdAt: "3 ชั่วโมงที่แล้ว" },
  { id: "5", studentId: "65310005", name: "นาย เก่ง มาก", amount: 210, month: "พ.ย.-ม.ค.", status: "rejected", createdAt: "4 ชั่วโมงที่แล้ว" },
];

const mockUnpaidMembers = [
  { id: "1", studentId: "65310006", name: "นาย ลืม จ่าย", monthsOwed: 3, totalOwed: 250 },
  { id: "2", studentId: "65310007", name: "นางสาว งก เงิน", monthsOwed: 2, totalOwed: 160 },
  { id: "3", studentId: "65310008", name: "นาย ไม่มี ตังค์", monthsOwed: 1, totalOwed: 70 },
];

export default function DashboardContent() {
  const currentMonth = appConfig.thaiMonths[new Date().getMonth()];
  const currentYear = new Date().getFullYear() % 100 + 43;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">ภาพรวม</h1>
          <p className="text-muted">
            เดือน{currentMonth} ปี {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/verify" className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ตรวจสอบ Slip ({mockStats.pendingVerification})
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="stat-value">{mockStats.totalMembers}</div>
              <div className="stat-label">สมาชิกทั้งหมด</div>
            </div>
          </div>
        </div>

        <div className="stat-card border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-green-600 dark:text-green-400">{mockStats.paidThisMonth}</div>
              <div className="stat-label">จ่ายแล้วเดือนนี้</div>
            </div>
          </div>
        </div>

        <div className="stat-card border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-yellow-600 dark:text-yellow-400">{mockStats.pendingVerification}</div>
              <div className="stat-label">รอตรวจสอบ</div>
            </div>
          </div>
        </div>

        <div className="stat-card border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="stat-value text-red-600 dark:text-red-400">{mockStats.unpaidThisMonth}</div>
              <div className="stat-label">ยังไม่จ่าย</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">ยอดเก็บประจำเดือน</h2>
          <span className="text-2xl font-bold text-primary-600">
            {mockStats.collectionRate}%
          </span>
        </div>
        <div className="w-full bg-muted/20 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${mockStats.collectionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted">
          <span>เก็บได้ ฿{mockStats.totalCollected.toLocaleString()}</span>
          <span>เป้าหมาย ฿{mockStats.totalExpected.toLocaleString()}</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">การชำระล่าสุด</h2>
            <Link href="/admin/payments" className="text-sm text-primary-600 hover:text-primary-700">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockRecentPayments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    {payment.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{payment.name}</p>
                    <p className="text-xs text-muted">
                      {payment.studentId} • {payment.month}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">฿{payment.amount}</p>
                  <span className={`text-xs ${
                    payment.status === "verified" ? "text-green-600" :
                    payment.status === "pending" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {payment.status === "verified" ? "✓ ยืนยันแล้ว" :
                     payment.status === "pending" ? "⏳ รอตรวจสอบ" :
                     "✗ ปฏิเสธ"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unpaid Members */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">สมาชิกค้างชำระ</h2>
            <Link href="/admin/members?filter=unpaid" className="text-sm text-primary-600 hover:text-primary-700">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {mockUnpaidMembers.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted">{member.studentId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    ฿{member.totalOwed}
                  </p>
                  <p className="text-xs text-muted">
                    ค้าง {member.monthsOwed} เดือน
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {mockUnpaidMembers.length === 0 && (
            <div className="px-6 py-12 text-center text-muted">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>ไม่มีสมาชิกค้างชำระ! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/members/create" className="card p-4 hover:border-primary-500 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <span className="font-medium text-sm">เพิ่มสมาชิก</span>
          </div>
        </Link>

        <Link href="/admin/payments" className="card p-4 hover:border-primary-500 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <span className="font-medium text-sm">ตารางการจ่าย</span>
          </div>
        </Link>

        <Link href="/admin/reports" className="card p-4 hover:border-primary-500 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium text-sm">รายงาน</span>
          </div>
        </Link>

        <Link href="/admin/settings" className="card p-4 hover:border-primary-500 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-medium text-sm">ตั้งค่า</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
