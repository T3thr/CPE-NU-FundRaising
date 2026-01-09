// =============================================================================
// Database Types for CPE Funds Hub
// =============================================================================

/**
 * Organization - สาขา/คณะ
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  bank_name: string;
  bank_account_no: string;
  bank_account_name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Cohort - รุ่น/ชั้นปี
 */
export interface Cohort {
  id: string;
  organization_id: string;
  name: string;
  academic_year: number;
  monthly_fee: number;
  penalty_fee: number;
  start_month: number;
  end_month: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  organization?: Organization;
}

/**
 * Member - สมาชิก
 */
export interface Member {
  id: string;
  cohort_id: string;
  student_id: string;
  full_name: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  line_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  cohort?: Cohort;
}

/**
 * Payment Status Enum
 */
export type PaymentStatus = "pending" | "verified" | "rejected";

/**
 * Payment - บันทึกการชำระเงิน
 */
export interface Payment {
  id: string;
  member_id: string;
  cohort_id: string;
  amount: number;
  payment_month: number;
  payment_year: number;
  slip_url: string | null;
  slip_trans_ref: string | null;
  slip_verified: boolean;
  slip_verified_at: string | null;
  status: PaymentStatus;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  member?: Member;
  cohort?: Cohort;
}

/**
 * Admin Role Enum
 */
export type AdminRole = "treasurer" | "president" | "super_admin";

/**
 * Admin - ผู้ดูแลระบบ
 */
export interface Admin {
  id: string;
  user_id: string;
  cohort_id: string | null;
  organization_id: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  cohort?: Cohort;
  organization?: Organization;
}

/**
 * Audit Log - บันทึกการเปลี่ยนแปลง
 */
export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string | null;
  ip_address: string | null;
  created_at: string;
}

// =============================================================================
// View Types (Computed/Aggregated)
// =============================================================================

/**
 * Member Payment Status - สถานะการชำระของสมาชิก
 */
export interface MemberPaymentStatus extends Member {
  total_paid: number;
  total_due: number;
  months_paid: number[];
  months_unpaid: number[];
  penalty_amount: number;
  last_payment_date: string | null;
}

/**
 * Cohort Statistics - สถิติรุ่น
 */
export interface CohortStats {
  cohort_id: string;
  total_members: number;
  active_members: number;
  total_collected: number;
  total_pending: number;
  collection_rate: number;
  paid_count: number;
  unpaid_count: number;
}

/**
 * Monthly Report
 */
export interface MonthlyReport {
  month: number;
  year: number;
  total_expected: number;
  total_collected: number;
  paid_members: number;
  unpaid_members: number;
  penalty_collected: number;
}

// =============================================================================
// Form Input Types
// =============================================================================

export interface CreateMemberInput {
  cohort_id: string;
  student_id: string;
  full_name: string;
  nickname?: string;
  email?: string;
  phone?: string;
  line_id?: string;
}

/**
 * Form data for member creation/editing (without cohort_id)
 */
export interface MemberFormData {
  student_id: string;
  full_name: string;
  nickname: string;
  email: string;
  phone: string;
  line_id: string;
}

export interface CreatePaymentInput {
  member_id: string;
  cohort_id: string;
  amount: number;
  payment_month: number;
  payment_year: number;
  slip_url?: string;
}

export interface VerifySlipInput {
  payment_id: string;
  verified: boolean;
  notes?: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// EasySlip Types
// =============================================================================

export interface EasySlipVerifyRequest {
  image?: string;
  transRef?: string;
}

export interface EasySlipData {
  transRef: string;
  sendingBank: string;
  receivingBank: string;
  amount: number;
  date: string;
  sender: {
    name: string;
    account: string;
  };
  receiver: {
    name: string;
    account: string;
  };
}

export interface EasySlipResponse {
  success: boolean;
  data?: EasySlipData;
  error?: string;
}
