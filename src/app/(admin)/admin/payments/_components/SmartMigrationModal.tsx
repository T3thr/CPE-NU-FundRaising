"use client";
// =============================================================================
// Smart Migration Modal - AI-like Data Migration from Google Sheets
// Based on: src/docs/OLD-SYSTEM-GoogleSheetSpec.md
// Features: Copy-paste & XLSX support, Smart column detection, Preview
// =============================================================================

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileSpreadsheet,
  Sparkles,
  Check,
  AlertCircle,
  Download,
  RefreshCw,
  ChevronRight,
  Eye,
  Database,
  Table,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileUp,
  Clipboard,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import { appConfig } from "@/config/app.config";
import { useNotification } from "@/providers/notification-provider";

// =============================================================================
// Types
// =============================================================================

interface DetectedColumn {
  index: number;
  name: string;
  type: "studentId" | "name" | "title" | "amount" | "month" | "year" | "timestamp" | "slipUrl" | "email" | "unknown";
  confidence: number;
  sample: string;
}

interface MigrationRecord {
  studentId: string;
  firstName: string;
  lastName: string;
  title?: string;
  amount: number;
  month: number;
  year: number;
  slipUrl?: string;
  timestamp?: string;
  isValid: boolean;
  errors: string[];
}

interface MigrationSummary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  uniqueStudents: number;
  totalAmount: number;
  monthsCovered: number[];
  yearsCovered: number[];
}

// Month name mappings (Thai -> number)
const THAI_MONTH_MAP: Record<string, number> = {
  "มกราคม": 1, "ม.ค.": 1, "ม.ค": 1, "มค": 1, "january": 1, "jan": 1,
  "กุมภาพันธ์": 2, "ก.พ.": 2, "ก.พ": 2, "กพ": 2, "february": 2, "feb": 2,
  "มีนาคม": 3, "มี.ค.": 3, "มี.ค": 3, "มีค": 3, "march": 3, "mar": 3,
  "เมษายน": 4, "เม.ย.": 4, "เม.ย": 4, "เมย": 4, "april": 4, "apr": 4,
  "พฤษภาคม": 5, "พ.ค.": 5, "พ.ค": 5, "พค": 5, "may": 5,
  "มิถุนายน": 6, "มิ.ย.": 6, "มิ.ย": 6, "มิย": 6, "june": 6, "jun": 6,
  "กรกฎาคม": 7, "ก.ค.": 7, "ก.ค": 7, "กค": 7, "july": 7, "jul": 7,
  "สิงหาคม": 8, "ส.ค.": 8, "ส.ค": 8, "สค": 8, "august": 8, "aug": 8,
  "กันยายน": 9, "ก.ย.": 9, "ก.ย": 9, "กย": 9, "september": 9, "sep": 9,
  "ตุลาคม": 10, "ต.ค.": 10, "ต.ค": 10, "ตค": 10, "october": 10, "oct": 10,
  "พฤศจิกายน": 11, "พ.ย.": 11, "พ.ย": 11, "พย": 11, "november": 11, "nov": 11,
  "ธันวาคม": 12, "ธ.ค.": 12, "ธ.ค": 12, "ธค": 12, "december": 12, "dec": 12,
};

// =============================================================================
// Smart Column Detection (AI-like)
// =============================================================================

function detectColumnType(headerName: string, samples: string[]): { type: DetectedColumn["type"]; confidence: number } {
  const header = headerName.toLowerCase().trim();
  const sampleStr = samples.join(" ").toLowerCase();

  // Student ID detection
  if (header.includes("รหัส") || header.includes("student") || header.includes("id")) {
    return { type: "studentId", confidence: 0.95 };
  }
  if (samples.some(s => /^\d{8}$/.test(s.trim()))) {
    return { type: "studentId", confidence: 0.85 };
  }

  // Name detection
  if (header.includes("ชื่อ") && !header.includes("คำนำ") || header.includes("name")) {
    return { type: "name", confidence: 0.9 };
  }

  // Title detection (คำนำหน้า)
  if (header.includes("คำนำหน้า") || header.includes("title") || header.includes("prefix")) {
    return { type: "title", confidence: 0.95 };
  }
  if (samples.some(s => /^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)$/.test(s.trim()))) {
    return { type: "title", confidence: 0.9 };
  }

  // Amount detection
  if (header.includes("จำนวน") || header.includes("เงิน") || header.includes("amount") || header.includes("บาท")) {
    return { type: "amount", confidence: 0.95 };
  }
  if (samples.some(s => /^\d{2,4}$/.test(s.trim()) && parseInt(s) >= 50 && parseInt(s) <= 2000)) {
    return { type: "amount", confidence: 0.7 };
  }

  // Month detection
  if (header.includes("เดือน") || header.includes("month")) {
    return { type: "month", confidence: 0.95 };
  }
  // Check if header itself is a month name
  if (Object.keys(THAI_MONTH_MAP).some(m => header.includes(m.toLowerCase()))) {
    return { type: "month", confidence: 0.9 };
  }

  // Year detection
  if (header.includes("ปี") || header.includes("year")) {
    return { type: "year", confidence: 0.95 };
  }
  if (samples.some(s => /^(25)?\d{2}$/.test(s.trim()) && (parseInt(s) >= 60 && parseInt(s) <= 99 || parseInt(s) >= 2560))) {
    return { type: "year", confidence: 0.8 };
  }

  // Timestamp detection
  if (header.includes("เวลา") || header.includes("timestamp") || header.includes("วันที่") || header.includes("date")) {
    return { type: "timestamp", confidence: 0.9 };
  }

  // Slip URL detection
  if (header.includes("slip") || header.includes("สลิป") || header.includes("link") || header.includes("url") || header.includes("รูป")) {
    return { type: "slipUrl", confidence: 0.9 };
  }
  if (samples.some(s => s.includes("http") || s.includes("drive.google"))) {
    return { type: "slipUrl", confidence: 0.85 };
  }

  // Email detection
  if (header.includes("email") || header.includes("อีเมล") || header.includes("mail")) {
    return { type: "email", confidence: 0.95 };
  }
  if (samples.some(s => /@/.test(s))) {
    return { type: "email", confidence: 0.9 };
  }

  return { type: "unknown", confidence: 0 };
}

function parseMonth(value: string): number | null {
  const cleaned = value.toLowerCase().trim();
  
  // Check direct number
  const num = parseInt(cleaned);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;
  
  // Check Thai/English month names
  for (const [name, monthNum] of Object.entries(THAI_MONTH_MAP)) {
    if (cleaned.includes(name.toLowerCase())) {
      return monthNum;
    }
  }
  
  return null;
}

function parseYear(value: string): number | null {
  const cleaned = value.trim();
  const num = parseInt(cleaned);
  
  if (isNaN(num)) return null;
  
  // 2-digit year (e.g., 68)
  if (num >= 60 && num <= 99) return num;
  
  // 4-digit Buddhist year (e.g., 2568)
  if (num >= 2560 && num <= 2599) return num % 100;
  
  // 4-digit CE year (e.g., 2025)
  if (num >= 2020 && num <= 2030) return (num + 543) % 100;
  
  return null;
}

// =============================================================================
// Smart Migration Modal Component
// =============================================================================

interface SmartMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrate: (records: MigrationRecord[]) => Promise<void>;
  cohortId?: string;
  selectedYear?: number; // Year selected in PaymentsContent (CE)
  monthlyFee?: number;
}

export default function SmartMigrationModal({ isOpen, onClose, onMigrate, cohortId, selectedYear, monthlyFee = 70 }: SmartMigrationModalProps) {
  const { success, error: showError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [step, setStep] = useState<"input" | "mapping" | "preview" | "importing">("input");
  const [inputMode, setInputMode] = useState<"paste" | "file">("paste");
  const [rawData, setRawData] = useState("");
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [detectedColumns, setDetectedColumns] = useState<DetectedColumn[]>([]);
  const [records, setRecords] = useState<MigrationRecord[]>([]);
  const [summary, setSummary] = useState<MigrationSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Reset state
  const handleReset = () => {
    setStep("input");
    setRawData("");
    setParsedRows([]);
    setDetectedColumns([]);
    setRecords([]);
    setSummary(null);
    setIsProcessing(false);
    setImportProgress(0);
  };

  // Parse TSV/CSV data
  const parseData = useCallback((text: string) => {
    const lines = text.trim().split("\n");
    const rows: string[][] = [];
    
    for (const line of lines) {
      // Detect delimiter (Tab or Comma)
      const delimiter = line.includes("\t") ? "\t" : ",";
      const cols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ""));
      if (cols.some(c => c)) rows.push(cols);
    }
    
    return rows;
  }, []);

  // Smart detect columns
  const detectColumns = useCallback((rows: string[][]) => {
    if (rows.length < 2) return [];
    
    const headers = rows[0];
    const dataRows = rows.slice(1, Math.min(10, rows.length)); // Sample first 10 rows
    
    const columns: DetectedColumn[] = headers.map((header, idx) => {
      const samples = dataRows.map(row => row[idx] || "").filter(s => s);
      const { type, confidence } = detectColumnType(header, samples);
      
      return {
        index: idx,
        name: header,
        type,
        confidence,
        sample: samples[0] || "",
      };
    });
    
    return columns;
  }, []);

  // Handle paste
  const handlePaste = useCallback((text: string) => {
    setRawData(text);
    if (text.trim()) {
      const rows = parseData(text);
      setParsedRows(rows);
      if (rows.length > 1) {
        const cols = detectColumns(rows);
        setDetectedColumns(cols);
        setStep("mapping");
      }
    }
  }, [parseData, detectColumns]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // Dynamic import xlsx library
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_csv(sheet, { FS: "\t" });
        handlePaste(data);
      } else if (file.name.endsWith(".csv")) {
        const text = await file.text();
        handlePaste(text);
      } else {
        showError("ไม่รองรับไฟล์นี้", "กรุณาอัปโหลดไฟล์ .xlsx, .xls หรือ .csv");
      }
    } catch (err) {
      console.error("File upload error:", err);
      showError("เกิดข้อผิดพลาด", "ไม่สามารถอ่านไฟล์ได้");
    } finally {
      setIsProcessing(false);
    }
  };

  // Transform data based on column mapping
  const transformData = useCallback(() => {
    const colMap: Record<string, number> = {};
    detectedColumns.forEach(col => {
      if (col.type !== "unknown") {
        colMap[col.type] = col.index;
      }
    });

    const dataRows = parsedRows.slice(1); // Skip header
    const migrationRecords: MigrationRecord[] = [];

    for (const row of dataRows) {
      const errors: string[] = [];
      
      // Extract student ID
      let studentId = "";
      if (colMap.studentId !== undefined) {
        studentId = row[colMap.studentId]?.trim().replace(/\D/g, "").slice(0, 8) || "";
      }
      if (!studentId || studentId.length !== 8) {
        errors.push("รหัสนิสิตไม่ถูกต้อง");
      }

      // Extract name
      let firstName = "";
      let lastName = "";
      let title = "";
      
      if (colMap.title !== undefined) {
        title = row[colMap.title]?.trim() || "";
      }
      
      if (colMap.name !== undefined) {
        const fullName = row[colMap.name]?.trim() || "";
        // Check if name includes title
        const titleMatch = fullName.match(/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)\s*(.+)$/);
        if (titleMatch) {
          title = title || titleMatch[1];
          const nameParts = titleMatch[2].split(/\s+/);
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        } else {
          const nameParts = fullName.split(/\s+/);
          firstName = nameParts[0] || "";
          lastName = nameParts.slice(1).join(" ") || "";
        }
      }

      // Extract amount
      let amount = 70; // default
      if (colMap.amount !== undefined) {
        const amountStr = row[colMap.amount]?.trim().replace(/[^\d.]/g, "") || "";
        const parsed = parseFloat(amountStr);
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
        }
      }

      // Extract month
      let month: number | null = null;
      if (colMap.month !== undefined) {
        month = parseMonth(row[colMap.month] || "");
      }
      if (month === null) {
        errors.push("ไม่พบข้อมูลเดือน");
      }

      // Extract year
      let year: number | null = null;
      if (colMap.year !== undefined) {
        year = parseYear(row[colMap.year] || "");
      }
      if (year === null) {
        // Default to selected year from PaymentsContent (convert CE to BE short)
        const defaultYear = selectedYear ? (selectedYear + 543) % 100 : (new Date().getFullYear() + 543) % 100;
        year = defaultYear;
      }

      // Extract optional fields
      const slipUrl = colMap.slipUrl !== undefined ? row[colMap.slipUrl]?.trim() : undefined;
      const timestamp = colMap.timestamp !== undefined ? row[colMap.timestamp]?.trim() : undefined;

      migrationRecords.push({
        studentId,
        firstName,
        lastName,
        title,
        amount,
        month: month || 0,
        year: year || 0,
        slipUrl,
        timestamp,
        isValid: errors.length === 0,
        errors,
      });
    }

    // Calculate summary
    const valid = migrationRecords.filter(r => r.isValid);
    const uniqueStudents = new Set(valid.map(r => r.studentId));
    const months = Array.from(new Set(valid.map(r => r.month))).sort((a, b) => a - b);
    const years = Array.from(new Set(valid.map(r => r.year))).sort((a, b) => a - b);

    const summary: MigrationSummary = {
      totalRecords: migrationRecords.length,
      validRecords: valid.length,
      invalidRecords: migrationRecords.length - valid.length,
      uniqueStudents: uniqueStudents.size,
      totalAmount: valid.reduce((sum, r) => sum + r.amount, 0),
      monthsCovered: months,
      yearsCovered: years,
    };

    setRecords(migrationRecords);
    setSummary(summary);
    setStep("preview");
  }, [detectedColumns, parsedRows, selectedYear]);

  // Handle column type change
  const handleColumnTypeChange = (index: number, newType: DetectedColumn["type"]) => {
    setDetectedColumns(cols => 
      cols.map(col => 
        col.index === index 
          ? { ...col, type: newType, confidence: 1 }
          : col
      )
    );
  };

  // Execute migration
  const handleExecuteMigration = async () => {
    const validRecords = records.filter(r => r.isValid);
    if (validRecords.length === 0) {
      showError("ไม่มีข้อมูลที่ถูกต้อง", "กรุณาตรวจสอบข้อมูลอีกครั้ง");
      return;
    }

    setStep("importing");
    setImportProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onMigrate(validRecords);
      
      clearInterval(interval);
      setImportProgress(100);

      success("Migration สำเร็จ!", `นำเข้า ${validRecords.length} รายการเรียบร้อยแล้ว`);
      
      setTimeout(() => {
        handleReset();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Migration error:", err);
      showError("Migration ไม่สำเร็จ", "เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
      setStep("preview");
    }
  };

  if (!isOpen) return null;

  const columnTypeOptions = [
    { value: "studentId", label: "รหัสนิสิต", icon: "🎓" },
    { value: "name", label: "ชื่อ-นามสกุล", icon: "👤" },
    { value: "title", label: "คำนำหน้า", icon: "📛" },
    { value: "amount", label: "จำนวนเงิน", icon: "💰" },
    { value: "month", label: "เดือน", icon: "📅" },
    { value: "year", label: "ปี", icon: "📆" },
    { value: "slipUrl", label: "ลิงก์สลิป", icon: "🔗" },
    { value: "timestamp", label: "วันที่/เวลา", icon: "⏰" },
    { value: "email", label: "อีเมล", icon: "📧" },
    { value: "unknown", label: "ไม่ใช้", icon: "❌" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: step === "preview" ? "1200px" : "900px",
              maxHeight: "calc(100vh - 2rem)",
              height: "auto",
              backgroundColor: "var(--card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.4)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 16px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <Sparkles style={{ width: "24px", height: "24px", color: "white" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)" }}>
                    🚀 Smart Migration
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {step === "input" && "นำเข้าข้อมูลจาก Google Sheets / Excel"}
                    {step === "mapping" && "ตรวจสอบการจับคู่คอลัมน์"}
                    {step === "preview" && "ตรวจสอบข้อมูลก่อนนำเข้า"}
                    {step === "importing" && "กำลังนำเข้าข้อมูล..."}
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {["input", "mapping", "preview"].map((s, idx) => (
                  <React.Fragment key={s}>
                    {idx > 0 && <ChevronRight style={{ width: "16px", height: "16px", color: "var(--muted)" }} />}
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        backgroundColor: step === s || ["mapping", "preview"].indexOf(step) > ["input", "mapping", "preview"].indexOf(s)
                          ? "rgba(139, 92, 246, 0.2)"
                          : "var(--accent)",
                        color: step === s || ["mapping", "preview"].indexOf(step) > ["input", "mapping", "preview"].indexOf(s)
                          ? "#8b5cf6"
                          : "var(--muted)",
                        border: step === s ? "2px solid #8b5cf6" : "none",
                      }}
                    >
                      {idx + 1}
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={onClose}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "var(--accent)",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
              {/* Step 1: Input */}
              {step === "input" && (
                <div>
                  {/* Mode selector */}
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <button
                      onClick={() => setInputMode("paste")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.75rem",
                        padding: "1rem",
                        borderRadius: "12px",
                        border: inputMode === "paste" ? "2px solid #8b5cf6" : "1px solid var(--border)",
                        backgroundColor: inputMode === "paste" ? "rgba(139, 92, 246, 0.1)" : "var(--background)",
                        color: inputMode === "paste" ? "#8b5cf6" : "var(--foreground)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <Clipboard style={{ width: "24px", height: "24px" }} />
                      Copy & Paste
                    </button>
                    <button
                      onClick={() => setInputMode("file")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.75rem",
                        padding: "1rem",
                        borderRadius: "12px",
                        border: inputMode === "file" ? "2px solid #8b5cf6" : "1px solid var(--border)",
                        backgroundColor: inputMode === "file" ? "rgba(139, 92, 246, 0.1)" : "var(--background)",
                        color: inputMode === "file" ? "#8b5cf6" : "var(--foreground)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <FileUp style={{ width: "24px", height: "24px" }} />
                      Upload File
                    </button>
                  </div>

                  {inputMode === "paste" ? (
                    <>
                      {/* Instructions */}
                      <div
                        style={{
                          padding: "1rem",
                          borderRadius: "12px",
                          backgroundColor: "rgba(139, 92, 246, 0.1)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          marginBottom: "1.25rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                          <FileSpreadsheet style={{ width: "20px", height: "20px", color: "#8b5cf6", flexShrink: 0, marginTop: "2px" }} />
                          <div style={{ fontSize: "0.875rem", color: "#6d28d9" }}>
                            <strong>รองรับข้อมูลจาก Google Sheets เก่า:</strong>
                            <ul style={{ marginTop: "0.5rem", marginLeft: "1.25rem", lineHeight: 1.8 }}>
                              <li><strong>Sheet Records:</strong> ประวัติการโอนเงิน (รหัสนิสิต, จำนวนเงิน, เดือน, ปี...)</li>
                              <li><strong>Sheet Dashboard:</strong> ตารางสถานะการชำระเงินรายบุคคล</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Text Area */}
                      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                        วางข้อมูลจาก Google Sheets / Excel ที่นี่
                      </label>
                      <textarea
                        value={rawData}
                        onChange={(e) => handlePaste(e.target.value)}
                        onPaste={(e) => {
                          const text = e.clipboardData.getData("text");
                          handlePaste(text);
                        }}
                        placeholder={`ตัวอย่าง:\nประทับเวลา\tรหัสนิสิต\tจำนวนเงิน\tสลิป\tปี\tเดือน\n01/01/2025\t66360001\t70\thttps://...\t68\tกรกฎาคม`}
                        style={{
                          width: "100%",
                          height: "250px",
                          padding: "1rem",
                          borderRadius: "12px",
                          border: "2px dashed var(--border)",
                          backgroundColor: "var(--background)",
                          fontSize: "0.875rem",
                          fontFamily: "monospace",
                          color: "var(--foreground)",
                          resize: "vertical",
                          outline: "none",
                        }}
                      />
                      <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                        💡 Tip: ระบบจะตรวจจับรูปแบบคอลัมน์อัตโนมัติ ไม่ต้องจัดรูปแบบก่อนวาง
                      </p>
                    </>
                  ) : (
                    <>
                      {/* File Upload Area */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "3rem",
                          borderRadius: "16px",
                          border: "2px dashed var(--border)",
                          backgroundColor: "var(--background)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw style={{ width: "48px", height: "48px", color: "#8b5cf6", animation: "spin 1s linear infinite" }} />
                            <p style={{ marginTop: "1rem", fontWeight: 600, color: "var(--foreground)" }}>กำลังอ่านไฟล์...</p>
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet style={{ width: "48px", height: "48px", color: "var(--muted)" }} />
                            <p style={{ marginTop: "1rem", fontWeight: 600, color: "var(--foreground)" }}>ลากไฟล์มาวางหรือคลิกเพื่อเลือก</p>
                            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                              รองรับ: .xlsx, .xls, .csv
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Column Mapping */}
              {step === "mapping" && (
                <div>
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "12px",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                      marginBottom: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <CheckCircle2 style={{ width: "20px", height: "20px", color: "#22c55e" }} />
                    <span style={{ fontSize: "0.875rem", color: "#15803d" }}>
                      พบ <strong>{parsedRows.length - 1}</strong> รายการ, <strong>{detectedColumns.length}</strong> คอลัมน์
                    </span>
                  </div>

                  <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
                    ระบบตรวจจับประเภทคอลัมน์อัตโนมัติ กรุณาตรวจสอบและแก้ไขหากไม่ถูกต้อง
                  </p>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>คอลัมน์</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>ตัวอย่าง</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>ประเภท</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>ความมั่นใจ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detectedColumns.map((col) => (
                          <tr key={col.index} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{col.name || `Column ${col.index + 1}`}</td>
                            <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", color: "var(--muted)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {col.sample || "-"}
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <select
                                value={col.type}
                                onChange={(e) => handleColumnTypeChange(col.index, e.target.value as DetectedColumn["type"])}
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "8px",
                                  border: "1px solid var(--border)",
                                  backgroundColor: "var(--background)",
                                  color: "var(--foreground)",
                                  fontSize: "0.875rem",
                                  cursor: "pointer",
                                }}
                              >
                                {columnTypeOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 8px",
                                  borderRadius: "9999px",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  backgroundColor: col.confidence >= 0.8 ? "rgba(34, 197, 94, 0.15)" : col.confidence >= 0.5 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                  color: col.confidence >= 0.8 ? "#22c55e" : col.confidence >= 0.5 ? "#f59e0b" : "#ef4444",
                                }}
                              >
                                {Math.round(col.confidence * 100)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 3: Preview */}
              {step === "preview" && summary && (
                <div>
                  {/* Summary Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ padding: "1rem", borderRadius: "12px", backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>{summary.totalRecords}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#1e40af" }}>รายการทั้งหมด</div>
                    </div>
                    <div style={{ padding: "1rem", borderRadius: "12px", backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e" }}>{summary.validRecords}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#15803d" }}>พร้อมนำเข้า</div>
                    </div>
                    {summary.invalidRecords > 0 && (
                      <div style={{ padding: "1rem", borderRadius: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444" }}>{summary.invalidRecords}</div>
                        <div style={{ fontSize: "0.8125rem", color: "#dc2626" }}>มีปัญหา</div>
                      </div>
                    )}
                    <div style={{ padding: "1rem", borderRadius: "12px", backgroundColor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#8b5cf6" }}>{summary.uniqueStudents}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#6d28d9" }}>สมาชิก</div>
                    </div>
                    <div style={{ padding: "1rem", borderRadius: "12px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>฿{summary.totalAmount.toLocaleString()}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#b45309" }}>ยอดรวม</div>
                    </div>
                  </div>

                  {/* Data Table Preview */}
                  <div style={{ borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto", maxHeight: "400px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                        <thead style={{ position: "sticky", top: 0 }}>
                          <tr style={{ backgroundColor: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                            <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>สถานะ</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>รหัสนิสิต</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>ชื่อ-สกุล</th>
                            <th style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>จำนวนเงิน</th>
                            <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>เดือน</th>
                            <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>ปี</th>
                            <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.slice(0, 50).map((record, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid var(--border)", backgroundColor: record.isValid ? "transparent" : "rgba(239, 68, 68, 0.05)" }}>
                              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                {record.isValid ? (
                                  <CheckCircle2 style={{ width: "16px", height: "16px", color: "#22c55e" }} />
                                ) : (
                                  <XCircle style={{ width: "16px", height: "16px", color: "#ef4444" }} />
                                )}
                              </td>
                              <td style={{ padding: "0.75rem", fontFamily: "monospace" }}>{record.studentId || "-"}</td>
                              <td style={{ padding: "0.75rem" }}>
                                {record.title}{record.firstName} {record.lastName}
                              </td>
                              <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 500 }}>฿{record.amount}</td>
                              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                {record.month ? appConfig.thaiMonthsShort[record.month - 1] : "-"}
                              </td>
                              <td style={{ padding: "0.75rem", textAlign: "center" }}>{record.year || "-"}</td>
                              <td style={{ padding: "0.75rem", color: record.isValid ? "var(--muted)" : "#ef4444", fontSize: "0.75rem" }}>
                                {record.errors.join(", ") || (record.slipUrl ? "มีสลิป" : "-")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {records.length > 50 && (
                      <div style={{ padding: "0.75rem", textAlign: "center", color: "var(--muted)", fontSize: "0.8125rem", borderTop: "1px solid var(--border)" }}>
                        ... และอีก {records.length - 50} รายการ
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Importing */}
              {step === "importing" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem" }}>
                  <div style={{ position: "relative", width: "120px", height: "120px" }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={339.292}
                        strokeDashoffset={339.292 * (1 - importProgress / 100)}
                        transform="rotate(-90 60 60)"
                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#8b5cf6" }}>{importProgress}%</span>
                    </div>
                  </div>
                  <p style={{ marginTop: "1.5rem", fontWeight: 600, color: "var(--foreground)", fontSize: "1.125rem" }}>
                    กำลังนำเข้าข้อมูล...
                  </p>
                  <p style={{ marginTop: "0.5rem", color: "var(--muted)", fontSize: "0.875rem" }}>
                    กรุณารอสักครู่ อย่าปิดหน้านี้
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--accent)",
              }}
            >
              {step === "input" ? (
                <div style={{ flex: 1, textAlign: "right" }}>
                  <button
                    onClick={onClose}
                    style={{
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--foreground)",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : step === "mapping" ? (
                <>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--foreground)",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    ← กลับ
                  </button>
                  <button
                    onClick={transformData}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    <ArrowRight style={{ width: "18px", height: "18px" }} />
                    แปลงข้อมูล
                  </button>
                </>
              ) : step === "preview" ? (
                <>
                  <button
                    onClick={() => setStep("mapping")}
                    style={{
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--foreground)",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    ← กลับ
                  </button>
                  <button
                    onClick={handleExecuteMigration}
                    disabled={!summary || summary.validRecords === 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      border: "none",
                      background: summary && summary.validRecords > 0 ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--muted)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: summary && summary.validRecords > 0 ? "pointer" : "not-allowed",
                      boxShadow: summary && summary.validRecords > 0 ? "0 4px 12px rgba(34, 197, 94, 0.3)" : "none",
                    }}
                  >
                    <Database style={{ width: "18px", height: "18px" }} />
                    นำเข้า {summary?.validRecords || 0} รายการ
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
}
