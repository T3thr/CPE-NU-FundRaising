"use client";
// =============================================================================
// Create Member Content
// =============================================================================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
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
        <MemberForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/members")}
          isLoading={isLoading}
          submitLabel="เพิ่มสมาชิก"
        />
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
          </ul>
        </div>
      </div>
    </div>
  );
}
