"use client";
// =============================================================================
// Members List Content
// =============================================================================

import React, { useState } from "react";
import Link from "next/link";
import { useNotification } from "@/providers/notification-provider";

// Mock data
const mockMembers = [
  { id: "1", studentId: "65310001", fullName: "สมชาย ใจดี", nickname: "ชาย", email: "somchai@nu.ac.th", isActive: true, paidMonths: 10, totalMonths: 12 },
  { id: "2", studentId: "65310002", fullName: "สมหญิง รักเรียน", nickname: "หญิง", email: "somying@nu.ac.th", isActive: true, paidMonths: 12, totalMonths: 12 },
  { id: "3", studentId: "65310003", fullName: "นายพร้อม เสมอ", nickname: "พร้อม", email: "prom@nu.ac.th", isActive: true, paidMonths: 8, totalMonths: 12 },
  { id: "4", studentId: "65310004", fullName: "นางสาว ขยัน ทำงาน", nickname: "ขยัน", email: "khayan@nu.ac.th", isActive: false, paidMonths: 5, totalMonths: 12 },
  { id: "5", studentId: "65310005", fullName: "นาย เก่ง มาก", nickname: "เก่ง", email: "keng@nu.ac.th", isActive: true, paidMonths: 11, totalMonths: 12 },
];

export default function MembersListContent() {
  const { success, error } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.studentId.includes(searchQuery) ||
      member.fullName.includes(searchQuery) ||
      member.nickname.includes(searchQuery);
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && member.isActive) ||
      (filterStatus === "inactive" && !member.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    // TODO: Implement actual status toggle
    success(
      currentStatus ? "ปิดใช้งานสมาชิก" : "เปิดใช้งานสมาชิก",
      "อัปเดตสถานะเรียบร้อย"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">จัดการสมาชิก</h1>
          <p className="text-muted">ทั้งหมด {mockMembers.length} คน</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import CSV
          </button>
          <Link href="/admin/members/create" className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มสมาชิก
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหารหัสนิสิต หรือ ชื่อ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full md:w-48"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">ใช้งานอยู่</option>
            <option value="inactive">ปิดใช้งาน</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>รหัสนิสิต</th>
              <th>ชื่อ</th>
              <th>ชื่อเล่น</th>
              <th>Email</th>
              <th className="text-center">สถานะการจ่าย</th>
              <th className="text-center">สถานะ</th>
              <th className="text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td className="font-mono">{member.studentId}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">{member.fullName.charAt(0)}</div>
                    <span className="font-medium">{member.fullName}</span>
                  </div>
                </td>
                <td>{member.nickname}</td>
                <td className="text-muted text-sm">{member.email}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className={`font-semibold ${
                      member.paidMonths === member.totalMonths
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}>
                      {member.paidMonths}/{member.totalMonths}
                    </span>
                    <span className="text-muted text-xs">เดือน</span>
                  </div>
                </td>
                <td className="text-center">
                  <span className={`badge ${
                    member.isActive ? "badge-success" : "badge-danger"
                  }`}>
                    {member.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="btn-ghost btn-sm btn-icon"
                      title="ดูรายละเอียด"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/members/${member.id}/edit`}
                      className="btn-ghost btn-sm btn-icon"
                      title="แก้ไข"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(member.id, member.isActive)}
                      className="btn-ghost btn-sm btn-icon"
                      title={member.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    >
                      {member.isActive ? (
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-muted">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p>ไม่พบสมาชิกที่ตรงกับเงื่อนไข</p>
        </div>
      )}
    </div>
  );
}
