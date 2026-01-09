// =============================================================================
// API Route: Daily Summary Cron Job
// Sends daily payment summary to admins
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyDailySummary, isLineMessagingEnabled } from "@/actions/line-messaging.actions";

// Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * POST /api/cron/daily
 * Daily cron job to send payment summary
 * 
 * Schedule: Every day at 20:00 (8 PM)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if Line Messaging is enabled
    const lineEnabled = await isLineMessagingEnabled();
    if (!lineEnabled) {
      return NextResponse.json({
        success: true,
        message: "Line Messaging not configured, skipping daily summary",
      });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select("id, amount, status")
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString());

    if (paymentsError) {
      console.error("[Cron] Failed to fetch payments:", paymentsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    // Calculate summary
    const verified = payments?.filter((p) => p.status === "verified") || [];
    const pending = payments?.filter((p) => p.status === "pending") || [];
    const rejected = payments?.filter((p) => p.status === "rejected") || [];
    
    const totalAmount = verified.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Send notification
    await notifyDailySummary(
      verified.length,
      pending.length,
      rejected.length,
      totalAmount
    );

    console.log(`[Cron] Daily summary sent: ${verified.length} verified, ${pending.length} pending`);

    return NextResponse.json({
      success: true,
      executedAt: today.toISOString(),
      summary: {
        verified: verified.length,
        pending: pending.length,
        rejected: rejected.length,
        totalAmount,
      },
    });
  } catch (error) {
    console.error("[Cron] Daily summary error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/daily
 * Get cron job info
 */
export async function GET() {
  return NextResponse.json({
    job: "daily-summary",
    schedule: "0 20 * * *", // Every day at 8 PM
    description: "Send daily payment summary via Line Notify",
    lastRun: null,
    nextRun: getNextRunTime(),
  });
}

function getNextRunTime(): string {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(20, 0, 0, 0);
  
  if (now >= nextRun) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  return nextRun.toISOString();
}
