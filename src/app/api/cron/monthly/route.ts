// =============================================================================
// API Route: Monthly Cron Job
// Calculates unpaid balances and sends reminders
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyMonthlyReminder, isLineMessagingEnabled } from "@/actions/line-messaging.actions";
import { appConfig } from "@/config/app.config";

// Supabase admin client (uses service role key for cron jobs)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * POST /api/cron/monthly
 * Monthly cron job to calculate unpaid balances and send reminders
 * 
 * This endpoint should be called by a cron service (Vercel Cron, Supabase Edge Functions, etc.)
 * on the 1st of each month.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentThaiYear = (now.getFullYear() + 543) % 100; // 68, 69, etc.

    console.log(`[Cron] Running monthly job for month ${currentMonth}, year ${currentThaiYear}`);

    // Step 1: Get all active cohorts
    const { data: cohorts, error: cohortsError } = await supabaseAdmin
      .from("cohorts")
      .select("*")
      .eq("is_active", true);

    if (cohortsError) {
      console.error("[Cron] Failed to fetch cohorts:", cohortsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch cohorts" },
        { status: 500 }
      );
    }

    const results = [];

    for (const cohort of cohorts || []) {
      // Step 2: Get all active members in this cohort
      const { data: members, error: membersError } = await supabaseAdmin
        .from("members")
        .select("id, student_id, full_name")
        .eq("cohort_id", cohort.id)
        .eq("is_active", true);

      if (membersError) {
        console.error(`[Cron] Failed to fetch members for cohort ${cohort.id}:`, membersError);
        continue;
      }

      const memberIds = members?.map((m) => m.id) || [];
      
      // Step 3: Get paid months for all members in this cohort
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from("payments")
        .select("member_id, payment_month")
        .eq("cohort_id", cohort.id)
        .eq("payment_year", cohort.academic_year)
        .eq("status", "verified")
        .in("member_id", memberIds);

      if (paymentsError) {
        console.error(`[Cron] Failed to fetch payments for cohort ${cohort.id}:`, paymentsError);
        continue;
      }

      // Step 4: Calculate unpaid members for current month
      const paidMemberIds = new Set(
        payments?.filter((p) => p.payment_month === currentMonth).map((p) => p.member_id) || []
      );

      const unpaidMembers = members?.filter((m) => !paidMemberIds.has(m.id)) || [];
      const monthlyFee = cohort.monthly_fee || appConfig.payment.defaultMonthlyFee;
      const totalUnpaidAmount = unpaidMembers.length * monthlyFee;

      results.push({
        cohortId: cohort.id,
        cohortName: cohort.name,
        totalMembers: members?.length || 0,
        unpaidCount: unpaidMembers.length,
        paidCount: paidMemberIds.size,
        totalUnpaidAmount,
      });

      console.log(
        `[Cron] Cohort ${cohort.name}: ${unpaidMembers.length}/${members?.length || 0} unpaid`
      );

      // Step 5: Send Line Notify reminder if there are unpaid members
      if (unpaidMembers.length > 0) {
        const lineEnabled = await isLineMessagingEnabled();
        if (lineEnabled) {
          const monthName = appConfig.thaiMonths[currentMonth - 1];
          await notifyMonthlyReminder(
            unpaidMembers.length,
            totalUnpaidAmount,
            monthName
          );
          console.log(`[Cron] Sent reminder for cohort ${cohort.name}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      executedAt: now.toISOString(),
      results,
      summary: {
        totalCohorts: cohorts?.length || 0,
        totalUnpaid: results.reduce((sum, r) => sum + r.unpaidCount, 0),
        totalAmount: results.reduce((sum, r) => sum + r.totalUnpaidAmount, 0),
      },
    });
  } catch (error) {
    console.error("[Cron] Monthly job error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/monthly
 * Get cron job status and last run info
 */
export async function GET() {
  // In production, you would store last run info in database
  return NextResponse.json({
    job: "monthly-reminder",
    schedule: "0 0 1 * *", // 1st of every month at midnight
    description: "Calculate unpaid balances and send Line Notify reminders",
    lastRun: null, // Would be fetched from database
    nextRun: getNextMonthFirstDay(),
  });
}

/**
 * Get the first day of next month
 */
function getNextMonthFirstDay(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}
