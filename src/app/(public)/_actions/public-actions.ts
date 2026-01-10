"use server";
// =============================================================================
// Public Actions - Server Actions for Public Pages (/pay, /status)
// Best practices: Next.js 15+, Type-safe, Optimized for performance
// =============================================================================

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { appConfig } from "@/config/app.config";

// =============================================================================
// Types
// =============================================================================

export interface MemberLookupResult {
  success: boolean;
  member?: {
    id: string;
    studentId: string;
    fullName: string;
    nickname: string;
    cohortId: string;
    cohortName: string;
    monthlyFee: number;
  };
  error?: string;
}

export interface PaymentInfo {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: "pending" | "verified" | "rejected";
  paidAt?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  member?: {
    id: string;
    studentId: string;
    fullName: string;
    nickname: string;
    cohortId: string;
    cohortName: string;
    monthlyFee: number;
    startMonth: number;
  };
  payments?: PaymentInfo[];
  error?: string;
}

export interface PublicPaymentGridItem {
  member: {
    id: string;
    studentId: string;
    name: string;
    fullName: string;
    status: string;
  };
  months: Record<number, { id?: string; status: string; amount?: number }>;
}

export interface CreatePaymentResult {
  success: boolean;
  transactionId?: string;
  qrCodeUrl?: string;
  amount?: number;
  error?: string;
}

// =============================================================================
// 1. Look Up Member by Student ID (Real-time Validation)
// =============================================================================

export async function lookupMember(studentId: string): Promise<MemberLookupResult> {
  if (!studentId || studentId.length !== 8) {
    return { success: false, error: "รหัสนิสิต ต้องมี 8 หลัก" };
  }

  const supabase = await createSupabaseServerClient();

  // Get active cohort first
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, monthly_fee, start_month")
    .eq("is_active", true)
    .single();

  if (!cohort) {
    return { success: false, error: "ไม่พบข้อมูลรุ่น กรุณาติดต่อผู้ดูแล" };
  }

  // Look up member
  const { data: member, error } = await supabase
    .from("members")
    .select("id, student_id, title, first_name, last_name, nickname, status")
    .eq("cohort_id", cohort.id)
    .eq("student_id", studentId)
    .single();

  if (error || !member) {
    return { success: false, error: "ไม่พบข้อมูลสมาชิก กรุณาตรวจสอบรหัสนิสิต" };
  }

  if (member.status !== "active") {
    return { success: false, error: "สมาชิกนี้ไม่อยู่ในสถานะใช้งาน" };
  }

  return {
    success: true,
    member: {
      id: member.id,
      studentId: member.student_id,
      fullName: `${member.title || ""}${member.first_name} ${member.last_name}`.trim(),
      nickname: member.nickname || member.first_name,
      cohortId: cohort.id,
      cohortName: cohort.name,
      monthlyFee: cohort.monthly_fee,
    },
  };
}

// =============================================================================
// 2. Get Member Payment Status with All Months
// =============================================================================

export async function getMemberPaymentStatus(
  studentId: string,
  year?: number
): Promise<PaymentStatusResult> {
  if (!studentId || studentId.length !== 8) {
    return { success: false, error: "รหัสนิสิตไม่ถูกต้อง" };
  }

  const supabase = await createSupabaseServerClient();

  // Get active cohort
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, monthly_fee, start_month")
    .eq("is_active", true)
    .single();

  if (!cohort) {
    return { success: false, error: "ไม่พบข้อมูลรุ่น" };
  }

  // Look up member
  const { data: member, error } = await supabase
    .from("members")
    .select("id, student_id, title, first_name, last_name, nickname")
    .eq("cohort_id", cohort.id)
    .eq("student_id", studentId)
    .single();

  if (error || !member) {
    return { success: false, error: "ไม่พบข้อมูลสมาชิก" };
  }

  // Get payment year
  const paymentYear = year || new Date().getFullYear();

  // Get all payments for this year
  const { data: payments } = await supabase
    .from("payments")
    .select("id, payment_month, payment_year, amount, status, verified_at")
    .eq("member_id", member.id)
    .eq("payment_year", paymentYear);

  return {
    success: true,
    member: {
      id: member.id,
      studentId: member.student_id,
      fullName: `${member.title || ""}${member.first_name} ${member.last_name}`.trim(),
      nickname: member.nickname || member.first_name,
      cohortId: cohort.id,
      cohortName: cohort.name,
      monthlyFee: cohort.monthly_fee,
      startMonth: cohort.start_month,
    },
    payments: payments?.map(p => ({
      id: p.id,
      month: p.payment_month,
      year: p.payment_year,
      amount: p.amount,
      status: p.status as "pending" | "verified" | "rejected",
      paidAt: p.verified_at,
    })) || [],
  };
}

// =============================================================================
// 3. Get Public Payment Grid (For Status Page - All Members)
// =============================================================================

export async function getPublicPaymentsGrid(year?: number, searchQuery?: string) {
  const supabase = await createSupabaseServerClient();

  // Get active cohort
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("id, name, monthly_fee, start_month")
    .eq("is_active", true)
    .single();

  if (!cohort) return { success: false, members: [], cohort: null };

  // Get payment year
  const paymentYear = year || new Date().getFullYear();

  // Build member query
  let memberQuery = supabase
    .from("members")
    .select("id, student_id, title, first_name, last_name, nickname, status")
    .eq("cohort_id", cohort.id)
    .eq("status", "active")
    .order("student_id", { ascending: true });

  // Apply search if provided
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.trim();
    // Search by student_id or name
    if (/^\d+$/.test(query)) {
      memberQuery = memberQuery.ilike("student_id", `%${query}%`);
    } else {
      memberQuery = memberQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,nickname.ilike.%${query}%`);
    }
  }

  const { data: members } = await memberQuery;

  if (!members || members.length === 0) {
    return { success: true, members: [], cohort };
  }

  // Get all payments for this year
  const memberIds = members.map(m => m.id);
  const { data: payments } = await supabase
    .from("payments")
    .select("id, member_id, payment_month, amount, status")
    .in("member_id", memberIds)
    .eq("payment_year", paymentYear);

  // Build payment map
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
  const result: PublicPaymentGridItem[] = members.map(m => ({
    member: {
      id: m.id,
      studentId: m.student_id,
      name: m.nickname || m.first_name,
      fullName: `${m.title || ""}${m.first_name} ${m.last_name}`.trim(),
      status: m.status,
    },
    months: paymentMap.get(m.id) || {},
  }));

  return {
    success: true,
    members: result,
    cohort: {
      id: cohort.id,
      name: cohort.name,
      monthlyFee: cohort.monthly_fee,
      startMonth: cohort.start_month,
    },
  };
}

// =============================================================================
// 4. Create Payment Transaction (For QR Generation)
// =============================================================================

export async function createPaymentTransaction(
  studentId: string,
  months: number[],
  year: number
): Promise<CreatePaymentResult> {
  if (!studentId || months.length === 0) {
    return { success: false, error: "ข้อมูลไม่ครบถ้วน" };
  }

  const supabase = await createSupabaseServerClient();

  // Get member and cohort info
  const lookup = await lookupMember(studentId);
  if (!lookup.success || !lookup.member) {
    return { success: false, error: lookup.error || "ไม่พบข้อมูลสมาชิก" };
  }

  const { member } = lookup;
  const totalAmount = months.length * member.monthlyFee;

  // Check for existing payments
  for (const month of months) {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("member_id", member.id)
      .eq("payment_month", month)
      .eq("payment_year", year)
      .single();

    if (existing) {
      const monthName = appConfig.thaiMonths[month - 1];
      return { success: false, error: `เดือน${monthName} มีการชำระเงินแล้ว` };
    }
  }

  // Create pending payment records
  const paymentRecords = months.map(month => ({
    member_id: member.id,
    cohort_id: member.cohortId,
    amount: member.monthlyFee,
    payment_month: month,
    payment_year: year,
    status: "pending",
  }));

  const { error } = await supabase.from("payments").insert(paymentRecords);

  if (error) {
    console.error("Failed to create payments:", error);
    return { success: false, error: "ไม่สามารถสร้างรายการได้" };
  }

  // Generate transaction ID (for tracking)
  const transactionId = `TXN-${Date.now()}-${studentId}`;

  // In production, generate actual PromptPay QR code here
  // For now, return placeholder
  return {
    success: true,
    transactionId,
    amount: totalAmount,
    qrCodeUrl: undefined, // Would be generated from bank API
  };
}

// =============================================================================
// 5. Verify Payment via EasySlip (Auto-check)
// =============================================================================

export async function checkPaymentStatus(transactionId: string) {
  // This would integrate with EasySlip API to check for matching payments
  // For now, return pending status
  
  return {
    success: true,
    status: "pending" as const,
    message: "กำลังตรวจสอบ...",
  };
}

// =============================================================================
// 6. Submit Manual Payment (with slip URL - goes to verify queue)
// =============================================================================

export async function submitPaymentWithSlip(
  studentId: string,
  months: number[],
  year: number,
  slipUrl?: string
) {
  const supabase = await createSupabaseServerClient();

  // Get member
  const lookup = await lookupMember(studentId);
  if (!lookup.success || !lookup.member) {
    return { success: false, error: lookup.error || "ไม่พบข้อมูลสมาชิก" };
  }

  const { member } = lookup;

  // Create pending payment records
  const paymentRecords = months.map(month => ({
    member_id: member.id,
    cohort_id: member.cohortId,
    amount: member.monthlyFee,
    payment_month: month,
    payment_year: year,
    status: "pending",
    slip_url: slipUrl,
  }));

  const { error } = await supabase.from("payments").insert(paymentRecords);

  if (error) {
    // Check if duplicate
    if (error.code === "23505") {
      return { success: false, error: "มีรายการชำระเงินเดือนนี้อยู่แล้ว" };
    }
    return { success: false, error: "ไม่สามารถบันทึกได้" };
  }

  // Revalidate paths
  revalidatePath("/admin/payments");
  revalidatePath("/admin/verify");
  revalidatePath("/status");

  return { success: true };
}

// =============================================================================
// 7. Get Available Years
// =============================================================================

export async function getAvailableYears() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("payments")
    .select("payment_year")
    .order("payment_year", { ascending: false });

  if (!data || data.length === 0) {
    const currentYear = new Date().getFullYear();
    return [currentYear];
  }

  const years = [...new Set(data.map(d => d.payment_year))].sort((a, b) => b - a);
  return years;
}
