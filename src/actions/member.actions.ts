"use server";
// =============================================================================
// Member Server Actions
// =============================================================================

import { createSupabaseServerClient } from "@utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Member, CreateMemberInput, MemberPaymentStatus } from "@/types/database";
import { appConfig } from "@/config/app.config";

/**
 * Get all members of a cohort
 */
export async function getMembers(cohortId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("members")
    .select(`
      *,
      cohort:cohorts(*)
    `)
    .eq("cohort_id", cohortId)
    .order("student_id", { ascending: true });
  
  if (error) {
    console.error("Error fetching members:", error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data: data as Member[] };
}

/**
 * Get active members only
 */
export async function getActiveMembers(cohortId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("cohort_id", cohortId)
    .eq("is_active", true)
    .order("student_id", { ascending: true });
  
  if (error) {
    console.error("Error fetching active members:", error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data: data as Member[] };
}

/**
 * Get member by ID
 */
export async function getMemberById(id: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("members")
    .select(`
      *,
      cohort:cohorts(
        *,
        organization:organizations(*)
      )
    `)
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching member:", error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data: data as Member };
}

/**
 * Get member by student ID
 */
export async function getMemberByStudentId(studentId: string, cohortId?: string) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from("members")
    .select(`
      *,
      cohort:cohorts(
        *,
        organization:organizations(*)
      )
    `)
    .eq("student_id", studentId);
  
  if (cohortId) {
    query = query.eq("cohort_id", cohortId);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error("Error fetching member by student ID:", error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data: data as Member };
}

/**
 * Create a new member
 */
export async function createMember(input: CreateMemberInput) {
  const supabase = await createSupabaseServerClient();
  
  // Check for duplicate student ID in the same cohort
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("cohort_id", input.cohort_id)
    .eq("student_id", input.student_id)
    .single();
  
  if (existing) {
    return { success: false, error: "รหัสนิสิตนี้มีอยู่ในระบบแล้ว" };
  }
  
  const { data, error } = await supabase
    .from("members")
    .insert({
      ...input,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating member:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/members");
  return { success: true, data: data as Member };
}

/**
 * Bulk create members (for import)
 */
export async function bulkCreateMembers(
  cohortId: string,
  members: Omit<CreateMemberInput, "cohort_id">[]
) {
  const supabase = await createSupabaseServerClient();
  
  const membersWithCohort = members.map(m => ({
    ...m,
    cohort_id: cohortId,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  
  const { data, error } = await supabase
    .from("members")
    .insert(membersWithCohort)
    .select();
  
  if (error) {
    console.error("Error bulk creating members:", error);
    return { success: false, error: error.message, count: 0 };
  }
  
  revalidatePath("/admin/members");
  return { success: true, data: data as Member[], count: data.length };
}

/**
 * Update a member
 */
export async function updateMember(
  id: string,
  input: Partial<Omit<Member, "id" | "created_at" | "cohort">>
) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("members")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating member:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/members");
  return { success: true, data: data as Member };
}

/**
 * Toggle member active status
 */
export async function toggleMemberStatus(id: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data: current } = await supabase
    .from("members")
    .select("is_active")
    .eq("id", id)
    .single();
  
  if (!current) {
    return { success: false, error: "Member not found" };
  }
  
  const { error } = await supabase
    .from("members")
    .update({
      is_active: !current.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  
  if (error) {
    console.error("Error toggling member status:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/members");
  return { success: true };
}

/**
 * Delete a member
 */
export async function deleteMember(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // Check for existing payments
  const { count } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("member_id", id);
  
  if (count && count > 0) {
    return {
      success: false,
      error: `ไม่สามารถลบได้ เนื่องจากมีประวัติการชำระเงิน ${count} รายการ`,
    };
  }
  
  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting member:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/members");
  return { success: true };
}

/**
 * Get member payment status with all months
 */
export async function getMemberPaymentStatus(
  memberId: string,
  year: number
): Promise<{ success: boolean; data?: MemberPaymentStatus; error?: string }> {
  const supabase = await createSupabaseServerClient();
  
  // Get member info
  const { data: member } = await supabase
    .from("members")
    .select(`
      *,
      cohort:cohorts(*)
    `)
    .eq("id", memberId)
    .single();
  
  if (!member) {
    return { success: false, error: "Member not found" };
  }
  
  // Get all payments for this year
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("member_id", memberId)
    .eq("payment_year", year)
    .eq("status", "verified");
  
  const monthsPaid = payments?.map(p => p.payment_month) || [];
  
  // Calculate months that should be paid (from start month to current month)
  const currentMonth = new Date().getMonth() + 1;
  const startMonth = member.cohort?.start_month || appConfig.academic.startMonth;
  
  const allMonths: number[] = [];
  for (let m = startMonth; m <= 12; m++) allMonths.push(m);
  for (let m = 1; m < startMonth; m++) allMonths.push(m);
  
  // Filter to months up to current
  const dueMonths = allMonths.filter(m => m <= currentMonth);
  const monthsUnpaid = dueMonths.filter(m => !monthsPaid.includes(m));
  
  const monthlyFee = member.cohort?.monthly_fee || appConfig.payment.defaultMonthlyFee;
  const penaltyFee = member.cohort?.penalty_fee || appConfig.payment.defaultPenaltyFee;
  
  // Calculate totals
  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalDue = monthsUnpaid.length * monthlyFee;
  const penaltyAmount = monthsUnpaid.length > 0 
    ? (monthsUnpaid.length * penaltyFee) - penaltyFee // Exclude current month penalty
    : 0;
  
  const lastPayment = payments?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  
  return {
    success: true,
    data: {
      ...member,
      total_paid: totalPaid,
      total_due: totalDue + Math.max(0, penaltyAmount),
      months_paid: monthsPaid,
      months_unpaid: monthsUnpaid,
      penalty_amount: Math.max(0, penaltyAmount),
      last_payment_date: lastPayment?.created_at || null,
    },
  };
}

/**
 * Search members by student ID or name
 */
export async function searchMembers(cohortId: string, query: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("cohort_id", cohortId)
    .or(`student_id.ilike.%${query}%,full_name.ilike.%${query}%,nickname.ilike.%${query}%`)
    .order("student_id", { ascending: true })
    .limit(20);
  
  if (error) {
    console.error("Error searching members:", error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data: data as Member[] };
}
