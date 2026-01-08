"use server";
// =============================================================================
// Line Notify Integration - Admin Notifications
// =============================================================================

const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";
const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN;

export type NotificationType = 
  | "new_payment"
  | "payment_verified"
  | "payment_rejected"
  | "monthly_reminder"
  | "quota_warning";

interface NotifyOptions {
  message: string;
  imageUrl?: string;
  stickerPackageId?: number;
  stickerId?: number;
}

/**
 * Check if Line Notify is configured
 */
export async function isLineNotifyEnabled(): Promise<boolean> {
  return !!LINE_NOTIFY_TOKEN;
}

/**
 * Send notification via Line Notify
 */
export async function sendLineNotify(
  options: NotifyOptions
): Promise<{ success: boolean; error?: string }> {
  if (!LINE_NOTIFY_TOKEN) {
    console.warn("Line Notify is not configured");
    return { success: false, error: "Line Notify not configured" };
  }
  
  try {
    const formData = new URLSearchParams();
    formData.append("message", options.message);
    
    if (options.imageUrl) {
      formData.append("imageThumbnail", options.imageUrl);
      formData.append("imageFullsize", options.imageUrl);
    }
    
    if (options.stickerPackageId && options.stickerId) {
      formData.append("stickerPackageId", options.stickerPackageId.toString());
      formData.append("stickerId", options.stickerId.toString());
    }
    
    const response = await fetch(LINE_NOTIFY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LINE_NOTIFY_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("Line Notify error:", error);
      return { success: false, error: "Failed to send notification" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Line Notify error:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

/**
 * Send new payment notification
 */
export async function notifyNewPayment(
  studentId: string,
  studentName: string,
  amount: number,
  month: string
) {
  const message = `
💰 แจ้งชำระเงินใหม่!

👤 ${studentName} (${studentId})
💵 จำนวน: ${amount.toLocaleString()} บาท
📅 เดือน: ${month}
⏰ เวลา: ${new Date().toLocaleString("th-TH")}

กรุณาตรวจสอบ Slip ในระบบ`;

  return sendLineNotify({ message });
}

/**
 * Send payment verified notification
 */
export async function notifyPaymentVerified(
  studentId: string,
  studentName: string,
  amount: number,
  month: string
) {
  const message = `
✅ ยืนยันการชำระเงินเรียบร้อย

👤 ${studentName} (${studentId})
💵 จำนวน: ${amount.toLocaleString()} บาท
📅 เดือน: ${month}`;

  return sendLineNotify({
    message,
    stickerPackageId: 11537,
    stickerId: 52002734,
  });
}

/**
 * Send payment rejected notification
 */
export async function notifyPaymentRejected(
  studentId: string,
  studentName: string,
  reason?: string
) {
  const message = `
❌ ปฏิเสธการชำระเงิน

👤 ${studentName} (${studentId})
📝 เหตุผล: ${reason || "กรุณาติดต่อเหรัญญิก"}

กรุณาส่ง Slip ใหม่อีกครั้ง`;

  return sendLineNotify({ message });
}

/**
 * Send monthly reminder to unpaid members
 */
export async function notifyMonthlyReminder(
  unpaidCount: number,
  totalAmount: number,
  month: string
) {
  const message = `
🔔 แจ้งเตือนค่าธรรมเนียมประจำเดือน

📅 เดือน: ${month}
👥 ยังไม่ชำระ: ${unpaidCount} คน
💵 ยอดรวมค้างชำระ: ${totalAmount.toLocaleString()} บาท

กรุณาแจ้งเตือนสมาชิกด้วยนะครับ`;

  return sendLineNotify({
    message,
    stickerPackageId: 11537,
    stickerId: 52002739,
  });
}

/**
 * Send EasySlip quota warning
 */
export async function notifyQuotaWarning(remaining: number) {
  const message = `
⚠️ เตือน: โควต้า EasySlip ใกล้หมด!

📊 เหลือ: ${remaining} ครั้ง/สัปดาห์

ถ้าโควต้าหมด จะต้องตรวจสอบ Slip แบบ Manual`;

  return sendLineNotify({ message });
}

/**
 * Send daily summary
 */
export async function notifyDailySummary(
  verified: number,
  pending: number,
  rejected: number,
  totalAmount: number
) {
  const message = `
📊 สรุปประจำวัน

✅ ยืนยันแล้ว: ${verified} รายการ
⏳ รอตรวจสอบ: ${pending} รายการ
❌ ปฏิเสธ: ${rejected} รายการ
💰 ยอดรวมวันนี้: ${totalAmount.toLocaleString()} บาท`;

  return sendLineNotify({ message });
}

/**
 * Get Line Notify status/limits
 */
export async function getLineNotifyStatus() {
  if (!LINE_NOTIFY_TOKEN) {
    return { enabled: false, remaining: 0 };
  }
  
  try {
    const response = await fetch("https://notify-api.line.me/api/status", {
      headers: {
        "Authorization": `Bearer ${LINE_NOTIFY_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      return { enabled: false, remaining: 0 };
    }
    
    const data = await response.json();
    return {
      enabled: true,
      remaining: data.messageApiLimitRemaining || 1000,
      target: data.target || "Unknown",
    };
  } catch {
    return { enabled: false, remaining: 0 };
  }
}
