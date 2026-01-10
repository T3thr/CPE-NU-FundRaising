"use client";
// =============================================================================
<<<<<<< HEAD
// Create Member Content - Using Inline Styles (Tailwind v4 Compatible)
// Based on: CHANGELOG-AdminUI-Refactor.md patterns
=======
// Create Member Content
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
// =============================================================================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
import { Info, ArrowLeft, UserPlus, Upload } from "lucide-react";
=======
import { Card, Button } from "@/components/ui";
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
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
<<<<<<< HEAD
      await new Promise((resolve) => setTimeout(resolve, 1000));
=======
      await new Promise((resolve) => setTimeout(resolve, 1500));
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
      
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
<<<<<<< HEAD
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
=======
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          หน้าหลัก
        </Link>
        <span>/</span>
        <Link href="/admin/members" className="hover:text-foreground transition-colors">
          สมาชิก
        </Link>
        <span>/</span>
        <span className="text-foreground">เพิ่มสมาชิก</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">เพิ่มสมาชิกใหม่</h1>
        <p className="text-muted mt-1">กรอกข้อมูลสมาชิกใหม่ลงระบบ</p>
      </div>

      {/* Form Card */}
      <Card padding="lg">
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
        <MemberForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/members")}
          isLoading={isLoading}
          submitLabel="เพิ่มสมาชิก"
        />
<<<<<<< HEAD
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
=======
      </Card>

      {/* Tips */}
      <div className="alert-info">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium">เคล็ดลับ</p>
          <ul className="text-sm list-disc list-inside mt-1 space-y-0.5">
            <li>รหัสนิสิตต้องเป็นตัวเลข 8 หลัก</li>
            <li>อีเมลและ Line ID ใช้สำหรับติดต่อและแจ้งเตือน</li>
            <li>ต้องการเพิ่มหลายคน? ใช้ <Link href="/admin/members/import" className="text-primary-600 hover:underline">Import CSV</Link></li>
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
          </ul>
        </div>
      </div>
    </div>
  );
}
