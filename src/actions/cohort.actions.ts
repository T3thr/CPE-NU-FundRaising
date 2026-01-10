"use server";
// =============================================================================
// Cohort Server Actions
// =============================================================================

import { createSupabaseServerClient } from "@utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { Cohort, CohortStats } from "@/types/database";

/**
 * Get all cohorts with optional organization filter
 */
export async function getCohorts(organizationId?: string) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from("cohorts")
    .select(`
      *,
      organization:organizations(*)
    `)
    .order("academic_year", { ascending: false });
  
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching cohorts:", error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data: data as Cohort[] };
}

/**
 * Get active cohorts only
 */
export async function getActiveCohorts(organizationId?: string) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from("cohorts")
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq("is_active", true)
    .order("academic_year", { ascending: false });
  
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching active cohorts:", error);
    return { success: false, error: error.message, data: [] };
  }
  
  return { success: true, data: data as Cohort[] };
}

/**
 * Get cohort by ID
 */
export async function getCohortById(id: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("cohorts")
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching cohort:", error);
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data: data as Cohort };
}

/**
 * Create a new cohort
 */
export async function createCohort(input: {
  organization_id: string;
  name: string;
  academic_year: number;
  monthly_fee?: number;
  penalty_fee?: number;
  start_month?: number;
  end_month?: number;
}) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("cohorts")
    .insert({
      monthly_fee: 70,
      penalty_fee: 10,
      start_month: 6, // June
      end_month: 5,   // May
      is_active: true,
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating cohort:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/super-admin/cohorts");
  revalidatePath("/admin");
  return { success: true, data: data as Cohort };
}

/**
 * Update a cohort
 */
export async function updateCohort(
  id: string,
  input: Partial<Omit<Cohort, "id" | "created_at" | "organization">>
) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("cohorts")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating cohort:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/super-admin/cohorts");
  revalidatePath("/admin");
  return { success: true, data: data as Cohort };
}

/**
 * Toggle cohort active status
 */
export async function toggleCohortStatus(id: string) {
  const supabase = await createSupabaseServerClient();
  
  // Get current status
  const { data: current } = await supabase
    .from("cohorts")
    .select("is_active")
    .eq("id", id)
    .single();
  
  if (!current) {
    return { success: false, error: "Cohort not found" };
  }
  
  const { error } = await supabase
    .from("cohorts")
    .update({
      is_active: !current.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  
  if (error) {
    console.error("Error toggling cohort status:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/super-admin/cohorts");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Get cohort statistics
 */
export async function getCohortStats(cohortId: string): Promise<{ 
  success: boolean; 
  data?: CohortStats; 
  error?: string 
}> {
  const supabase = await createSupabaseServerClient();
  
  // Get member count
  const { count: totalMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId);
  
  const { count: activeMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId)
    .eq("is_active", true);
  
  // Get payment totals
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status")
    .eq("cohort_id", cohortId);
  
  const totalCollected = payments
    ?.filter(p => p.status === "verified")
    .reduce((sum, p) => sum + p.amount, 0) || 0;
  
  const totalPending = payments
    ?.filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0) || 0;
  
  const paidCount = payments?.filter(p => p.status === "verified").length || 0;
  const unpaidCount = (activeMembers || 0) - paidCount;
  
  const collectionRate = totalMembers && totalMembers > 0
    ? Math.round((paidCount / totalMembers) * 100)
    : 0;
  
  return {
    success: true,
    data: {
      cohort_id: cohortId,
      total_members: totalMembers || 0,
      active_members: activeMembers || 0,
      total_collected: totalCollected,
      total_pending: totalPending,
      collection_rate: collectionRate,
      paid_count: paidCount,
      unpaid_count: unpaidCount,
    },
  };
}

/**
 * Clone cohort structure for new academic year
 */
export async function cloneCohort(
  sourceCohortId: string,
  newName: string,
  newAcademicYear: number
) {
  const supabase = await createSupabaseServerClient();
  
  // Get source cohort
  const { data: source, error: sourceError } = await supabase
    .from("cohorts")
    .select("*")
    .eq("id", sourceCohortId)
    .single();
  
  if (sourceError || !source) {
    return { success: false, error: "Source cohort not found" };
  }
  
  // Create new cohort with same settings
  const { data: newCohort, error: createError } = await supabase
    .from("cohorts")
    .insert({
      organization_id: source.organization_id,
      name: newName,
      academic_year: newAcademicYear,
      monthly_fee: source.monthly_fee,
      penalty_fee: source.penalty_fee,
      start_month: source.start_month,
      end_month: source.end_month,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (createError) {
    console.error("Error cloning cohort:", createError);
    return { success: false, error: createError.message };
  }
  
  revalidatePath("/super-admin/cohorts");
  return { success: true, data: newCohort as Cohort };
}
