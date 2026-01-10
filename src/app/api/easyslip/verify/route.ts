// =============================================================================
// API Route: EasySlip Verification
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifySlipByImage, validateSlipData, isEasySlipEnabled } from "@/actions/easyslip.actions";
import { notifyNewPayment } from "@/actions/line-messaging.actions";

/**
 * POST /api/easyslip/verify
 * Verify a payment slip image using EasySlip API
 */
export async function POST(request: NextRequest) {
  try {
    // Check if EasySlip is enabled
    const enabled = await isEasySlipEnabled();
    if (!enabled) {
      return NextResponse.json(
        { success: false, error: "EasySlip API is not configured" },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { imageBase64, expectedAmount, expectedAccountNo, studentId, studentName, month } = body;

    // Validate required fields
    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "Missing imageBase64" },
        { status: 400 }
      );
    }

    // Step 1: Verify slip with EasySlip API
    const verificationResult = await verifySlipByImage(imageBase64);
    
    if (!verificationResult.success || !verificationResult.data) {
      return NextResponse.json({
        success: false,
        autoVerified: false,
        error: verificationResult.error || "Slip verification failed",
        requiresManualReview: true,
      });
    }

    // Step 2: Validate slip data against expected values
    let validation = { valid: true, errors: [] as string[] };
    
    if (expectedAmount && expectedAccountNo) {
      validation = await validateSlipData(
        verificationResult.data,
        expectedAmount,
        expectedAccountNo
      );
    }

    // Step 3: Send Line Notify if new payment (optional)
    if (studentId && studentName && month && validation.valid) {
      await notifyNewPayment(
        studentId,
        studentName,
        verificationResult.data.amount,
        month
      );
    }

    return NextResponse.json({
      success: true,
      autoVerified: validation.valid,
      data: verificationResult.data,
      validation: {
        valid: validation.valid,
        errors: validation.errors,
      },
      requiresManualReview: !validation.valid,
    });
  } catch (error) {
    console.error("EasySlip API route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/easyslip/verify
 * Check if EasySlip is enabled and get quota info
 */
export async function GET() {
  try {
    const enabled = await isEasySlipEnabled();
    
    return NextResponse.json({
      enabled,
      quotaPerWeek: 50,
      // In production, you would track actual usage in database
      usage: {
        used: 0,
        remaining: 50,
        resetDate: getNextWeekStart(),
      },
    });
  } catch (error) {
    console.error("EasySlip status error:", error);
    return NextResponse.json(
      { enabled: false, error: "Failed to get status" },
      { status: 500 }
    );
  }
}

/**
 * Get the next week's start date (Monday)
 */
function getNextWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.toISOString();
}
