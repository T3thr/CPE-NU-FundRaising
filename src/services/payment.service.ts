// =============================================================================
// Payment Service - Full Payment Processing with Auto-Verification
// =============================================================================

"use server";

import { createClient } from "@supabase/supabase-js";
import { verifySlipByImage, validateSlipData } from "@/actions/easyslip.actions";
import { notifyNewPayment, notifyPaymentVerified } from "@/actions/line-messaging.actions";
import { uploadSlipFromBase64 } from "@/utils/supabase/storage";
import { appConfig } from "@/config/app.config";
import { calculatePaymentAmount, getAcademicYearMonths, isFutureMonth } from "@/utils/calculations/payment.utils";
import type { Payment, Member, ApiResponse } from "@/types/database";

// Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

interface SubmitPaymentInput {
  studentId: string;
  cohortId: string;
  months: number[];
  academicYear: number;
  slipBase64: string;
  slipMimeType?: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  autoVerified: boolean;
  slipUrl?: string;
  verificationData?: {
    transRef: string;
    amount: number;
    sender: string;
  };
  errors?: string[];
}

/**
 * Submit a new payment with automatic slip verification
 */
export async function submitPaymentWithVerification(
  input: SubmitPaymentInput
): Promise<ApiResponse<PaymentResult>> {
  try {
    // Step 1: Find member by student ID
    const { data: member, error: memberError } = await supabaseAdmin
      .from("members")
      .select("id, full_name, nickname, cohort_id")
      .eq("student_id", input.studentId)
      .eq("cohort_id", input.cohortId)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: "ไม่พบข้อมูลสมาชิก กรุณาตรวจสอบรหัสนิสิต",
      };
    }

    // Step 2: Get cohort settings
    const { data: cohort, error: cohortError } = await supabaseAdmin
      .from("cohorts")
      .select("monthly_fee, penalty_fee, organization_id")
      .eq("id", input.cohortId)
      .single();

    if (cohortError || !cohort) {
      return { success: false, error: "ไม่พบข้อมูลรุ่น" };
    }

    // Step 3: Get organization bank details
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("bank_account_no, bank_account_name")
      .eq("id", cohort.organization_id)
      .single();

    // Step 4: Calculate expected amount
    const monthlyFee = cohort.monthly_fee || appConfig.payment.defaultMonthlyFee;
    const penaltyFee = cohort.penalty_fee || appConfig.payment.defaultPenaltyFee;
    
    // Check for lump sum payment (9 months = waive penalties per business rules)
    const isLumpSum = input.months.length >= 9;
    const expectedAmount = isLumpSum
      ? input.months.length * monthlyFee // No penalty for lump sum
      : input.months.length * monthlyFee; // Simplified - full calculation would check overdue

    // Step 5: Upload slip to storage
    const uploadResult = await uploadSlipFromBase64(
      input.slipBase64,
      input.cohortId,
      member.id,
      input.slipMimeType || "image/jpeg"
    );

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || "ไม่สามารถอัปโหลด Slip ได้",
      };
    }

    // Step 6: Try auto-verification with EasySlip
    let autoVerified = false;
    let verificationData = null;
    const verificationErrors: string[] = [];

    const verifyResult = await verifySlipByImage(input.slipBase64);
    
    if (verifyResult.success && verifyResult.data) {
      // Validate slip data
      const bankAccount = org?.bank_account_no || appConfig.bank.accountNo;
      const validation = await validateSlipData(
        verifyResult.data,
        expectedAmount,
        bankAccount
      );

      if (validation.valid) {
        autoVerified = true;
        verificationData = {
          transRef: verifyResult.data.transRef,
          amount: verifyResult.data.amount,
          sender: verifyResult.data.sender.name,
        };
      } else {
        verificationErrors.push(...validation.errors);
      }
    }

    // Step 7: Create payment records for each month
    const now = new Date().toISOString();
    const paymentsToInsert = input.months.map((month) => ({
      member_id: member.id,
      cohort_id: input.cohortId,
      amount: monthlyFee,
      payment_month: month,
      payment_year: input.academicYear,
      slip_url: uploadResult.url,
      slip_trans_ref: verificationData?.transRef || null,
      slip_verified: autoVerified,
      slip_verified_at: autoVerified ? now : null,
      status: autoVerified ? "verified" : "pending",
      created_at: now,
      updated_at: now,
    }));

    const { data: payments, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert(paymentsToInsert)
      .select("id")
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      return { success: false, error: "ไม่สามารถบันทึกการชำระได้" };
    }

    // Step 8: Send notifications
    const monthNames = input.months
      .map((m) => appConfig.thaiMonthsShort[m - 1])
      .join(", ");
    
    if (autoVerified) {
      await notifyPaymentVerified(
        input.studentId,
        member.full_name,
        expectedAmount,
        monthNames
      );
    } else {
      await notifyNewPayment(
        input.studentId,
        member.full_name,
        expectedAmount,
        monthNames
      );
    }

    return {
      success: true,
      data: {
        success: true,
        paymentId: payments?.id,
        autoVerified,
        slipUrl: uploadResult.url,
        verificationData: verificationData || undefined,
        errors: verificationErrors.length > 0 ? verificationErrors : undefined,
      },
    };
  } catch (error) {
    console.error("Submit payment error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกการชำระเงิน" };
  }
}

/**
 * Manually verify a pending payment
 */
export async function verifyPayment(
  paymentId: string,
  verifiedBy: string,
  notes?: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: "verified",
        slip_verified: true,
        slip_verified_at: now,
        verified_by: verifiedBy,
        notes,
        updated_at: now,
      })
      .eq("id", paymentId);

    if (error) {
      return { success: false, error: "ไม่สามารถยืนยันการชำระได้" };
    }

    // Get payment details for notification
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select(`
        amount,
        payment_month,
        member:members(student_id, full_name)
      `)
      .eq("id", paymentId)
      .single();

    if (payment && payment.member) {
      const member = payment.member as unknown as { student_id: string; full_name: string };
      const monthName = appConfig.thaiMonthsShort[payment.payment_month - 1];
      await notifyPaymentVerified(
        member.student_id,
        member.full_name,
        payment.amount,
        monthName
      );
    }

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Verify payment error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด" };
  }
}

/**
 * Reject a payment
 */
export async function rejectPayment(
  paymentId: string,
  rejectedBy: string,
  reason?: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: "rejected",
        verified_by: rejectedBy,
        notes: reason || "Slip ไม่ถูกต้อง",
        updated_at: now,
      })
      .eq("id", paymentId);

    if (error) {
      return { success: false, error: "ไม่สามารถปฏิเสธการชำระได้" };
    }

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Reject payment error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด" };
  }
}

/**
 * Bulk verify payments
 */
export async function bulkVerifyPayments(
  paymentIds: string[],
  verifiedBy: string
): Promise<ApiResponse<{ verified: number; failed: number }>> {
  try {
    const now = new Date().toISOString();
    let verified = 0;
    let failed = 0;

    for (const id of paymentIds) {
      const { error } = await supabaseAdmin
        .from("payments")
        .update({
          status: "verified",
          slip_verified: true,
          slip_verified_at: now,
          verified_by: verifiedBy,
          updated_at: now,
        })
        .eq("id", id)
        .eq("status", "pending");

      if (error) {
        failed++;
      } else {
        verified++;
      }
    }

    return {
      success: true,
      data: { verified, failed },
    };
  } catch (error) {
    console.error("Bulk verify error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด" };
  }
}

/**
 * Get payment status for a member
 */
export async function getMemberPaymentStatus(
  studentId: string,
  cohortId: string,
  academicYear: number
): Promise<ApiResponse<{
  member: Partial<Member>;
  payments: {
    month: number;
    status: "verified" | "pending" | "unpaid" | "future";
    amount?: number;
    paidAt?: string;
  }[];
  summary: {
    totalPaid: number;
    totalPending: number;
    totalOwed: number;
    penalty: number;
  };
}>> {
  try {
    // Get member
    const { data: member, error: memberError } = await supabaseAdmin
      .from("members")
      .select("id, student_id, full_name, nickname")
      .eq("student_id", studentId)
      .eq("cohort_id", cohortId)
      .single();

    if (memberError || !member) {
      return { success: false, error: "ไม่พบข้อมูลสมาชิก" };
    }

    // Get cohort settings
    const { data: cohort } = await supabaseAdmin
      .from("cohorts")
      .select("monthly_fee, penalty_fee, start_month, end_month")
      .eq("id", cohortId)
      .single();

    const monthlyFee = cohort?.monthly_fee || appConfig.payment.defaultMonthlyFee;
    const penaltyFee = cohort?.penalty_fee || appConfig.payment.defaultPenaltyFee;

    // Get all payments for this member
    const { data: payments } = await supabaseAdmin
      .from("payments")
      .select("payment_month, status, amount, created_at")
      .eq("member_id", member.id)
      .eq("payment_year", academicYear);

    // Build payment status by month
    const monthsStatus = getAcademicYearMonths().map((month) => {
      const payment = payments?.find((p) => p.payment_month === month);
      
      if (payment) {
        return {
          month,
          status: payment.status as "verified" | "pending" | "unpaid" | "future",
          amount: payment.amount,
          paidAt: payment.created_at,
        };
      }

      if (isFutureMonth(month, academicYear)) {
        return { month, status: "future" as const };
      }

      return { month, status: "unpaid" as const };
    });

    // Calculate summary
    const verifiedPayments = monthsStatus.filter((m) => m.status === "verified");
    const pendingPayments = monthsStatus.filter((m) => m.status === "pending");
    const unpaidMonths = monthsStatus.filter((m) => m.status === "unpaid");

    const totalPaid = verifiedPayments.length * monthlyFee;
    const totalPending = pendingPayments.length * monthlyFee;
    const totalOwed = unpaidMonths.length * monthlyFee;
    const penalty = Math.max(0, (unpaidMonths.length - 1) * penaltyFee);

    return {
      success: true,
      data: {
        member: {
          id: member.id,
          student_id: member.student_id,
          full_name: member.full_name,
          nickname: member.nickname,
        },
        payments: monthsStatus,
        summary: {
          totalPaid,
          totalPending,
          totalOwed,
          penalty,
        },
      },
    };
  } catch (error) {
    console.error("Get payment status error:", error);
    return { success: false, error: "เกิดข้อผิดพลาด" };
  }
}
