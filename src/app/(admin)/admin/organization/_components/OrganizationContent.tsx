"use client";
// =============================================================================
// Organization Settings Content
// Based on: src/docs/STANDARD-TailwindCSS.md
// Features: Real-time save, No-code admin, Professional UI
// =============================================================================

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Building2,
  CreditCard,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  User,
  Hash,
  Globe,
} from "lucide-react";
import { useNotification } from "@/providers/notification-provider";
import {
  getOrganization,
  updateOrganization,
  createOrganization,
  type OrganizationData,
} from "@/app/(admin)/admin/_actions/admin-actions";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Bank options
const BANK_OPTIONS = [
  { value: "KASIKORNTHAI", label: "ธนาคารกสิกรไทย", color: "#138f2d" },
  { value: "KRUNGTHAI", label: "ธนาคารกรุงไทย", color: "#1ba5e0" },
  { value: "SCB", label: "ธนาคารไทยพาณิชย์", color: "#4e2a84" },
  { value: "BBL", label: "ธนาคารกรุงเทพ", color: "#1e3c87" },
  { value: "KRUNGSRI", label: "ธนาคารกรุงศรี", color: "#fec600" },
  { value: "TMB", label: "ธนาคารทหารไทยธนชาต", color: "#1279be" },
  { value: "PROMPTPAY", label: "พร้อมเพย์", color: "#004c97" },
];

export default function OrganizationContent() {
  const [mounted, setMounted] = useState(false);
  const { success, error: showError } = useNotification();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Data state
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [isNewOrg, setIsNewOrg] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bankName: "KASIKORNTHAI",
    bankAccountNo: "",
    bankAccountName: "",
  });

  // Load data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getOrganization();
        if (data) {
          setOrg(data);
          setFormData({
            name: data.name,
            slug: data.slug,
            bankName: data.bankName,
            bankAccountNo: data.bankAccountNo,
            bankAccountName: data.bankAccountName,
          });
          setIsNewOrg(false);
        } else {
          setIsNewOrg(true);
        }
      } catch (err) {
        console.error("Error loading organization:", err);
        showError("โหลดข้อมูลไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      }
    });
  }, [showError]);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  // Handle change
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50),
    }));
    setHasChanges(true);
  };

  // Save
  const handleSave = async () => {
    if (!formData.name || !formData.bankAccountNo || !formData.bankAccountName) {
      showError("กรุณากรอกข้อมูลให้ครบ", "ชื่อองค์กร, เลขบัญชี และชื่อบัญชีจำเป็นต้องกรอก");
      return;
    }

    setIsSaving(true);
    try {
      let result;
      if (isNewOrg) {
        result = await createOrganization({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
          bankName: formData.bankName,
          bankAccountNo: formData.bankAccountNo,
          bankAccountName: formData.bankAccountName,
        });
      } else if (org) {
        result = await updateOrganization(org.id, {
          name: formData.name,
          bankName: formData.bankName,
          bankAccountNo: formData.bankAccountNo,
          bankAccountName: formData.bankAccountName,
        });
      }

      if (result?.success) {
        success("บันทึกสำเร็จ", "ข้อมูลองค์กรถูกบันทึกเรียบร้อยแล้ว");
        setHasChanges(false);
        loadData();
      } else {
        showError("บันทึกไม่สำเร็จ", result?.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      showError("บันทึกไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--background)",
    fontSize: "0.9375rem",
    color: "var(--foreground)",
    outline: "none",
    transition: "all 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: "0.5rem",
  };

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(139, 92, 246, 0.3)",
            }}
          >
            <Building2 style={{ width: "28px", height: "28px", color: "white" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)" }}>ตั้งค่าองค์กร</h1>
              {hasChanges && (
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                  }}
                >
                  มีการเปลี่ยนแปลง
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              จัดการข้อมูลภาควิชาและบัญชีธนาคาร
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
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
            <RefreshCw style={{ width: "18px", height: "18px", animation: isPending ? "spin 1s linear infinite" : "none" }} />
            รีเฟรช
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              background: hasChanges ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" : "var(--muted)",
              color: "white",
              cursor: isSaving || !hasChanges ? "not-allowed" : "pointer",
              boxShadow: hasChanges ? "0 4px 12px rgba(139, 92, 246, 0.3)" : "none",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <RefreshCw style={{ width: "18px", height: "18px", animation: "spin 0.6s linear infinite" }} />
            ) : (
              <Save style={{ width: "18px", height: "18px" }} />
            )}
            บันทึก
          </button>
        </div>
      </motion.div>

      {/* New Org Alert */}
      {isNewOrg && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertTriangle style={{ width: "20px", height: "20px", color: "#f59e0b" }} />
          <span style={{ fontSize: "0.875rem", color: "#b45309", fontWeight: 500 }}>
            ยังไม่มีข้อมูลองค์กร - กรุณากรอกข้อมูลและบันทึกเพื่อสร้างองค์กรใหม่
          </span>
        </motion.div>
      )}

      {/* Existing Org Status */}
      {!isNewOrg && org && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            backgroundColor: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <CheckCircle2 style={{ width: "20px", height: "20px", color: "#22c55e" }} />
          <span style={{ fontSize: "0.875rem", color: "#15803d", fontWeight: 500 }}>
            เชื่อมต่อฐานข้อมูลสำเร็จ • {org.name}
          </span>
        </motion.div>
      )}

      {/* Form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Organization Info Card */}
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
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Globe style={{ width: "20px", height: "20px", color: "#8b5cf6" }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)" }}>ข้อมูลองค์กร</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ข้อมูลภาควิชา/คณะ</p>
            </div>
          </div>

          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>ชื่อองค์กร *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="เช่น ภาควิชาวิศวกรรมคอมพิวเตอร์"
                style={inputStyle}
              />
            </div>

            {/* Slug */}
            <div>
              <label style={labelStyle}>
                URL Slug
                <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: "0.5rem" }}>(อัตโนมัติ)</span>
              </label>
              <div style={{ position: "relative" }}>
                <Hash
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
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="cpe-nu"
                  style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                  disabled={!isNewOrg}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bank Info Card */}
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
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard style={{ width: "20px", height: "20px", color: "#22c55e" }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)" }}>บัญชีธนาคาร</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>บัญชีสำหรับรับชำระเงิน</p>
            </div>
          </div>

          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Bank Name */}
            <div>
              <label style={labelStyle}>ธนาคาร *</label>
              <div style={{ position: "relative" }}>
                <Landmark
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
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: "2.5rem",
                    cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label style={labelStyle}>เลขบัญชี *</label>
              <input
                type="text"
                value={formData.bankAccountNo}
                onChange={(e) => handleChange("bankAccountNo", e.target.value)}
                placeholder="xxx-x-xxxxx-x"
                style={inputStyle}
              />
            </div>

            {/* Account Name */}
            <div>
              <label style={labelStyle}>ชื่อบัญชี *</label>
              <div style={{ position: "relative" }}>
                <User
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
                <input
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) => handleChange("bankAccountName", e.target.value)}
                  placeholder="ชื่อเจ้าของบัญชี"
                  style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

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
