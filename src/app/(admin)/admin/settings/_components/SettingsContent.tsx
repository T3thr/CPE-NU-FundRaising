"use client";
// =============================================================================
// Settings Content - Admin Configuration Panel
// Using Line Messaging API (2026 Standard)
// =============================================================================

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  MessageCircle,
  Zap,
  Clock,
  Calendar,
  DollarSign,
  AlertTriangle,
  Send,
  RefreshCw
} from "lucide-react";
import { useNotification } from "@/providers/notification-provider";
import { appConfig } from "@/config/app.config";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Service status check functions
async function checkEasySlipStatus() {
  try {
    const res = await fetch("/api/easyslip/verify");
    return await res.json();
  } catch {
    return { enabled: false };
  }
}

async function checkLineMessagingStatus() {
  try {
    const res = await fetch("/api/line-messaging");
    return await res.json();
  } catch {
    return { enabled: false };
  }
}

export default function SettingsContent() {
  const { success, error } = useNotification();
  
  // Service status
  const [easySlipStatus, setEasySlipStatus] = useState<{
    enabled: boolean;
    quotaPerWeek?: number;
    usage?: { used: number; remaining: number };
  } | null>(null);
  
  const [lineStatus, setLineStatus] = useState<{
    enabled: boolean;
    targetType?: "group" | "user" | null;
    error?: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    monthlyFee: appConfig.payment.defaultMonthlyFee,
    penaltyFee: appConfig.payment.defaultPenaltyFee,
    startMonth: appConfig.academic.startMonth,
    academicYear: appConfig.academic.currentYear,
    autoVerifyEnabled: true,
    notificationsEnabled: true,
  });

  // Load service status on mount
  useEffect(() => {
    async function loadStatus() {
      setIsLoading(true);
      const [easySlip, line] = await Promise.all([
        checkEasySlipStatus(),
        checkLineMessagingStatus(),
      ]);
      setEasySlipStatus(easySlip);
      setLineStatus(line);
      setIsLoading(false);
    }
    loadStatus();
  }, []);

  const handleRefreshStatus = async () => {
    setIsLoading(true);
    const [easySlip, line] = await Promise.all([
      checkEasySlipStatus(),
      checkLineMessagingStatus(),
    ]);
    setEasySlipStatus(easySlip);
    setLineStatus(line);
    setIsLoading(false);
    success("รีเฟรชสำเร็จ", "อัปเดตสถานะบริการแล้ว");
  };

  const handleSaveSettings = async () => {
    // TODO: Save to database
    success("บันทึกสำเร็จ", "การตั้งค่าถูกบันทึกเรียบร้อยแล้ว");
  };

  const handleTestLineMessage = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/line-messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "custom",
          data: {
            message: "🧪 ทดสอบการแจ้งเตือน\n\nระบบ CPE Funds Hub ทำงานปกติ!",
          },
        }),
      });
      
      const result = await res.json();
      if (result.success) {
        success("ส่งสำเร็จ", "ข้อความทดสอบถูกส่งไปยัง Line แล้ว");
      } else {
        error("ส่งไม่สำเร็จ", result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      error("ส่งไม่สำเร็จ", "ไม่สามารถเชื่อมต่อ API ได้");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">ตั้งค่าระบบ</h1>
            <p className="text-[var(--muted)]">จัดการการตั้งค่าและบริการต่างๆ</p>
          </div>
        </div>
        
        <button
          onClick={handleRefreshStatus}
          disabled={isLoading}
          className="btn btn-secondary gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          รีเฟรชสถานะ
        </button>
      </motion.div>

      {/* Service Status */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* EasySlip Status */}
        <motion.div variants={fadeInUp} className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">EasySlip</h3>
                <p className="text-sm text-[var(--muted)]">ตรวจสอบ Slip อัตโนมัติ</p>
              </div>
            </div>
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-[var(--border)] border-t-primary-500 rounded-full animate-spin" />
            ) : easySlipStatus?.enabled ? (
              <span className="badge badge-success gap-1">
                <CheckCircle2 className="w-3 h-3" />
                เชื่อมต่อแล้ว
              </span>
            ) : (
              <span className="badge badge-danger gap-1">
                <XCircle className="w-3 h-3" />
                ไม่ได้เชื่อมต่อ
              </span>
            )}
          </div>
          
          {easySlipStatus?.enabled && easySlipStatus.usage && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">โควต้าสัปดาห์นี้</span>
                <span className="font-semibold">
                  {easySlipStatus.usage.remaining}/{easySlipStatus.quotaPerWeek}
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(easySlipStatus.usage.remaining / (easySlipStatus.quotaPerWeek || 50)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
          
          {!easySlipStatus?.enabled && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                ตั้งค่า <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">EASYSLIP_API_KEY</code> ใน .env
              </p>
            </div>
          )}
        </motion.div>

        {/* Line Messaging Status */}
        <motion.div variants={fadeInUp} className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Line Messaging</h3>
                <p className="text-sm text-[var(--muted)]">แจ้งเตือนผู้ดูแล (2026)</p>
              </div>
            </div>
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-[var(--border)] border-t-primary-500 rounded-full animate-spin" />
            ) : lineStatus?.enabled ? (
              <span className="badge badge-success gap-1">
                <CheckCircle2 className="w-3 h-3" />
                เชื่อมต่อแล้ว
              </span>
            ) : (
              <span className="badge badge-danger gap-1">
                <XCircle className="w-3 h-3" />
                ไม่ได้เชื่อมต่อ
              </span>
            )}
          </div>
          
          {lineStatus?.enabled && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--muted)]">
                ประเภท: {lineStatus.targetType === "group" ? "กลุ่ม" : "ผู้ใช้"}
              </p>
              <button
                onClick={handleTestLineMessage}
                disabled={isSending}
                className="btn btn-secondary gap-2 w-full"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                ทดสอบส่งข้อความ
              </button>
            </div>
          )}
          
          {!lineStatus?.enabled && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                ตั้งค่า <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">LINE_CHANNEL_ACCESS_TOKEN</code> ใน .env
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Payment Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">ตั้งค่าการชำระเงิน</h3>
            <p className="text-sm text-[var(--muted)]">กำหนดค่าธรรมเนียมและค่าปรับ</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">ค่าธรรมเนียมรายเดือน (บาท)</label>
            <input
              type="number"
              className="input"
              value={settings.monthlyFee}
              onChange={(e) => setSettings({ ...settings, monthlyFee: parseInt(e.target.value) || 0 })}
              min={1}
            />
            <p className="text-xs text-[var(--muted)]">ค่าเริ่มต้น: 70 บาท</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">ค่าปรับล่าช้า (บาท/เดือน)</label>
            <input
              type="number"
              className="input"
              value={settings.penaltyFee}
              onChange={(e) => setSettings({ ...settings, penaltyFee: parseInt(e.target.value) || 0 })}
              min={10}
            />
            <p className="text-xs text-[var(--muted)]">ขั้นต่ำ: 10 บาท</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">เดือนเริ่มต้นปีการศึกษา</label>
            <select
              className="input"
              value={settings.startMonth}
              onChange={(e) => setSettings({ ...settings, startMonth: parseInt(e.target.value) })}
            >
              {appConfig.thaiMonths.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">ปีการศึกษา (พ.ศ. 2 หลัก)</label>
            <input
              type="number"
              className="input"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: parseInt(e.target.value) || 68 })}
              min={60}
              max={99}
            />
            <p className="text-xs text-[var(--muted)]">เช่น 68 สำหรับ พ.ศ. 2568</p>
          </div>
        </div>
      </motion.div>

      {/* Feature Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="font-bold text-lg mb-6">เปิด/ปิด ฟีเจอร์</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--accent)] cursor-pointer group">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">ตรวจสอบ Slip อัตโนมัติ</p>
                <p className="text-sm text-[var(--muted)]">ใช้ EasySlip API ตรวจสอบ Slip โดยอัตโนมัติ</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoVerifyEnabled}
              onChange={(e) => setSettings({ ...settings, autoVerifyEnabled: e.target.checked })}
              className="w-5 h-5 rounded border-[var(--border)] text-primary-600 focus:ring-primary-500"
            />
          </label>
          
          <label className="flex items-center justify-between p-4 rounded-xl bg-[var(--accent)] cursor-pointer group">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">แจ้งเตือน Line</p>
                <p className="text-sm text-[var(--muted)]">ส่งแจ้งเตือนเมื่อมีการชำระเงินใหม่</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
              className="w-5 h-5 rounded border-[var(--border)] text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Cron Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">งานอัตโนมัติ (Cron Jobs)</h3>
            <p className="text-sm text-[var(--muted)]">ทำงานผ่าน Vercel Cron</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--accent)]">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--muted)]" />
              <div>
                <p className="font-medium">แจ้งเตือนประจำเดือน</p>
                <p className="text-sm text-[var(--muted)]">ทุกวันที่ 1 เวลา 00:00</p>
              </div>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--accent)]">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--muted)]" />
              <div>
                <p className="font-medium">สรุปประจำวัน</p>
                <p className="text-sm text-[var(--muted)]">ทุกวัน เวลา 20:00</p>
              </div>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <button onClick={handleSaveSettings} className="btn btn-primary gap-2">
          <CheckCircle2 className="w-4 h-4" />
          บันทึกการตั้งค่า
        </button>
      </motion.div>
    </div>
  );
}
