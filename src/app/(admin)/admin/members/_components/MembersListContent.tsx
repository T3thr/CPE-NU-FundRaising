"use client";
// =============================================================================
// Members List Content - REAL DATA FROM SUPABASE
// Based on: src/docs/DESIGN-Database&DataEntry.md
// Best Practice: Next.js 15+ with Refine
// =============================================================================

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Search, UserPlus, Eye, Edit3, UserX, UserCheck, Sparkles, Download, RefreshCw, AlertTriangle, Filter } from "lucide-react";
import { useNotification } from "@/providers/notification-provider";
import { getCPEGenerationText, type ParsedMember } from "@/utils/validation";
import { getMembers, getActiveCohort, updateMemberStatus, exportMembersCSV, importMembers } from "@/app/(admin)/admin/_actions/admin-actions";
import SmartImportModal from "./SmartImportModal";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Types
interface Member {
  id: string;
  student_id: string;
  title: string | null;
  first_name: string;
  last_name: string;
  nickname: string | null;
  email: string | null;
  status: string;
  cohort_id: string;
}

type MemberStatus = "all" | "active" | "resigned" | "graduated";

export default function MembersListContent() {
  const [mounted, setMounted] = useState(false);
  const { success, error: showError } = useNotification();
  const [isPending, startTransition] = useTransition();
  
  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [cohort, setCohort] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<MemberStatus>("all");
  
  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Load data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const [membersData, cohortData] = await Promise.all([
          getMembers(),
          getActiveCohort(),
        ]);
        
        setMembers(membersData as Member[]);
        setCohort(cohortData ? { id: cohortData.id, name: cohortData.name } : null);
        setError(null);
      } catch (err) {
        console.error("Error loading members:", err);
        setError("ไม่สามารถโหลดข้อมูลสมาชิกได้");
      }
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Filter members
  const filteredMembers = members.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`;
    const matchesSearch =
      member.student_id.includes(searchQuery) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus = filterStatus === "all" || member.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "resigned" : "active";
    
    const result = await updateMemberStatus(id, newStatus);
    
    if (result.success) {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      success(
        newStatus === "active" ? "เปิดใช้งานสมาชิก" : "ปิดใช้งานสมาชิก",
        "อัปเดตสถานะเรียบร้อย"
      );
    } else {
      showError("อัปเดตไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
    }
  };

  // Handle import
  const handleImport = async (parsedMembers: ParsedMember[]) => {
    if (!cohort) {
      showError("ไม่พบรุ่น", "กรุณาสร้างรุ่นก่อนนำเข้าสมาชิก");
      return;
    }

    const result = await importMembers(cohort.id, parsedMembers);
    
    if (result.success) {
      success("นำเข้าสำเร็จ", `เพิ่มสมาชิก ${result.count} คน`);
      loadData(); // Refresh data
    } else {
      showError("นำเข้าไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
    }
  };

  // Handle export
  const handleExportCSV = async () => {
    if (!cohort) {
      showError("ไม่พบรุ่น", "กรุณาสร้างรุ่นก่อน");
      return;
    }

    const csv = await exportMembersCSV(cohort.id);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_${cohort.name}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success("Export สำเร็จ", "ดาวน์โหลดไฟล์ CSV เรียบร้อย");
  };

  // Get CPE Generation
  const cpeGen = members.length > 0 ? getCPEGenerationText(members[0].student_id) : cohort?.name || "CPE";

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>
              จัดการสมาชิก
            </h1>
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
              {cpeGen}
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            ทั้งหมด {members.length} คน {filterStatus !== "all" && `(กรอง: ${filteredMembers.length})`}
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
            <RefreshCw
              style={{
                width: "18px",
                height: "18px",
                animation: isPending ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={members.length === 0}
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
              cursor: members.length === 0 ? "not-allowed" : "pointer",
              opacity: members.length === 0 ? 0.5 : 1,
            }}
          >
            <Download style={{ width: "18px", height: "18px" }} />
            Export CSV
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
            }}
          >
            <Sparkles style={{ width: "18px", height: "18px" }} />
            Smart Import
          </button>
          <Link
            href="/admin/members/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              color: "white",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          >
            <UserPlus style={{ width: "18px", height: "18px" }} />
            เพิ่มสมาชิก
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertTriangle style={{ width: "20px", height: "20px", color: "#ef4444" }} />
          <span style={{ color: "#ef4444", fontSize: "0.875rem" }}>{error}</span>
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.25rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                color: "var(--muted)",
              }}
            />
            <input
              type="text"
              placeholder="ค้นหารหัสนิสิต หรือ ชื่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                fontSize: "0.875rem",
                color: "var(--foreground)",
                outline: "none",
              }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Filter
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as MemberStatus)}
              style={{
                padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                fontSize: "0.875rem",
                color: "var(--foreground)",
                cursor: "pointer",
                outline: "none",
                minWidth: "150px",
              }}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">ใช้งานอยู่</option>
              <option value="resigned">ลาออก</option>
              <option value="graduated">จบแล้ว</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Members Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {isPending ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <RefreshCw style={{ width: "32px", height: "32px", color: "var(--muted)", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ color: "var(--muted)" }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap" }}>
                    รหัสนิสิต
                  </th>
                  <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--foreground)" }}>
                    ชื่อ-นามสกุล
                  </th>
                  <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--foreground)" }}>
                    ชื่อเล่น
                  </th>
                  <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--foreground)" }}>
                    Email
                  </th>
                  <th style={{ padding: "0.875rem 1rem", textAlign: "center", fontWeight: 600, color: "var(--foreground)" }}>
                    สถานะ
                  </th>
                  <th style={{ padding: "0.875rem 1rem", textAlign: "right", fontWeight: 600, color: "var(--foreground)" }}>
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    style={{
                      borderBottom: index === filteredMembers.length - 1 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", color: "var(--foreground)" }}>
                      {member.student_id}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            flexShrink: 0,
                          }}
                        >
                          {member.first_name.charAt(0)}
                        </div>
                        <div>
                          <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                            {member.title}{member.first_name} {member.last_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--muted)" }}>
                      {member.nickname || "-"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--muted)", fontSize: "0.8125rem" }}>
                      {member.email || "-"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          backgroundColor:
                            member.status === "active"
                              ? "rgba(34, 197, 94, 0.15)"
                              : member.status === "resigned"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(59, 130, 246, 0.15)",
                          color:
                            member.status === "active"
                              ? "#22c55e"
                              : member.status === "resigned"
                              ? "#ef4444"
                              : "#3b82f6",
                        }}
                      >
                        {member.status === "active" ? "ใช้งาน" : member.status === "resigned" ? "ลาออก" : "จบแล้ว"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                        <Link
                          href={`/admin/members/${member.id}`}
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            color: "var(--muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="ดูรายละเอียด"
                        >
                          <Eye style={{ width: "16px", height: "16px" }} />
                        </Link>
                        <Link
                          href={`/admin/members/${member.id}/edit`}
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            color: "var(--muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title="แก้ไข"
                        >
                          <Edit3 style={{ width: "16px", height: "16px" }} />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(member.id, member.status)}
                          style={{
                            padding: "8px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title={member.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        >
                          {member.status === "active" ? (
                            <UserX style={{ width: "16px", height: "16px", color: "#ef4444" }} />
                          ) : (
                            <UserCheck style={{ width: "16px", height: "16px", color: "#22c55e" }} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <Search style={{ width: "32px", height: "32px", color: "var(--muted)" }} />
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.5rem" }}>
              {members.length === 0 ? "ยังไม่มีสมาชิก" : "ไม่พบสมาชิก"}
            </h3>
            <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
              {members.length === 0
                ? "เริ่มต้นโดยการนำเข้าสมาชิกจาก Excel"
                : "ไม่พบสมาชิกที่ตรงกับเงื่อนไขการค้นหา"}
            </p>
            {members.length === 0 && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  color: "white",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                }}
              >
                <Sparkles style={{ width: "18px", height: "18px" }} />
                นำเข้าจาก Excel
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Smart Import Modal */}
      <SmartImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleImport} />

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
