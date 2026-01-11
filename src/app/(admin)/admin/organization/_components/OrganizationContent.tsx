"use client";
// =============================================================================
// Organization Settings Content - WITH COHORT MANAGEMENT
// Based on: src/docs/PROJECT-Background&Mission.md
// Features: Create Organization + Create Cohort, Real-time save, No-code admin
// =============================================================================

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
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
  Users,
  Plus,
  Calendar,
  DollarSign,
  Star,
} from "lucide-react";
import { useNotification } from "@/providers/notification-provider";
import {
  getOrganization,
  updateOrganization,
  createOrganization,
  getCohorts,
  createCohort,
  setActiveCohort,
  type OrganizationData,
  type CohortSettings,
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

// Current academic year (Buddhist Era)
const getCurrentAcademicYear = () => {
  const now = new Date();
  const thaiYear = now.getFullYear() + 543;
  // If before July, it's still the previous academic year
  if (now.getMonth() < 6) {
    return thaiYear - 1;
  }
  return thaiYear;
};

// CPE Generation calculation based on docs
const calculateCPEGeneration = (academicYear: number) => {
  const yearLast2Digits = academicYear % 100;
  return yearLast2Digits - 36;
};

export default function OrganizationContent() {
  const [mounted, setMounted] = useState(false);
  const { success, error: showError } = useNotification();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Data state
  const [org, setOrg] = useState<OrganizationData | null>(null);
  const [cohorts, setCohorts] = useState<CohortSettings[]>([]);
  const [isNewOrg, setIsNewOrg] = useState(false);
  const [showCohortForm, setShowCohortForm] = useState(false);

  // Form state - Organization
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bankName: "KASIKORNTHAI",
    bankAccountNo: "",
    bankAccountName: "",
  });

  // Form state - Cohort
  const [cohortFormData, setCohortFormData] = useState({
    name: "",
    academicYear: getCurrentAcademicYear(),
    monthlyFee: 70,
    penaltyFee: 10,
    startMonth: 7,
    endMonth: 3,
  });

  // Load data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const [orgData, cohortsData] = await Promise.all([
          getOrganization(),
          getCohorts(),
        ]);
        
        if (orgData) {
          setOrg(orgData);
          setFormData({
            name: orgData.name,
            slug: orgData.slug,
            bankName: orgData.bankName,
            bankAccountNo: orgData.bankAccountNo,
            bankAccountName: orgData.bankAccountName,
          });
          setIsNewOrg(false);
        } else {
          setIsNewOrg(true);
        }
        
        setCohorts(cohortsData);
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

  // Auto-update CPE name when academic year changes
  useEffect(() => {
    const cpeGen = calculateCPEGeneration(cohortFormData.academicYear);
    if (cpeGen > 0) {
      setCohortFormData(prev => ({
        ...prev,
        name: `CPE${cpeGen}`,
      }));
    }
  }, [cohortFormData.academicYear]);

  // Handle change - Organization
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

  // Save Organization
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

  // Create Cohort
  const handleCreateCohort = async () => {
    if (!cohortFormData.name || !cohortFormData.academicYear) {
      showError("กรุณากรอกข้อมูลให้ครบ", "ชื่อรุ่น และปีการศึกษาจำเป็นต้องกรอก");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createCohort({
        name: cohortFormData.name,
        academicYear: cohortFormData.academicYear,
        monthlyFee: cohortFormData.monthlyFee,
        penaltyFee: cohortFormData.penaltyFee,
        startMonth: cohortFormData.startMonth,
        endMonth: cohortFormData.endMonth,
        setAsActive: true,
      });

      if (result.success) {
        success("สร้างรุ่นสำเร็จ", `${cohortFormData.name} ถูกสร้างและตั้งเป็นรุ่นปัจจุบันแล้ว`);
        setShowCohortForm(false);
        setCohortFormData({
          name: "",
          academicYear: getCurrentAcademicYear(),
          monthlyFee: 70,
          penaltyFee: 10,
          startMonth: 7,
          endMonth: 3,
        });
        loadData();
      } else {
        showError("สร้างรุ่นไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      showError("สร้างรุ่นไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSaving(false);
    }
  };

  // Set Active Cohort
  const handleSetActiveCohort = async (cohortId: string) => {
    try {
      const result = await setActiveCohort(cohortId);
      if (result.success) {
        success("เปลี่ยนรุ่นสำเร็จ", "รุ่นที่เลือกถูกตั้งเป็นรุ่นปัจจุบันแล้ว");
        loadData();
      } else {
        showError("เปลี่ยนรุ่นไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      showError("เปลี่ยนรุ่นไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
              จัดการข้อมูลภาควิชา บัญชีธนาคาร และรุ่นนิสิต
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

      {/* Setup Guide for New Users */}
      {isNewOrg && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            padding: "1.25rem",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1e40af", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Star style={{ width: "18px", height: "18px" }} />
            เริ่มต้นใช้งานระบบ
          </h3>
          <ol style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "#1e40af", lineHeight: 1.8 }}>
            <li><strong>ขั้นตอนที่ 1:</strong> กรอกข้อมูลองค์กร (ชื่อภาควิชา, บัญชีธนาคาร) แล้วกด บันทึก</li>
            <li><strong>ขั้นตอนที่ 2:</strong> สร้างรุ่น (เช่น CPE30 สำหรับปี 2566) โดยกดปุ่ม "สร้างรุ่นใหม่"</li>
            <li><strong>ขั้นตอนที่ 3:</strong> ไปที่หน้า "สมาชิก" เพื่อนำเข้ารายชื่อนิสิต</li>
          </ol>
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

      {/* Form Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
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
              <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>ภาควิชา/คณะ</p>
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

      {/* Cohorts Section */}
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
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users style={{ width: "20px", height: "20px", color: "#3b82f6" }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)" }}>รุ่นนิสิต (Cohorts)</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>จัดการรุ่นสำหรับเก็บเงินค่าสาขา</p>
            </div>
          </div>
          <button
            onClick={() => setShowCohortForm(!showCohortForm)}
            disabled={isNewOrg}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "none",
              background: isNewOrg ? "var(--muted)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              cursor: isNewOrg ? "not-allowed" : "pointer",
              opacity: isNewOrg ? 0.5 : 1,
            }}
            title={isNewOrg ? "กรุณาสร้างองค์กรก่อน" : "สร้างรุ่นใหม่"}
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            สร้างรุ่นใหม่
          </button>
        </div>

        {/* New Cohort Form */}
        <AnimatePresence>
          {showCohortForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                overflow: "hidden",
                backgroundColor: "rgba(59, 130, 246, 0.05)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ padding: "1.25rem" }}>
                <h4 style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "1rem" }}>
                  🎓 สร้างรุ่นใหม่
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>ปีการศึกษา (พ.ศ.) *</label>
                    <div style={{ position: "relative" }}>
                      <Calendar style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "var(--muted)" }} />
                      <input
                        type="number"
                        value={cohortFormData.academicYear}
                        onChange={(e) => setCohortFormData(prev => ({ ...prev, academicYear: parseInt(e.target.value) || 2568 }))}
                        style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                        min={2560}
                        max={2600}
                      />
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                      CPE Generation: {calculateCPEGeneration(cohortFormData.academicYear) > 0 ? `CPE${calculateCPEGeneration(cohortFormData.academicYear)}` : "-"}
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>ชื่อรุ่น *</label>
                    <input
                      type="text"
                      value={cohortFormData.name}
                      onChange={(e) => setCohortFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="เช่น CPE30"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>ค่าสาขา (บาท/เดือน)</label>
                    <div style={{ position: "relative" }}>
                      <DollarSign style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "var(--muted)" }} />
                      <input
                        type="number"
                        value={cohortFormData.monthlyFee}
                        onChange={(e) => setCohortFormData(prev => ({ ...prev, monthlyFee: parseInt(e.target.value) || 70 }))}
                        style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                        min={1}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>ค่าปรับ (บาท/เดือน)</label>
                    <input
                      type="number"
                      value={cohortFormData.penaltyFee}
                      onChange={(e) => setCohortFormData(prev => ({ ...prev, penaltyFee: parseInt(e.target.value) || 10 }))}
                      style={inputStyle}
                      min={10}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    onClick={handleCreateCohort}
                    disabled={isSaving}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      border: "none",
                      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      color: "white",
                      cursor: isSaving ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSaving ? <RefreshCw style={{ width: "16px", height: "16px", animation: "spin 0.6s linear infinite" }} /> : <CheckCircle2 style={{ width: "16px", height: "16px" }} />}
                    สร้างรุ่น
                  </button>
                  <button
                    onClick={() => setShowCohortForm(false)}
                    style={{
                      padding: "0.625rem 1rem",
                      borderRadius: "10px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                      cursor: "pointer",
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cohorts List */}
        <div style={{ padding: "1.25rem" }}>
          {cohorts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
              <Users style={{ width: "48px", height: "48px", margin: "0 auto 1rem", opacity: 0.5 }} />
              <p style={{ fontSize: "0.9375rem", fontWeight: 500 }}>ยังไม่มีรุ่นในระบบ</p>
              <p style={{ fontSize: "0.8125rem", marginTop: "0.5rem" }}>
                {isNewOrg ? "กรุณาสร้างองค์กรก่อน แล้วค่อยสร้างรุ่น" : "กดปุ่ม \"สร้างรุ่นใหม่\" เพื่อเริ่มต้น"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {cohorts.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    borderRadius: "12px",
                    backgroundColor: c.isActive ? "rgba(34, 197, 94, 0.1)" : "var(--accent)",
                    border: c.isActive ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: c.isActive ? "rgba(34, 197, 94, 0.2)" : "var(--background)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Users style={{ width: "18px", height: "18px", color: c.isActive ? "#22c55e" : "var(--muted)" }} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{c.name}</span>
                        {c.isActive && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              backgroundColor: "rgba(34, 197, 94, 0.2)",
                              color: "#16a34a",
                            }}
                          >
                            ใช้งานอยู่
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                        ปีการศึกษา {c.academicYear} • ค่าสาขา {c.monthlyFee} บาท/เดือน
                      </p>
                    </div>
                  </div>
                  {!c.isActive && (
                    <button
                      onClick={() => handleSetActiveCohort(c.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                        cursor: "pointer",
                      }}
                    >
                      ตั้งเป็นปัจจุบัน
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Guidance Alert */}
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
            กรุณากรอกข้อมูลองค์กรและบันทึกก่อน จึงจะสามารถสร้างรุ่นได้
          </span>
        </motion.div>
      )}

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
