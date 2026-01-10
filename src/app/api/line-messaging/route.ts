// =============================================================================
// API Route: LINE Messaging
// Using LINE Messaging API (2026 Standard)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  sendLineMessage,
  notifyNewPayment,
  notifyPaymentVerified,
  notifyPaymentRejected,
  notifyMonthlyReminder,
  notifyDailySummary,
  notifyQuotaWarning,
  getLineStatus,
  isLineMessagingEnabled,
} from "@/actions/line-messaging.actions";

// Action type definitions
type ActionType =
  | "new_payment"
  | "verified"
  | "rejected"
  | "monthly_reminder"
  | "daily_summary"
  | "quota_warning"
  | "custom";

interface RequestBody {
  action: ActionType;
  data: Record<string, unknown>;
}

/**
 * POST /api/line-messaging
 * Send notifications via LINE Messaging API
 */
export async function POST(request: NextRequest) {
  try {
    const enabled = await isLineMessagingEnabled();
    if (!enabled) {
      return NextResponse.json(
        { success: false, error: "LINE Messaging API not configured" },
        { status: 503 }
      );
    }

    const body: RequestBody = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "new_payment":
        result = await notifyNewPayment(
          data.studentId as string,
          data.studentName as string,
          data.amount as number,
          data.month as string
        );
        break;

      case "verified":
        result = await notifyPaymentVerified(
          data.studentId as string,
          data.studentName as string,
          data.amount as number,
          data.month as string
        );
        break;

      case "rejected":
        result = await notifyPaymentRejected(
          data.studentId as string,
          data.studentName as string,
          data.reason as string | undefined
        );
        break;

      case "monthly_reminder":
        result = await notifyMonthlyReminder(
          data.unpaidCount as number,
          data.totalAmount as number,
          data.month as string
        );
        break;

      case "daily_summary":
        result = await notifyDailySummary(
          data.verified as number,
          data.pending as number,
          data.rejected as number,
          data.totalAmount as number
        );
        break;

      case "quota_warning":
        result = await notifyQuotaWarning(data.remaining as number);
        break;

      case "custom":
        result = await sendLineMessage(data.message as string);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("LINE Messaging API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/line-messaging
 * Get LINE Messaging API status
 */
export async function GET() {
  const status = await getLineStatus();
  return NextResponse.json(status);
}
