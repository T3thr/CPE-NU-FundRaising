"use client";
// =============================================================================
// Create Member Content - Using Inline Styles (Tailwind v4 Compatible)
// Based on: CHANGELOG-AdminUI-Refactor.md patterns
// =============================================================================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Info, ArrowLeft, UserPlus, Upload } from "lucide-react";
import { MemberForm } from "@/components/members";
import { useNotification } from "@/providers/notification-provider";
import type { MemberFormData } from "@/types/database";

export default function CreateMemberContent() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual API call
      // await createMember(cohortId, data);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      success("เพิ่มสมาชิกสำเร็จ", `${data.full_name} ถูกเพิ่มเข้าระบบแล้ว`);
      router.push("/admin/members");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      error("เพิ่มสมาชิกไม่สำเร็จ", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/members"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "var(--muted)",
            textDecoration: "none",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
          กลับไปหน้าสมาชิก
        </Link>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div 
            style={{ 
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            }}
          >
            <UserPlus style={{ width: "24px", height: "24px", color: "white" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
              เพิ่มสมาชิกใหม่
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
              กรอกข้อมูลสมาชิกใหม่ลงระบบ
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <MemberForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/members")}
          isLoading={isLoading}
          submitLabel="เพิ่มสมาชิก"
        />
      </div>

      {/* Tips */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: "12px",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      >
        <Info style={{ width: "20px", height: "20px", color: "#3b82f6", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <p style={{ fontWeight: 600, color: "#3b82f6", margin: 0 }}>เคล็ดลับ</p>
          <ul style={{ 
            fontSize: "0.875rem", 
            color: "var(--foreground)",
            margin: "0.5rem 0 0 0",
            paddingLeft: "1.25rem",
            lineHeight: "1.6",
          }}>
            <li>รหัสนิสิตต้องเป็นตัวเลข 8 หลัก</li>
            <li>อีเมลและ Line ID ใช้สำหรับติดต่อและแจ้งเตือน</li>
            <li>
              ต้องการเพิ่มหลายคน? ใช้{" "}
              <Link 
                href="/admin/members" 
                style={{ color: "#3b82f6", textDecoration: "underline" }}
              >
                Import CSV
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
