"use server";
// =============================================================================
// Admin Server Actions - Real Data from Supabase
// Secure Service Role Access with App-Level Authorization
// =============================================================================

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// =============================================================================
// Helper: Get Authorized Admin Client
// Bypasses RLS but enforces App-Level Security Check
// =============================================================================
async function getAuthenticatedAdminClient() {
  const session = await auth();
  
  // 1. Authentication Check
  if (!session?.user) {
    throw new Error("Unauthorized: Please login first");
  }

  // 2. Authorization Check (Role-Based)
  // Check strict super_admin for modifying critical data
  const userRole = (session.user as { role?: string }).role;
  
  // Note: We use Admin Client which has FULL ACCESS.
  // So we must be very careful to only return it to trusted users.
  // In this system, only super_admin (Treasurer) should be accessing admin actions.
  // If public users access this file's actions, they will be blocked here.
  if (userRole !== 'super_admin') {
     throw new Error("Permission Denied: Only Treasurer can perform this action.");
  }

  return createSupabaseAdminClient();
}

// =============================================================================
// Types
// =============================================================================

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  paidThisMonth: number;
  pendingPayments: number;
  unpaidMembers: number;
  totalCollected: number;
  totalExpected: number;
  collectionPercentage: number;
}

export interface MemberWithPayments {
  id: string;
  studentId: string;
  title: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  email: string | null;
  status: string;
  paidMonths: number;
  unpaidAmount: number;
  lastPaymentDate: string | null;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  studentId: string;
  amount: number;
  paymentMonth: number;
  paymentYear: number;
  status: "pending" | "verified" | "rejected";
  slipUrl: string | null;
  createdAt: string;
}

export interface CohortSettings {
  id: string;
  name: string;
  slug: string;
  academicYear: number;
  monthlyFee: number;
  penaltyFee: number;
  startMonth: number;
  endMonth: number;
  isActive: boolean;
  config: Record<string, unknown>;
}

// =============================================================================
// Dashboard Actions
// =============================================================================

/**
 * Get dashboard statistics for the current cohort
 */
export async function getDashboardStats(cohortId?: string): Promise<DashboardStats> {
  // Use Admin Client to ensure we can read ALL data regardless of RLS
  // (Standard admin dashboard needs to see everything)
  const supabase = await getAuthenticatedAdminClient();
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get active cohort if not specified
  let activeCohortId = cohortId;
  if (!activeCohortId) {
    const { data: cohort } = await supabase
      .from("cohorts")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single();
    activeCohortId = cohort?.id;
  }

  if (!activeCohortId) {
    return {
      totalMembers: 0,
      activeMembers: 0,
      paidThisMonth: 0,
      pendingPayments: 0,
      unpaidMembers: 0,
      totalCollected: 0,
      totalExpected: 0,
      collectionPercentage: 0,
    };
  }

  // Get cohort settings
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("monthly_fee")
    .eq("id", activeCohortId)
    .single();

  const monthlyFee = cohort?.monthly_fee || 70;

  // Get total and active members
  const { count: totalMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", activeCohortId);

  const { count: activeMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", activeCohortId)
    .eq("status", "active");

  // Get payments this month
  const { count: paidThisMonth } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", activeCohortId)
    .eq("payment_month", currentMonth)
    .eq("payment_year", currentYear)
    .eq("status", "verified");

  // Get pending payments
  const { count: pendingPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", activeCohortId)
    .eq("status", "pending");

  // Calculate unpaid members (members who haven't paid this month)
  const unpaidMembers = (activeMembers || 0) - (paidThisMonth || 0);

  // Get total collected this year
  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("cohort_id", activeCohortId)
    .eq("payment_year", currentYear)
    .eq("status", "verified");

  const totalCollected = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalExpected = (activeMembers || 0) * currentMonth * monthlyFee;
  const collectionPercentage = totalExpected > 0 
    ? Math.round((totalCollected / totalExpected) * 100) 
    : 0;

  return {
    totalMembers: totalMembers || 0,
    activeMembers: activeMembers || 0,
    paidThisMonth: paidThisMonth || 0,
    pendingPayments: pendingPayments || 0,
    unpaidMembers: unpaidMembers > 0 ? unpaidMembers : 0,
    totalCollected,
    totalExpected,
    collectionPercentage,
  };
}

/**
 * Get recent payments for dashboard
 */
export async function getRecentPayments(limit = 5): Promise<PaymentRecord[]> {
  const supabase = await getAuthenticatedAdminClient();

  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      member_id,
      amount,
      payment_month,
      payment_year,
      status,
      slip_url,
      created_at,
      members (
        student_id,
        first_name,
        last_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent payments:", error);
    return [];
  }

  return (data || []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    memberId: p.member_id as string,
    memberName: `${(p.members as Record<string, string>)?.first_name || ""} ${(p.members as Record<string, string>)?.last_name || ""}`.trim(),
    studentId: (p.members as Record<string, string>)?.student_id || "",
    amount: p.amount as number,
    paymentMonth: p.payment_month as number,
    paymentYear: p.payment_year as number,
    status: p.status as "pending" | "verified" | "rejected",
    slipUrl: p.slip_url as string | null,
    createdAt: p.created_at as string,
  }));
}

/**
 * Get members with unpaid balances
 */
export async function getUnpaidMembers(limit = 5): Promise<MemberWithPayments[]> {
  const supabase = await getAuthenticatedAdminClient();
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get active cohort
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, monthly_fee, penalty_fee")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!cohort) return [];

  const monthlyFee = cohort.monthly_fee || 70;

  // Get all active members
  const { data: members } = await supabase
    .from("members")
    .select("id, student_id, title, first_name, last_name, nickname, email, status")
    .eq("cohort_id", cohort.id)
    .eq("status", "active");

  if (!members) return [];

  // Get paid months for each member
  const memberIds = members.map(m => m.id);
  const { data: payments } = await supabase
    .from("payments")
    .select("member_id, payment_month")
    .in("member_id", memberIds)
    .eq("payment_year", currentYear)
    .eq("status", "verified");

  // Calculate paid months per member
  const paidMonthsMap = new Map<string, number>();
  payments?.forEach(p => {
    const current = paidMonthsMap.get(p.member_id) || 0;
    paidMonthsMap.set(p.member_id, current + 1);
  });

  // Build result with unpaid amounts
  const result: MemberWithPayments[] = members
    .map(m => {
      const paidMonths = paidMonthsMap.get(m.id) || 0;
      const unpaidMonths = Math.max(0, currentMonth - paidMonths);
      return {
        id: m.id,
        studentId: m.student_id,
        title: m.title || "",
        firstName: m.first_name,
        lastName: m.last_name,
        nickname: m.nickname,
        email: m.email,
        status: m.status,
        paidMonths,
        unpaidAmount: unpaidMonths * monthlyFee,
        lastPaymentDate: null,
      };
    })
    .filter(m => m.unpaidAmount > 0)
    .sort((a, b) => b.unpaidAmount - a.unpaidAmount)
    .slice(0, limit);

  return result;
}

// =============================================================================
// Members Actions
// =============================================================================

/**
 * Get all members for a cohort
 */
export async function getMembers(cohortId?: string) {
  const supabase = await getAuthenticatedAdminClient();

  let query = supabase
    .from("members")
    .select("*, cohorts(name, academic_year)")
    .order("student_id", { ascending: true });

  if (cohortId) {
    query = query.eq("cohort_id", cohortId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }

  return data || [];
}

/**
 * Import members from Smart Import
 */
export async function importMembers(
  cohortId: string,
  members: Array<{
    studentId: string;
    title?: string;
    firstName: string;
    lastName: string;
    nickname?: string;
    email?: string;
  }>
) {
  const supabase = await getAuthenticatedAdminClient();

  const insertData = members.map(m => ({
    cohort_id: cohortId,
    student_id: m.studentId,
    title: m.title || null,
    first_name: m.firstName,
    last_name: m.lastName,
    nickname: m.nickname || null,
    email: m.email || null,
    status: "active",
    profile_data: {},
  }));

  const { data, error } = await supabase
    .from("members")
    .upsert(insertData, { 
      onConflict: "cohort_id,student_id",
      ignoreDuplicates: false 
    })
    .select();

  if (error) {
    console.error("Error importing members:", error);
    return { success: false, error: error.message, count: 0 };
  }

  revalidatePath("/admin/members");
  return { success: true, count: data?.length || 0 };
}

/**
 * Update member status
 */
export async function updateMemberStatus(memberId: string, status: string) {
  const supabase = await getAuthenticatedAdminClient();

  const { error } = await supabase
    .from("members")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", memberId);

  if (error) {
    console.error("Error updating member status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/members");
  return { success: true };
}

// =============================================================================
// Cohort/Settings Actions
// =============================================================================

/**
 * Get active cohort settings
 */
export async function getActiveCohort(): Promise<CohortSettings | null> {
  const supabase = await getAuthenticatedAdminClient();

  const { data, error } = await supabase
    .from("cohorts")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Error fetching active cohort:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    academicYear: data.academic_year,
    monthlyFee: data.monthly_fee,
    penaltyFee: data.penalty_fee,
    startMonth: data.start_month,
    endMonth: data.end_month,
    isActive: data.is_active,
    config: data.config || {},
  };
}

/**
 * Get all cohorts for the organization
 */
export async function getCohorts(): Promise<CohortSettings[]> {
  const supabase = await getAuthenticatedAdminClient();

  const { data, error } = await supabase
    .from("cohorts")
    .select("*")
    .order("academic_year", { ascending: false });

  if (error || !data) {
    console.error("Error fetching cohorts:", error);
    return [];
  }

  return data.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    academicYear: c.academic_year,
    monthlyFee: c.monthly_fee,
    penaltyFee: c.penalty_fee,
    startMonth: c.start_month,
    endMonth: c.end_month,
    isActive: c.is_active,
    config: c.config || {},
  }));
}

/**
 * Create a new cohort (รุ่น)
 * Based on: src/docs/SYSTEM-Validation&BusinessRules.md
 */
export async function createCohort(data: {
  name: string;
  slug?: string;
  academicYear: number;
  monthlyFee?: number;
  penaltyFee?: number;
  startMonth?: number;
  endMonth?: number;
  setAsActive?: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await getAuthenticatedAdminClient();

  // Get organization
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .limit(1)
    .single();

  if (!org) {
    return { success: false, error: "กรุณาสร้างข้อมูลองค์กรก่อน" };
  }

  // Generate slug from name if not provided
  const slug = data.slug || data.name
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);

  // If setting as active, deactivate other cohorts
  if (data.setAsActive) {
    await supabase
      .from("cohorts")
      .update({ is_active: false })
      .eq("organization_id", org.id);
  }

  // Create cohort
  const { data: cohort, error } = await supabase
    .from("cohorts")
    .insert({
      organization_id: org.id,
      name: data.name,
      slug,
      academic_year: data.academicYear,
      monthly_fee: data.monthlyFee ?? 70,
      penalty_fee: data.penaltyFee ?? 10,
      start_month: data.startMonth ?? 7, // กรกฎาคม
      end_month: data.endMonth ?? 3, // มีนาคม
      is_active: data.setAsActive ?? true,
      config: {},
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating cohort:", error);
    // Handle RLS Policy violation specifically
    if (error.code === '42501') {
      return { 
        success: false, 
        error: "คุณไม่มีสิทธิ์ดำเนินการนี้ (Permission Denied) กรุณาตรวจสอบว่าคุณเข้าสู่ระบบด้วยบัญชี 'เหรัญญิก' (ไม่ใช่สมาชิกสาขา)" 
      };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/organization");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/members");
  return { success: true, id: cohort.id };
}

/**
 * Set a cohort as active (และ deactivate อื่นๆ)
 */
export async function setActiveCohort(cohortId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await getAuthenticatedAdminClient();

  // Deactivate all cohorts first
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("organization_id")
    .eq("id", cohortId)
    .single();

  if (!cohort) {
    return { success: false, error: "ไม่พบรุ่นที่ต้องการ" };
  }

  await supabase
    .from("cohorts")
    .update({ is_active: false })
    .eq("organization_id", cohort.organization_id);

  // Set selected cohort as active
  const { error } = await supabase
    .from("cohorts")
    .update({ is_active: true })
    .eq("id", cohortId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/organization");
  revalidatePath("/admin/settings");
  return { success: true };
}

/**
 * Update cohort settings
 */
export async function updateCohortSettings(
  cohortId: string,
  settings: Partial<{
    monthlyFee: number;
    penaltyFee: number;
    startMonth: number;
    endMonth: number;
    config: Record<string, unknown>;
  }>
) {
  const supabase = await getAuthenticatedAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (settings.monthlyFee !== undefined) updateData.monthly_fee = settings.monthlyFee;
  if (settings.penaltyFee !== undefined) updateData.penalty_fee = settings.penaltyFee;
  if (settings.startMonth !== undefined) updateData.start_month = settings.startMonth;
  if (settings.endMonth !== undefined) updateData.end_month = settings.endMonth;
  if (settings.config !== undefined) updateData.config = settings.config;

  const { error } = await supabase
    .from("cohorts")
    .update(updateData)
    .eq("id", cohortId);

  if (error) {
    console.error("Error updating cohort settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { success: true };
}

// =============================================================================
// Payments Actions
// =============================================================================

/**
 * Get payments grid data for a cohort
 */
export async function getPaymentsGrid(cohortId: string, year: number) {
  const supabase = await getAuthenticatedAdminClient();

  // Get all members
  const { data: members } = await supabase
    .from("members")
    .select("id, student_id, title, first_name, last_name, nickname, status")
    .eq("cohort_id", cohortId)
    .order("student_id", { ascending: true });

  if (!members) return [];

  // Get all payments for this year
  const memberIds = members.map(m => m.id);
  const { data: payments } = await supabase
    .from("payments")
    .select("id, member_id, payment_month, amount, status")
    .in("member_id", memberIds)
    .eq("payment_year", year);

  // Build payment map with amount info
  const paymentMap = new Map<string, Record<number, { id: string; status: string; amount: number }>>();
  payments?.forEach(p => {
    if (!paymentMap.has(p.member_id)) {
      paymentMap.set(p.member_id, {});
    }
    paymentMap.get(p.member_id)![p.payment_month] = {
      id: p.id,
      status: p.status,
      amount: p.amount,
    };
  });

  // Build result
  return members.map(m => ({
    member: {
      id: m.id,
      studentId: m.student_id,
      name: m.nickname || m.first_name,
      fullName: `${m.title || ""}${m.first_name} ${m.last_name}`.trim(),
      status: m.status,
    },
    months: paymentMap.get(m.id) || {},
  }));
}

/**
 * Verify a payment
 */
export async function verifyPayment(paymentId: string, verified: boolean) {
  const supabase = await getAuthenticatedAdminClient();

  const { error } = await supabase
    .from("payments")
    .update({
      status: verified ? "verified" : "rejected",
      slip_verified: verified,
      slip_verified_at: verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) {
    console.error("Error verifying payment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/verify");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Update payment amount
 */
export async function updatePaymentAmount(paymentId: string, amount: number) {
  const supabase = await getAuthenticatedAdminClient();

  const { error } = await supabase
    .from("payments")
    .update({
      amount: amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) {
    console.error("Error updating payment amount:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Create or update manual payment
 */
export async function upsertPayment(data: {
  cohortId: string;
  memberId: string;
  month: number;
  year: number;
  amount: number;
  status?: "pending" | "verified";
}) {
  const supabase = await getAuthenticatedAdminClient();

  // Check if payment exists
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("member_id", data.memberId)
    .eq("payment_month", data.month)
    .eq("payment_year", data.year)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("payments")
      .update({
        amount: data.amount,
        status: data.status || "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Create new
    const { error } = await supabase
      .from("payments")
      .insert({
        cohort_id: data.cohortId,
        member_id: data.memberId,
        payment_month: data.month,
        payment_year: data.year,
        amount: data.amount,
        status: data.status || "verified",
        verified_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Get pending slips for verification
 */
export async function getPendingSlips(limit = 20, offset = 0) {
  const supabase = await getAuthenticatedAdminClient();

  const { data, error, count } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_month,
      payment_year,
      slip_url,
      slip_trans_ref,
      created_at,
      members (
        student_id,
        first_name,
        last_name
      )
    `, { count: "exact" })
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching pending slips:", error);
    return { data: [], total: 0 };
  }

  return { data: data || [], total: count || 0 };
}

// =============================================================================
// Service Status Actions
// =============================================================================

/**
 * Get EasySlip API status and quota (REAL API CALL)
 */
export async function getEasySlipStatus(): Promise<{
  enabled: boolean;
  quotaPerWeek?: number;
  usage?: { used: number; remaining: number };
  error?: string;
}> {
  try {
    const apiKey = process.env.EASYSLIP_API_KEY;
    if (!apiKey) {
      return { enabled: false, error: "EASYSLIP_API_KEY not configured" };
    }

    // Call EasySlip /me endpoint for quota info
    const res = await fetch("https://developer.easyslip.com/api/v1/me", {
      headers: { 
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("EasySlip API error:", res.status, errorText);
      return { enabled: false, error: `API Error: ${res.status}` };
    }

    const data = await res.json();
    
    // EasySlip API returns quota info in data object
    const quotaPerWeek = data.data?.quota || 50;
    const quotaUsed = data.data?.usedQuota || data.data?.used || 0;
    
    return {
      enabled: true,
      quotaPerWeek,
      usage: {
        used: quotaUsed,
        remaining: Math.max(0, quotaPerWeek - quotaUsed),
      },
    };
  } catch (err) {
    console.error("EasySlip status check failed:", err);
    return { enabled: false, error: "Failed to connect to EasySlip" };
  }
}

/**
 * Get Line Messaging status (Check ENV variables)
 */
export async function getLineMessagingStatus(): Promise<{ 
  enabled: boolean; 
  targetType?: "group" | "user";
  channelConfigured?: boolean;
  targetConfigured?: boolean;
}> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const groupId = process.env.LINE_GROUP_ID;
  const userId = process.env.LINE_USER_ID;

  const channelConfigured = !!(accessToken && accessToken.length > 10);
  const targetConfigured = !!(groupId || userId);

  if (!channelConfigured) {
    return { 
      enabled: false, 
      channelConfigured: false,
      targetConfigured,
    };
  }

  // Channel is configured but no target
  if (!targetConfigured) {
    return {
      enabled: false,
      channelConfigured: true,
      targetConfigured: false,
    };
  }

  return {
    enabled: true,
    channelConfigured: true,
    targetConfigured: true,
    targetType: groupId ? "group" : "user",
  };
}

// =============================================================================
// Export Actions
// =============================================================================

/**
 * Export members to CSV format
 */
export async function exportMembersCSV(cohortId: string) {
  const supabase = await getAuthenticatedAdminClient();

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("cohort_id", cohortId)
    .order("student_id", { ascending: true });

  if (!members) return "";

  const headers = ["รหัสนิสิต", "คำนำหน้า", "ชื่อ", "นามสกุล", "ชื่อเล่น", "อีเมล", "เบอร์โทร", "Line ID", "สถานะ"];
  const rows = members.map(m => [
    m.student_id,
    m.title || "",
    m.first_name,
    m.last_name,
    m.nickname || "",
    m.email || "",
    m.phone || "",
    m.line_id || "",
    m.status,
  ]);

  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  return "\uFEFF" + csv; // UTF-8 BOM for Excel compatibility
}

/**
 * Export payments to CSV format
 */
export async function exportPaymentsCSV(cohortId: string, year: number) {
  const supabase = await getAuthenticatedAdminClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      amount,
      payment_month,
      payment_year,
      status,
      created_at,
      members (
        student_id,
        first_name,
        last_name
      )
    `)
    .eq("cohort_id", cohortId)
    .eq("payment_year", year)
    .order("created_at", { ascending: false });

  if (!payments) return "";

  const headers = ["รหัสนิสิต", "ชื่อ-นามสกุล", "จำนวนเงิน", "เดือน", "ปี", "สถานะ", "วันที่ชำระ"];
  const rows = payments.map((p: Record<string, unknown>) => [
    (p.members as Record<string, string>)?.student_id || "",
    `${(p.members as Record<string, string>)?.first_name || ""} ${(p.members as Record<string, string>)?.last_name || ""}`.trim(),
    p.amount,
    p.payment_month,
    p.payment_year,
    p.status === "verified" ? "ชำระแล้ว" : p.status === "pending" ? "รอตรวจสอบ" : "ปฏิเสธ",
    new Date(p.created_at as string).toLocaleDateString("th-TH"),
  ]);

  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  return "\uFEFF" + csv;
}

// =============================================================================
// Organization Actions
// =============================================================================

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get active organization (first one)
 */
export async function getOrganization(): Promise<OrganizationData | null> {
  const supabase = await getAuthenticatedAdminClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Error fetching organization:", error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logo_url,
    bankName: data.bank_name,
    bankAccountNo: data.bank_account_no,
    bankAccountName: data.bank_account_name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update organization data
 */
export async function updateOrganization(
  orgId: string,
  data: Partial<{
    name: string;
    bankName: string;
    bankAccountNo: string;
    bankAccountName: string;
    logoUrl: string;
  }>
) {
  const supabase = await getAuthenticatedAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.bankName !== undefined) updateData.bank_name = data.bankName;
  if (data.bankAccountNo !== undefined) updateData.bank_account_no = data.bankAccountNo;
  if (data.bankAccountName !== undefined) updateData.bank_account_name = data.bankAccountName;
  if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;

  const { error } = await supabase
    .from("organizations")
    .update(updateData)
    .eq("id", orgId);

  if (error) {
    console.error("Error updating organization:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/organization");
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Create a new organization
 */
export async function createOrganization(data: {
  name: string;
  slug: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
}) {
  const supabase = await getAuthenticatedAdminClient();

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({
      name: data.name,
      slug: data.slug,
      bank_name: data.bankName,
      bank_account_no: data.bankAccountNo,
      bank_account_name: data.bankAccountName,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating organization:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/organization");
  return { success: true, id: org.id };
}

// =============================================================================
// Migration Actions (Google Sheets to Supabase)
// =============================================================================

export interface MigrationPaymentRecord {
  studentId: string;
  firstName: string;
  lastName: string;
  title?: string;
  amount: number;
  month: number;
  year: number;
  slipUrl?: string;
  timestamp?: string;
}

/**
 * Migrate payments from Google Sheets format to Supabase
 * AI-like Smart Features:
 * - Smart member matching (by studentId OR name)
 * - Auto-create members if not exist
 * - Update nickname if provided
 * - Skip duplicate payments
 * - Detailed statistics
 */
export async function migratePayments(
  records: MigrationPaymentRecord[],
  cohortId?: string
): Promise<{ 
  success: boolean; 
  inserted: number; 
  skipped: number;
  membersCreated: number;
  membersUpdated: number;
  errors: string[] 
}> {
  const supabase = await getAuthenticatedAdminClient();
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;
  let membersCreated = 0;
  let membersUpdated = 0;

  try {
    // Get active cohort if not specified
    let activeCohortId = cohortId;
    if (!activeCohortId) {
      const { data: cohort } = await supabase
        .from("cohorts")
        .select("id")
        .eq("is_active", true)
        .single();
      
      if (!cohort) {
        return { success: false, inserted: 0, skipped: 0, membersCreated: 0, membersUpdated: 0, errors: ["ไม่พบ Cohort ที่ใช้งาน - กรุณาสร้างรุ่นก่อน"] };
      }
      activeCohortId = cohort.id;
    }

    // Get organization
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single();

    if (!org) {
      return { success: false, inserted: 0, skipped: 0, membersCreated: 0, membersUpdated: 0, errors: ["ไม่พบข้อมูล Organization - กรุณาสร้างองค์กรก่อน"] };
    }

    // Fetch all existing members for smart matching
    const { data: existingMembers } = await supabase
      .from("members")
      .select("id, student_id, first_name, last_name, nickname")
      .eq("cohort_id", activeCohortId);

    const memberMap = new Map<string, { id: string; firstName: string; lastName: string; nickname?: string }>();
    const nameMap = new Map<string, string>(); // "firstname lastname" -> member id

    if (existingMembers) {
      for (const m of existingMembers) {
        memberMap.set(m.student_id, { id: m.id, firstName: m.first_name, lastName: m.last_name, nickname: m.nickname });
        // Create name index for fuzzy matching
        const nameKey = `${m.first_name} ${m.last_name}`.toLowerCase().trim();
        nameMap.set(nameKey, m.id);
      }
    }

    // Group records by student ID
    const studentRecords: Record<string, MigrationPaymentRecord[]> = {};
    for (const record of records) {
      const key = record.studentId || `name:${record.firstName}${record.lastName}`;
      if (!studentRecords[key]) {
        studentRecords[key] = [];
      }
      studentRecords[key].push(record);
    }

    // Process each student
    const studentKeys = Object.keys(studentRecords);
    for (const key of studentKeys) {
      const payments = studentRecords[key];
      const firstPayment = payments[0];

      try {
        let memberId: string | null = null;
        let isNewMember = false;

        // Strategy 1: Match by student ID
        if (firstPayment.studentId && memberMap.has(firstPayment.studentId)) {
          memberId = memberMap.get(firstPayment.studentId)!.id;
        }
        
        // Strategy 2: Match by name (if no student ID or not found)
        if (!memberId && firstPayment.firstName && firstPayment.lastName) {
          const nameKey = `${firstPayment.firstName} ${firstPayment.lastName}`.toLowerCase().trim();
          if (nameMap.has(nameKey)) {
            memberId = nameMap.get(nameKey)!;
          }
        }

        // Strategy 3: Create new member
        if (!memberId) {
          const studentId = firstPayment.studentId || `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          
          const { data: newMember, error: memberError } = await supabase
            .from("members")
            .insert({
              cohort_id: activeCohortId,
              student_id: studentId,
              title: firstPayment.title || null,
              first_name: firstPayment.firstName || "ไม่ทราบชื่อ",
              last_name: firstPayment.lastName || "",
              nickname: (firstPayment as MigrationPaymentRecord & { nickname?: string }).nickname || null,
              status: "active",
            })
            .select("id")
            .single();

          if (memberError) {
            errors.push(`Member ${firstPayment.studentId}: ${memberError.message}`);
            continue;
          }
          
          memberId = newMember.id;
          membersCreated++;
          isNewMember = true;

          // Update cache
          memberMap.set(studentId, { id: newMember.id, firstName: firstPayment.firstName, lastName: firstPayment.lastName });
        }

        // Update nickname if provided and member exists
        if (!isNewMember && (firstPayment as MigrationPaymentRecord & { nickname?: string }).nickname) {
          const existingMember = memberMap.get(firstPayment.studentId);
          if (existingMember && !(existingMember as { nickname?: string }).nickname) {
            await supabase
              .from("members")
              .update({ nickname: (firstPayment as MigrationPaymentRecord & { nickname?: string }).nickname })
              .eq("id", memberId);
            membersUpdated++;
          }
        }

        // Insert payments for this member
        for (const payment of payments) {
          // Check for duplicate payment
          const { data: existingPayment } = await supabase
            .from("payments")
            .select("id")
            .eq("member_id", memberId)
            .eq("payment_month", payment.month)
            .eq("payment_year", payment.year)
            .single();

          if (existingPayment) {
            skipped++;
            continue;
          }

          // Insert payment
          const { error: paymentError } = await supabase
            .from("payments")
            .insert({
              cohort_id: activeCohortId,
              member_id: memberId,
              amount: payment.amount,
              payment_month: payment.month,
              payment_year: payment.year,
              status: "verified", // From old system = verified
              slip_url: payment.slipUrl || null,
              verified_at: payment.timestamp ? new Date(payment.timestamp).toISOString() : new Date().toISOString(),
            });

          if (paymentError) {
            errors.push(`Payment ${payment.month}/${payment.year}: ${paymentError.message}`);
          } else {
            inserted++;
          }
        }
      } catch (err) {
        errors.push(`Record ${key}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Revalidate affected paths
    revalidatePath("/admin");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/members");

    return {
      success: errors.length === 0,
      inserted,
      skipped,
      membersCreated,
      membersUpdated,
      errors: errors.slice(0, 10), // Limit errors returned
    };
  } catch (err) {
    console.error("Migration error:", err);
    return {
      success: false,
      inserted,
      skipped,
      membersCreated: 0,
      membersUpdated: 0,
      errors: [err instanceof Error ? err.message : "Unknown migration error"],
    };
  }
}
