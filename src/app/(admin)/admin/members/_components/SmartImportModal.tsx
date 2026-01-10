"use client";
// =============================================================================
// Smart Import Modal - Copy-Paste from Excel/Google Sheets
// Based on: src/docs/DESIGN-Database&DataEntry.md
// Features: Live Preview, Validation, Table Preview
// =============================================================================

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, AlertCircle, FileSpreadsheet, Sparkles, Eye, Table } from "lucide-react";
import { parsePasteData, type ParsedMember } from "@/utils/validation";
import { useNotification } from "@/providers/notification-provider";

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (members: ParsedMember[]) => void;
}

export default function SmartImportModal({ isOpen, onClose, onImport }: SmartImportModalProps) {
  const { success, error: showError } = useNotification();
  const [pastedText, setPastedText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedMember[]>([]);
  const [step, setStep] = useState<"paste" | "preview" | "table-preview">("paste");

  const handlePaste = useCallback((text: string) => {
    setPastedText(text);
    if (text.trim()) {
      const parsed = parsePasteData(text);
      setParsedData(parsed);
      if (parsed.length > 0) {
        setStep("preview");
      }
    } else {
      setParsedData([]);
      setStep("paste");
    }
  }, []);

  const handleTextAreaPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    handlePaste(text);
  };

  const handleConfirmImport = () => {
    const validMembers = parsedData.filter((m) => m.isValid);
    if (validMembers.length === 0) {
      showError("ไม่มีข้อมูลที่ถูกต้อง", "โปรดตรวจสอบข้อมูลที่วาง");
      return;
    }
    onImport(validMembers);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setPastedText("");
    setParsedData([]);
    setStep("paste");
  };

  const validCount = parsedData.filter((m) => m.isValid).length;
  const invalidCount = parsedData.filter((m) => !m.isValid).length;

  if (!isOpen) return null;

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
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
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
              maxWidth: step === "table-preview" ? "1000px" : "800px",
              maxHeight: "90vh",
              backgroundColor: "var(--card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
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
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles style={{ width: "24px", height: "24px", color: "white" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--foreground)" }}>
                    Smart Import
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                    {step === "paste" && "ก็อปปี้จาก Excel/Google Sheets มาวางได้เลย"}
                    {step === "preview" && "ตรวจสอบข้อมูลก่อนนำเข้า"}
                    {step === "table-preview" && "ตัวอย่างหน้าตาในเว็บ"}
                  </p>
                </div>
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
              {/* Step 1: Paste */}
              {step === "paste" && (
                <div>
                  {/* Instructions */}
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "12px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <FileSpreadsheet style={{ width: "20px", height: "20px", color: "#3b82f6", flexShrink: 0, marginTop: "2px" }} />
                      <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
                        <strong>วิธีใช้งาน:</strong>
                        <ol style={{ marginTop: "0.5rem", marginLeft: "1.25rem", lineHeight: 1.8 }}>
                          <li>เปิด Excel หรือ Google Sheets ที่มีรายชื่อนิสิต</li>
                          <li>
                            เลือก (Select) ข้อมูลที่ต้องการ แล้วกด{" "}
                            <kbd style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontSize: "0.75rem" }}>Ctrl+C</kbd>
                          </li>
                          <li>
                            มาวางในช่องด้านล่าง (
                            <kbd style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontSize: "0.75rem" }}>Ctrl+V</kbd>)
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Text Area */}
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                    วางข้อมูลที่นี่
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => handlePaste(e.target.value)}
                    onPaste={handleTextAreaPaste}
                    placeholder={`66360001\tนายสมชาย ใจดี\n66360002\tนางสาวสมหญิง รักเรียน\n...`}
                    style={{
                      width: "100%",
                      height: "200px",
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
                    รองรับ: รหัสนิสิต 8 หลัก + ชื่อ-นามสกุล (พร้อมหรือไม่มีคำนำหน้าก็ได้)
                  </p>
                </div>
              )}

              {/* Step 2: Preview Data */}
              {step === "preview" && (
                <div>
                  {/* Summary */}
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        flex: 1,
                        padding: "1rem",
                        borderRadius: "12px",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e" }}>{validCount}</div>
                      <div style={{ fontSize: "0.8125rem", color: "#15803d" }}>พร้อมนำเข้า</div>
                    </div>
                    {invalidCount > 0 && (
                      <div
                        style={{
                          flex: 1,
                          padding: "1rem",
                          borderRadius: "12px",
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444" }}>{invalidCount}</div>
                        <div style={{ fontSize: "0.8125rem", color: "#dc2626" }}>มีปัญหา</div>
                      </div>
                    )}
                  </div>

                  {/* View Toggle */}
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    <button
                      onClick={() => setStep("table-preview")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      <Eye style={{ width: "16px", height: "16px" }} />
                      ดูตัวอย่างในเว็บ
                    </button>
                  </div>

                  {/* Data Table */}
                  <div
                    style={{
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>สถานะ</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>รหัสนิสิต</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>คำนำหน้า</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>ชื่อ</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>นามสกุล</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 10).map((member, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              {member.isValid ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#22c55e" }}>
                                  <Check style={{ width: "14px", height: "14px" }} />
                                </span>
                              ) : (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#ef4444" }} title={member.errors.join(", ")}>
                                  <AlertCircle style={{ width: "14px", height: "14px" }} />
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace" }}>{member.studentId || "-"}</td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--muted)" }}>{member.title || "-"}</td>
                            <td style={{ padding: "0.75rem 1rem" }}>{member.firstName || "-"}</td>
                            <td style={{ padding: "0.75rem 1rem" }}>{member.lastName || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <div style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.8125rem", borderTop: "1px solid var(--border)" }}>
                        ... และอีก {parsedData.length - 10} รายการ
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Table Preview (How it looks in web) */}
              {step === "table-preview" && (
                <div>
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "12px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                      marginBottom: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <Table style={{ width: "20px", height: "20px", color: "#3b82f6" }} />
                    <span style={{ fontSize: "0.875rem", color: "#1e40af" }}>
                      <strong>ตัวอย่างหน้าตาในเว็บจริง:</strong> ข้อมูลจะแสดงในตารางดังนี้
                    </span>
                  </div>

                  {/* Mock Web Table */}
                  <div
                    style={{
                      backgroundColor: "var(--card)",
                      borderRadius: "16px",
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                    }}
                  >
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
                            <th style={{ padding: "0.875rem 1rem", textAlign: "center", fontWeight: 600, color: "var(--foreground)" }}>
                              สถานะ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData
                            .filter((m) => m.isValid)
                            .slice(0, 8)
                            .map((member, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", color: "var(--foreground)" }}>
                                  {member.studentId}
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
                                      {member.firstName.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                                      {member.title}
                                      {member.firstName} {member.lastName}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: "0.875rem 1rem", color: "var(--muted)" }}>{member.nickname || "-"}</td>
                                <td style={{ padding: "0.875rem 1rem", textAlign: "center" }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "4px 10px",
                                      borderRadius: "9999px",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                      backgroundColor: "rgba(34, 197, 94, 0.15)",
                                      color: "#22c55e",
                                    }}
                                  >
                                    ใช้งาน
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {validCount > 8 && (
                      <div style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.8125rem", borderTop: "1px solid var(--border)" }}>
                        ... และอีก {validCount - 8} รายการ
                      </div>
                    )}
                  </div>
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
              {step === "paste" ? (
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
              ) : step === "table-preview" ? (
                <>
                  <button
                    onClick={() => setStep("preview")}
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
                    onClick={handleConfirmImport}
                    disabled={validCount === 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      border: "none",
                      background: validCount > 0 ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--muted)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: validCount > 0 ? "pointer" : "not-allowed",
                      boxShadow: validCount > 0 ? "0 4px 12px rgba(34, 197, 94, 0.3)" : "none",
                    }}
                  >
                    <Upload style={{ width: "18px", height: "18px" }} />
                    นำเข้า {validCount} รายการ
                  </button>
                </>
              ) : (
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
                    วางข้อมูลใหม่
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={validCount === 0}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.625rem 1.25rem",
                      borderRadius: "10px",
                      border: "none",
                      background: validCount > 0 ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "var(--muted)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: validCount > 0 ? "pointer" : "not-allowed",
                      boxShadow: validCount > 0 ? "0 4px 12px rgba(34, 197, 94, 0.3)" : "none",
                    }}
                  >
                    <Upload style={{ width: "18px", height: "18px" }} />
                    นำเข้า {validCount} รายการ
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
