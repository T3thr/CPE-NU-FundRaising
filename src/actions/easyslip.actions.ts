"use server";
// =============================================================================
// EasySlip Integration - Automatic Slip Verification
// =============================================================================

import type { EasySlipResponse, EasySlipData } from "@/types/database";

const EASYSLIP_API_URL = "https://developer.easyslip.com/api/v1";
const EASYSLIP_API_KEY = process.env.EASYSLIP_API_KEY;

/**
 * Check if EasySlip is configured
 */
export async function isEasySlipEnabled(): Promise<boolean> {
  return !!EASYSLIP_API_KEY;
}

/**
 * Verify slip using image (Base64)
 */
export async function verifySlipByImage(
  imageBase64: string
): Promise<EasySlipResponse> {
  if (!EASYSLIP_API_KEY) {
    return { success: false, error: "EasySlip API key not configured" };
  }
  
  try {
    const response = await fetch(`${EASYSLIP_API_URL}/verify`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${EASYSLIP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("EasySlip API error:", error);
      
      if (response.status === 429) {
        return { success: false, error: "เกินโควต้าการใช้งาน EasySlip สัปดาห์นี้" };
      }
      
      return { success: false, error: "ไม่สามารถตรวจสอบ Slip ได้" };
    }
    
    const data = await response.json();
    
    if (data.status === 200 && data.data) {
      return {
        success: true,
        data: {
          transRef: data.data.transRef,
          sendingBank: data.data.sendingBank?.name || "",
          receivingBank: data.data.receivingBank?.name || "",
          amount: parseFloat(data.data.amount?.amount || "0"),
          date: data.data.transTimestamp || "",
          sender: {
            name: data.data.sender?.name || "",
            account: data.data.sender?.account?.value || "",
          },
          receiver: {
            name: data.data.receiver?.name || "",
            account: data.data.receiver?.account?.value || "",
          },
        },
      };
    }
    
    return { success: false, error: data.message || "Slip verification failed" };
  } catch (error) {
    console.error("EasySlip verification error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการเชื่อมต่อ EasySlip" };
  }
}

/**
 * Verify slip using transaction reference
 */
export async function verifySlipByTransRef(
  transRef: string
): Promise<EasySlipResponse> {
  if (!EASYSLIP_API_KEY) {
    return { success: false, error: "EasySlip API key not configured" };
  }
  
  try {
    const response = await fetch(
      `${EASYSLIP_API_URL}/verify?transRef=${encodeURIComponent(transRef)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${EASYSLIP_API_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "ไม่พบข้อมูล Slip นี้" };
      }
      return { success: false, error: "ไม่สามารถตรวจสอบ Slip ได้" };
    }
    
    const data = await response.json();
    
    if (data.status === 200 && data.data) {
      return {
        success: true,
        data: {
          transRef: data.data.transRef,
          sendingBank: data.data.sendingBank?.name || "",
          receivingBank: data.data.receivingBank?.name || "",
          amount: parseFloat(data.data.amount?.amount || "0"),
          date: data.data.transTimestamp || "",
          sender: {
            name: data.data.sender?.name || "",
            account: data.data.sender?.account?.value || "",
          },
          receiver: {
            name: data.data.receiver?.name || "",
            account: data.data.receiver?.account?.value || "",
          },
        },
      };
    }
    
    return { success: false, error: "ไม่พบข้อมูล Slip" };
  } catch (error) {
    console.error("EasySlip lookup error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการเชื่อมต่อ EasySlip" };
  }
}

/**
 * Validate slip data against expected values
 */
export async function validateSlipData(
  slipData: EasySlipData,
  expectedAmount: number,
  expectedAccountNo: string
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Check amount (allow 1 baht tolerance for rounding)
  if (Math.abs(slipData.amount - expectedAmount) > 1) {
    errors.push(
      `จำนวนเงินไม่ตรง: โอน ${slipData.amount} บาท (คาดหวัง ${expectedAmount} บาท)`
    );
  }
  
  // Check receiver account (last 4 digits)
  const expectedLast4 = expectedAccountNo.replace(/-/g, "").slice(-4);
  const receivedLast4 = slipData.receiver.account.replace(/-/g, "").slice(-4);
  
  if (expectedLast4 !== receivedLast4) {
    errors.push(
      `บัญชีปลายทางไม่ตรง: ${slipData.receiver.account}`
    );
  }
  
  // Check transaction date (not too old - within 7 days)
  const transDate = new Date(slipData.date);
  const now = new Date();
  const daysDiff = (now.getTime() - transDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff > 7) {
    errors.push(`Slip เก่าเกินไป (${Math.round(daysDiff)} วันที่แล้ว)`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get remaining EasySlip quota
 * Note: This is an estimate based on weekly limit
 */
export async function getEasySlipQuota() {
  // EasySlip free tier: 50 slips per week
  // This would need to be tracked in a database for accuracy
  return {
    weeklyLimit: 50,
    used: 0, // Would need to track this
    remaining: 50,
  };
}
