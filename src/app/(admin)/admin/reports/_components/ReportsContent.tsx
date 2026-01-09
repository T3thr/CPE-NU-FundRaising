"use client";
// =============================================================================
// Reports Content - Financial Reports & Analytics
// =============================================================================

import React, { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { Select } from "@/components/ui/Form";
import { appConfig } from "@/config/app.config";

// Mock data for reports
const mockMonthlyData = [
  { month: 6, collected: 4200, expected: 4760, members: 68, paid: 60 },
  { month: 7, collected: 4480, expected: 4760, members: 68, paid: 64 },
  { month: 8, collected: 4340, expected: 4760, members: 68, paid: 62 },
  { month: 9, collected: 3920, expected: 4760, members: 68, paid: 56 },
  { month: 10, collected: 4550, expected: 4760, members: 68, paid: 65 },
  { month: 11, collected: 4130, expected: 4760, members: 68, paid: 59 },
  { month: 12, collected: 4270, expected: 4760, members: 68, paid: 61 },
  { month: 1, collected: 4620, expected: 4760, members: 68, paid: 66 },
];

export default function ReportsContent() {
  const currentYear = new Date().getFullYear() % 100 + 43;
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedReport, setSelectedReport] = useState<"monthly" | "members" | "summary">("monthly");

  // Calculate totals
  const totals = mockMonthlyData.reduce(
    (acc, item) => ({
      collected: acc.collected + item.collected,
      expected: acc.expected + item.expected,
    }),
    { collected: 0, expected: 0 }
  );

  const collectionRate = Math.round((totals.collected / totals.expected) * 100);
  const maxCollected = Math.max(...mockMonthlyData.map((d) => d.expected));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">รายงาน</h1>
          <p className="text-muted">สรุปยอดและวิเคราะห์ข้อมูลการเงิน</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={[
              { value: String(currentYear - 1), label: `ปี ${currentYear - 1}` },
              { value: String(currentYear), label: `ปี ${currentYear}` },
            ]}
            className="w-32"
          />
          <Button variant="secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-none">
          <div className="p-4">
            <p className="text-sm text-white/80">ยอดเก็บทั้งหมด</p>
            <p className="text-2xl font-bold">฿{totals.collected.toLocaleString()}</p>
            <p className="text-sm text-white/80 mt-1">
              จากเป้าหมาย ฿{totals.expected.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <div className="p-4">
            <p className="text-sm text-white/80">อัตราการเก็บ</p>
            <p className="text-2xl font-bold">{collectionRate}%</p>
            <div className="w-full h-2 bg-white/30 rounded-full mt-2">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-sm text-muted">ค้างชำระ</p>
            <p className="text-2xl font-bold text-danger">
              ฿{(totals.expected - totals.collected).toLocaleString()}
            </p>
            <p className="text-sm text-muted mt-1">
              {100 - collectionRate}% ของเป้าหมาย
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-sm text-muted">สมาชิก</p>
            <p className="text-2xl font-bold">68 คน</p>
            <p className="text-sm text-success mt-1">
              ✓ ครบถ้วน 45 คน
            </p>
          </div>
        </Card>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {[
          { key: "monthly", label: "รายเดือน" },
          { key: "members", label: "รายบุคคล" },
          { key: "summary", label: "สรุปรวม" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedReport(tab.key as typeof selectedReport)}
            className={`
              px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${selectedReport === tab.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-muted hover:text-foreground"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Monthly Report */}
      {selectedReport === "monthly" && (
        <div className="space-y-6">
          {/* Bar Chart */}
          <Card padding="lg">
            <h3 className="font-semibold mb-6">ยอดเก็บรายเดือน</h3>
            <div className="space-y-4">
              {mockMonthlyData.map((item) => {
                const percentage = (item.collected / maxCollected) * 100;
                const rate = Math.round((item.collected / item.expected) * 100);
                
                return (
                  <div key={item.month} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-right">
                      {appConfig.thaiMonthsShort[item.month - 1]}
                    </div>
                    <div className="flex-1">
                      <div className="relative h-8 bg-muted/10 rounded-full overflow-hidden">
                        <div
                          className={`
                            absolute inset-y-0 left-0 rounded-full transition-all duration-500
                            ${rate >= 90 ? "bg-gradient-to-r from-green-500 to-green-400" :
                              rate >= 70 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" :
                              "bg-gradient-to-r from-red-500 to-red-400"}
                          `}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-sm font-semibold text-foreground">
                            ฿{item.collected.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <Badge
                        variant={rate >= 90 ? "success" : rate >= 70 ? "warning" : "danger"}
                        size="sm"
                      >
                        {rate}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Monthly Details Table */}
          <Card padding="none">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>เดือน</th>
                    <th className="text-right">สมาชิก</th>
                    <th className="text-right">จ่ายแล้ว</th>
                    <th className="text-right">ยอดเก็บได้</th>
                    <th className="text-right">เป้าหมาย</th>
                    <th className="text-right">อัตรา</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMonthlyData.map((item) => {
                    const rate = Math.round((item.collected / item.expected) * 100);
                    return (
                      <tr key={item.month}>
                        <td className="font-medium">
                          {appConfig.thaiMonths[item.month - 1]}
                        </td>
                        <td className="text-right">{item.members}</td>
                        <td className="text-right text-success">{item.paid}</td>
                        <td className="text-right font-semibold">
                          ฿{item.collected.toLocaleString()}
                        </td>
                        <td className="text-right text-muted">
                          ฿{item.expected.toLocaleString()}
                        </td>
                        <td className="text-right">
                          <Badge
                            variant={rate >= 90 ? "success" : rate >= 70 ? "warning" : "danger"}
                          >
                            {rate}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/5 font-semibold">
                    <td>รวม</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right text-primary-600">
                      ฿{totals.collected.toLocaleString()}
                    </td>
                    <td className="text-right">฿{totals.expected.toLocaleString()}</td>
                    <td className="text-right">
                      <Badge variant={collectionRate >= 90 ? "success" : "warning"}>
                        {collectionRate}%
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Members Report (Placeholder) */}
      {selectedReport === "members" && (
        <Card padding="lg">
          <div className="text-center py-12 text-muted">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-medium">รายงานรายบุคคล</p>
            <p>ดูสถานะการชำระของสมาชิกแต่ละคน</p>
            <Button variant="primary" className="mt-4">
              ดูรายงานเต็ม
            </Button>
          </div>
        </Card>
      )}

      {/* Summary Report (Placeholder) */}
      {selectedReport === "summary" && (
        <Card padding="lg">
          <div className="text-center py-12 text-muted">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">สรุปรายงานประจำปี</p>
            <p>สรุปภาพรวมการเงินทั้งปีการศึกษา</p>
            <Button variant="primary" className="mt-4">
              สร้างรายงาน PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
