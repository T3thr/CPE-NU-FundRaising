"use server";
// =============================================================================
// Payment Server Actions
// =============================================================================

import { createSupabaseServerClient } from "@utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Payment, CreatePaymentInput, VerifySlipInput, MonthlyReport } from "@/types/database";

/**
 * Get all payments for a cohort
 */
export async function getPayments(
  cohortId: string,
  options?: {
    status?: string;
    month?: number;
    year?: number;
    memberId?: string;
  }
) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from("payments")
    .select(`
      *,
      member:members(*)
    `)
    .eq("cohort_id", cohortId)
    .order("created_at", { ascending: false });
  
  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.month) {
    query = query.eq("payment_month", options.month);
  }
  if (options?.year) {
    query = query.eq("payment_year", options.year);
  }
  if (options?.memberId) {
    query = query.eq("member_id", options.memberId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data: data as Payment[] };
}

/**
 * Get pending payments (for verification)
 */
export async function getPendingPayments(cohortId: string) {
  return getPayments(cohortId, { status: "pending" });
}

/**
 * Get payment by ID
 */
export async function getPaymentById(id: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      member:members(*),
      cohort:cohorts(*)
    `)
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching payment:", error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data: data as Payment };
}

/**
 * Create a new payment (from user submission)
 */
export async function createPayment(input: CreatePaymentInput) {
  const supabase = await createSupabaseServerClient();
  
  // Check for duplicate payment
  const { data: existing } = await supabase
    .from("payments")
    .select("id, status")
    .eq("member_id", input.member_id)
    .eq("payment_month", input.payment_month)
    .eq("payment_year", input.payment_year)
    .not("status", "eq", "rejected")
    .single();
  
  if (existing) {
    if (existing.status === "verified") {
      return { success: false, error: "เดือนนี้ได้ชำระเงินแล้ว" };
    }
    if (existing.status === "pending") {
      return { success: false, error: "มีรายการรอตรวจสอบอยู่แล้ว" };
    }
  }
  
  const { data, error } = await supabase
    .from("payments")
    .insert({
      ...input,
      status: "pending",
      slip_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/payments");
  revalidatePath("/admin/verify");
  return { success: true, data: data as Payment };
}

/**
 * Create multiple payments (for paying multiple months)
 */
export async function createMultiplePayments(
  memberId: string,
  cohortId: string,
  months: { month: number; year: number }[],
  totalAmount: number,
  slipUrl?: string
) {
  const supabase = await createSupabaseServerClient();
  
  const amountPerMonth = Math.round(totalAmount / months.length);
  
  const payments = months.map((m, index) => ({
    member_id: memberId,
    cohort_id: cohortId,
    amount: index === months.length - 1 
      ? totalAmount - (amountPerMonth * (months.length - 1)) // Handle rounding
      : amountPerMonth,
    payment_month: m.month,
    payment_year: m.year,
    slip_url: slipUrl,
    status: "pending" as const,
    slip_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  
  const { data, error } = await supabase
    .from("payments")
    .insert(payments)
    .select();
  
  if (error) {
    console.error("Error creating multiple payments:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/payments");
  revalidatePath("/admin/verify");
  return { success: true, data: data as Payment[], count: data.length };
}

/**
 * Verify or reject a payment
 */
export async function verifyPayment(input: VerifySlipInput) {
  const supabase = await createSupabaseServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("payments")
    .update({
      status: input.verified ? "verified" : "rejected",
      slip_verified: input.verified,
      slip_verified_at: new Date().toISOString(),
      verified_by: user?.id,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.payment_id)
    .select()
    .single();
  
  if (error) {
    console.error("Error verifying payment:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/payments");
  revalidatePath("/admin/verify");
  revalidatePath("/admin");
  return { success: true, data: data as Payment };
}

/**
 * Bulk verify payments
 */
export async function bulkVerifyPayments(paymentIds: string[], verified: boolean) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("payments")
    .update({
      status: verified ? "verified" : "rejected",
      slip_verified: verified,
      slip_verified_at: new Date().toISOString(),
      verified_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .in("id", paymentIds)
    .select();
  
  if (error) {
    console.error("Error bulk verifying payments:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/payments");
  revalidatePath("/admin/verify");
  return { success: true, count: data.length };
}

/**
 * Delete a payment (admin only, usually for duplicates)
 */
export async function deletePayment(id: string) {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/payments");
  return { success: true };
}

/**
 * Get payment grid data (all members x all months)
 */
export async function getPaymentGrid(cohortId: string, year: number) {
  const supabase = await createSupabaseServerClient();
  
  // Get all members
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("cohort_id", cohortId)
    .eq("is_active", true)
    .order("student_id", { ascending: true });
  
  // Get all payments for the year
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("cohort_id", cohortId)
    .eq("payment_year", year);
  
  // Build grid data
  const grid = members?.map(member => {
    const memberPayments = payments?.filter(p => p.member_id === member.id) || [];
    
    const monthsData: Record<number, { status: string; amount: number; paymentId?: string }> = {};
    
    for (let month = 1; month <= 12; month++) {
      const payment = memberPayments.find(p => p.payment_month === month);
      if (payment) {
        monthsData[month] = {
          status: payment.status,
          amount: payment.amount,
          paymentId: payment.id,
        };
      } else {
        monthsData[month] = {
          status: "unpaid",
          amount: 0,
        };
      }
    }
    
    return {
      member,
      months: monthsData,
    };
  }) || [];
  
  return { success: true, data: grid };
}

/**
 * Get monthly report
 */
export async function getMonthlyReport(
  cohortId: string,
  year: number
): Promise<{ success: boolean; data?: MonthlyReport[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  
  // Get cohort info
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("monthly_fee, penalty_fee")
    .eq("id", cohortId)
    .single();
  
  // Get member count
  const { count: memberCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId)
    .eq("is_active", true);
  
  // Get all payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("cohort_id", cohortId)
    .eq("payment_year", year);
  
  const monthlyFee = cohort?.monthly_fee || 70;
  const reports: MonthlyReport[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthPayments = payments?.filter(
      p => p.payment_month === month && p.status === "verified"
    ) || [];
    
    const totalCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidMembers = new Set(monthPayments.map(p => p.member_id)).size;
    const expectedAmount = (memberCount || 0) * monthlyFee;
    
    // Calculate penalty collected (amounts over monthly fee)
    const penaltyCollected = monthPayments.reduce((sum, p) => 
      sum + Math.max(0, p.amount - monthlyFee), 0
    );
    
    reports.push({
      month,
      year,
      total_expected: expectedAmount,
      total_collected: totalCollected,
      paid_members: paidMembers,
      unpaid_members: (memberCount || 0) - paidMembers,
      penalty_collected: penaltyCollected,
    });
  }
  
  return { success: true, data: reports };
}
