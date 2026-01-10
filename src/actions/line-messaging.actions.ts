"use server";
// =============================================================================
// LINE Messaging API Integration - 2026 Standard
// Replaces deprecated LINE Notify (EOL March 2025)
// Docs: https://developers.line.biz/en/docs/messaging-api/
// =============================================================================

const LINE_API_URL = "https://api.line.me/v2/bot";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_GROUP_ID = process.env.LINE_GROUP_ID;
const LINE_USER_ID = process.env.LINE_USER_ID;

// Message types
export type LineMessageType = "text" | "flex" | "sticker" | "image";

interface TextMessage {
  type: "text";
  text: string;
}

interface StickerMessage {
  type: "sticker";
  packageId: string;
  stickerId: string;
}

interface FlexMessage {
  type: "flex";
  altText: string;
  contents: Record<string, unknown>;
}

type LineMessage = TextMessage | StickerMessage | FlexMessage;

interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Check if LINE Messaging API is configured
 */
export async function isLineMessagingEnabled(): Promise<boolean> {
  return !!(LINE_CHANNEL_ACCESS_TOKEN && (LINE_GROUP_ID || LINE_USER_ID));
}

/**
 * Send message using LINE Messaging API
 */
async function sendMessage(
  to: string,
  messages: LineMessage[]
): Promise<SendResult> {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    console.warn("LINE Messaging API is not configured");
    return { success: false, error: "LINE Messaging API not configured" };
  }

  try {
    const response = await fetch(`${LINE_API_URL}/message/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("LINE API error:", error);
      return { success: false, error: "Failed to send message" };
    }

    return { success: true };
  } catch (error) {
    console.error("LINE Messaging error:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Send text message to admin group/user
 */
export async function sendLineMessage(text: string): Promise<SendResult> {
  const target = LINE_GROUP_ID || LINE_USER_ID;
  if (!target) {
    return { success: false, error: "No target ID configured" };
  }

  return sendMessage(target, [{ type: "text", text }]);
}

/**
 * Create beautiful Flex Message for payment notifications
 */
function createPaymentFlexMessage(
  type: "new" | "verified" | "rejected",
  data: {
    studentId: string;
    studentName: string;
    amount: number;
    month: string;
    reason?: string;
  }
): FlexMessage {
  const headerColors = {
    new: "#3B82F6",      // Blue
    verified: "#22C55E", // Green
    rejected: "#EF4444", // Red
  };

  const icons = {
    new: "💰",
    verified: "✅",
    rejected: "❌",
  };

  const titles = {
    new: "แจ้งชำระเงินใหม่",
    verified: "ยืนยันการชำระแล้ว",
    rejected: "ปฏิเสธการชำระ",
  };

  return {
    type: "flex",
    altText: `${icons[type]} ${titles[type]} - ${data.studentName}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: headerColors[type],
        paddingAll: "15px",
        contents: [
          {
            type: "text",
            text: `${icons[type]} ${titles[type]}`,
            color: "#FFFFFF",
            weight: "bold",
            size: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "15px",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "👤", size: "sm", flex: 0 },
              {
                type: "text",
                text: `${data.studentName} (${data.studentId})`,
                size: "sm",
                color: "#334155",
                wrap: true,
                flex: 1,
                margin: "sm",
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "💵", size: "sm", flex: 0 },
              {
                type: "text",
                text: `${data.amount.toLocaleString()} บาท`,
                size: "sm",
                color: "#334155",
                flex: 1,
                margin: "sm",
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "📅", size: "sm", flex: 0 },
              {
                type: "text",
                text: data.month,
                size: "sm",
                color: "#334155",
                flex: 1,
                margin: "sm",
              },
            ],
          },
          ...(data.reason
            ? [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    { type: "text", text: "📝", size: "sm", flex: 0 },
                    {
                      type: "text",
                      text: data.reason,
                      size: "sm",
                      color: "#EF4444",
                      flex: 1,
                      margin: "sm",
                      wrap: true,
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "10px",
        contents: [
          {
            type: "text",
            text: new Date().toLocaleString("th-TH"),
            size: "xs",
            color: "#94A3B8",
            align: "center",
          },
        ],
      },
    },
  };
}

/**
 * Notify new payment submission
 */
export async function notifyNewPayment(
  studentId: string,
  studentName: string,
  amount: number,
  month: string
): Promise<SendResult> {
  const target = LINE_GROUP_ID || LINE_USER_ID;
  if (!target) {
    return { success: false, error: "No target ID configured" };
  }

  const flexMessage = createPaymentFlexMessage("new", {
    studentId,
    studentName,
    amount,
    month,
  });

  return sendMessage(target, [flexMessage]);
}

/**
 * Notify payment verified
 */
export async function notifyPaymentVerified(
  studentId: string,
  studentName: string,
  amount: number,
  month: string
): Promise<SendResult> {
  const target = LINE_GROUP_ID || LINE_USER_ID;
  if (!target) {
    return { success: false, error: "No target ID configured" };
  }

  const flexMessage = createPaymentFlexMessage("verified", {
    studentId,
    studentName,
    amount,
    month,
  });

  return sendMessage(target, [flexMessage]);
}

/**
 * Notify payment rejected
 */
export async function notifyPaymentRejected(
  studentId: string,
  studentName: string,
  reason?: string
): Promise<SendResult> {
  const target = LINE_GROUP_ID || LINE_USER_ID;
  if (!target) {
    return { success: false, error: "No target ID configured" };
  }

  const flexMessage = createPaymentFlexMessage("rejected", {
    studentId,
    studentName,
    amount: 0,
    month: "",
    reason: reason || "กรุณาติดต่อเหรัญญิก",
  });

  return sendMessage(target, [flexMessage]);
}

/**
 * Send monthly reminder summary
 */
export async function notifyMonthlyReminder(
  unpaidCount: number,
  totalAmount: number,
  month: string
): Promise<SendResult> {
  const message = `🔔 แจ้งเตือนประจำเดือน

📅 เดือน: ${month}
👥 ยังไม่ชำระ: ${unpaidCount} คน
💵 ยอดรวมค้างชำระ: ${totalAmount.toLocaleString()} บาท

กรุณาแจ้งเตือนสมาชิกด้วยนะครับ 🙏`;

  return sendLineMessage(message);
}

/**
 * Send daily summary
 */
export async function notifyDailySummary(
  verified: number,
  pending: number,
  rejected: number,
  totalAmount: number
): Promise<SendResult> {
  const message = `📊 สรุปประจำวัน (${new Date().toLocaleDateString("th-TH")})

✅ ยืนยันแล้ว: ${verified} รายการ
⏳ รอตรวจสอบ: ${pending} รายการ
❌ ปฏิเสธ: ${rejected} รายการ
💰 ยอดรวมวันนี้: ${totalAmount.toLocaleString()} บาท`;

  return sendLineMessage(message);
}

/**
 * Send quota warning
 */
export async function notifyQuotaWarning(remaining: number): Promise<SendResult> {
  const message = `⚠️ เตือน: โควต้า EasySlip ใกล้หมด!

📊 เหลือ: ${remaining} ครั้ง/สัปดาห์

ถ้าโควต้าหมด จะต้องตรวจสอบ Slip แบบ Manual`;

  return sendLineMessage(message);
}

/**
 * Get LINE Messaging API status
 */
export async function getLineStatus(): Promise<{
  enabled: boolean;
  targetType: "group" | "user" | null;
  error?: string;
}> {
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    return { enabled: false, targetType: null, error: "No access token" };
  }

  const targetType = LINE_GROUP_ID ? "group" : LINE_USER_ID ? "user" : null;

  if (!targetType) {
    return { enabled: false, targetType: null, error: "No target ID" };
  }

  return { enabled: true, targetType };
}
