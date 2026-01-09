"use client";
// =============================================================================
// Member Form Component - Create/Edit Member
// =============================================================================

import React, { useState, useCallback } from "react";
import { Input, Textarea } from "@/components/ui/Form";
import { Button, Card } from "@/components/ui/Common";
import { validateMemberData, cleanStudentId } from "@/utils/validation";
import { useNotification } from "@/providers/notification-provider";
import type { Member, MemberFormData } from "@/types/database";

interface MemberFormProps {
  initialData?: Partial<Member>;
  onSubmit: (data: MemberFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function MemberForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = "บันทึก",
}: MemberFormProps) {
  const { error: showError } = useNotification();
  
  const [formData, setFormData] = useState<MemberFormData>({
    student_id: initialData?.student_id || "",
    full_name: initialData?.full_name || "",
    nickname: initialData?.nickname || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    line_id: initialData?.line_id || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: keyof MemberFormData, value: string) => {
    setFormData((prev: MemberFormData) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field as string]: "" }));
    }
  }, [errors]);

  const handleStudentIdChange = useCallback((value: string) => {
    // Clean and format student ID
    const cleaned = cleanStudentId(value);
    handleChange("student_id", cleaned);
  }, [handleChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = validateMemberData({
      studentId: formData.student_id,
      fullName: formData.full_name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      lineId: formData.line_id || undefined,
    });

    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((err) => {
        // Map error messages to fields (simplified)
        if (err.includes("รหัสนิสิต")) newErrors.student_id = err;
        else if (err.includes("ชื่อ")) newErrors.full_name = err;
        else if (err.includes("อีเมล")) newErrors.email = err;
        else if (err.includes("เบอร์โทร")) newErrors.phone = err;
        else if (err.includes("Line")) newErrors.line_id = err;
      });
      setErrors(newErrors);
      showError("กรุณาตรวจสอบข้อมูล", validation.errors[0]);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      showError("ไม่สามารถบันทึกได้", errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student ID */}
      <Input
        label="รหัสนิสิต"
        placeholder="เช่น 65310001"
        value={formData.student_id}
        onChange={(e) => handleStudentIdChange(e.target.value)}
        error={errors.student_id}
        required
        maxLength={8}
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={!!initialData?.student_id} // Disable if editing
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        }
      />

      {/* Full Name */}
      <Input
        label="ชื่อ-นามสกุล"
        placeholder="เช่น นายสมชาย ใจดี"
        value={formData.full_name}
        onChange={(e) => handleChange("full_name", e.target.value)}
        error={errors.full_name}
        required
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      {/* Nickname */}
      <Input
        label="ชื่อเล่น"
        placeholder="เช่น ชาย"
        value={formData.nickname}
        onChange={(e) => handleChange("nickname", e.target.value)}
        helperText="ใช้สำหรับแสดงในระบบ (ไม่บังคับ)"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <Input
          type="email"
          label="อีเมล"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        {/* Phone */}
        <Input
          type="tel"
          label="เบอร์โทรศัพท์"
          placeholder="08XXXXXXXX"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          maxLength={10}
          inputMode="numeric"
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />
      </div>

      {/* Line ID */}
      <Input
        label="Line ID"
        placeholder="เช่น my_line123"
        value={formData.line_id}
        onChange={(e) => handleChange("line_id", e.target.value)}
        error={errors.line_id}
        helperText="ใช้สำหรับติดต่อและแจ้งเตือน"
        leftIcon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        }
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            ยกเลิก
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// =============================================================================
// Member Card Component - Display Member Info
// =============================================================================

interface MemberCardProps {
  member: Member;
  paymentStats?: {
    paidMonths: number;
    totalMonths: number;
    totalPaid: number;
    totalOwed: number;
  };
  onEdit?: () => void;
  onView?: () => void;
  onToggleStatus?: () => void;
  className?: string;
}

export function MemberCard({
  member,
  paymentStats,
  onEdit,
  onView,
  onToggleStatus,
  className = "",
}: MemberCardProps) {
  const paymentPercentage = paymentStats
    ? Math.round((paymentStats.paidMonths / paymentStats.totalMonths) * 100)
    : 0;

  return (
    <Card padding="none" hover={!!onView} onClick={onView} className={className}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="avatar avatar-lg flex-shrink-0">
            {member.nickname?.[0] || member.full_name[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{member.full_name}</h3>
                <p className="text-sm text-muted">
                  <span className="font-mono">{member.student_id}</span>
                  {member.nickname && <span className="ml-2">({member.nickname})</span>}
                </p>
              </div>
              <span
                className={`badge ${member.is_active ? "badge-success" : "badge-danger"}`}
              >
                {member.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
              </span>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted">
              {member.email && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {member.email}
                </span>
              )}
              {member.line_id && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755z" />
                  </svg>
                  {member.line_id}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Payment Stats */}
        {paymentStats && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">สถานะการชำระ</span>
              <span className={`text-sm font-semibold ${paymentPercentage >= 100 ? "text-success" : paymentPercentage >= 50 ? "text-warning" : "text-danger"}`}>
                {paymentStats.paidMonths}/{paymentStats.totalMonths} เดือน
              </span>
            </div>
            <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  paymentPercentage >= 100
                    ? "bg-success"
                    : paymentPercentage >= 50
                    ? "bg-warning"
                    : "bg-danger"
                }`}
                style={{ width: `${paymentPercentage}%` }}
              />
            </div>
            {paymentStats.totalOwed > 0 && (
              <p className="mt-2 text-sm text-danger">
                ค้างชำระ ฿{paymentStats.totalOwed.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onToggleStatus) && (
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/5">
          {onToggleStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus();
              }}
            >
              {member.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              แก้ไข
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
