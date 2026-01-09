// =============================================================================
// Debt & Payment Calculation Utilities
// =============================================================================

import { appConfig } from "@/config/app.config";

/**
 * Academic year months in order (June to May for Thai academic year)
 */
export function getAcademicYearMonths(startMonth: number = 6): number[] {
  const months: number[] = [];
  for (let m = startMonth; m <= 12; m++) months.push(m);
  for (let m = 1; m < startMonth; m++) months.push(m);
  return months;
}

/**
 * Check if a month is in the future relative to current date
 */
export function isFutureMonth(
  month: number,
  academicYear: number,
  currentDate: Date = new Date()
): boolean {
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear() % 100; // 2026 -> 26
  const thaiYear = currentYear + 43; // 26 + 43 = 69 (พ.ศ. 2569)

  if (academicYear > thaiYear) return true;
  if (academicYear < thaiYear) return false;
  return month > currentMonth;
}

/**
 * Calculate months owed based on payment history
 */
export function calculateMonthsOwed(
  paidMonths: number[],
  academicYear: number,
  startMonth: number = appConfig.academic.startMonth,
  currentDate: Date = new Date()
): number[] {
  const allMonths = getAcademicYearMonths(startMonth);
  const owedMonths: number[] = [];

  for (const month of allMonths) {
    if (!isFutureMonth(month, academicYear, currentDate) && !paidMonths.includes(month)) {
      owedMonths.push(month);
    }
  }

  return owedMonths;
}

/**
 * Calculate penalty amount based on months owed
 * Formula: (monthsOwed - 1) * penaltyFee (first month no penalty)
 */
export function calculatePenalty(
  monthsOwed: number,
  penaltyFee: number = appConfig.payment.defaultPenaltyFee
): number {
  if (monthsOwed <= 0) return 0;
  // First month no penalty, subsequent months have penalty
  return Math.max(0, (monthsOwed - 1) * penaltyFee);
}

/**
 * Calculate total debt including base amount and penalties
 */
export function calculateTotalDebt(
  monthsOwed: number,
  monthlyFee: number = appConfig.payment.defaultMonthlyFee,
  penaltyFee: number = appConfig.payment.defaultPenaltyFee
): {
  baseAmount: number;
  penaltyAmount: number;
  totalAmount: number;
} {
  const baseAmount = monthsOwed * monthlyFee;
  const penaltyAmount = calculatePenalty(monthsOwed, penaltyFee);
  const totalAmount = baseAmount + penaltyAmount;

  return {
    baseAmount,
    penaltyAmount,
    totalAmount,
  };
}

/**
 * Calculate amount to pay for specific months (with retroactive penalties)
 */
export function calculatePaymentAmount(
  selectedMonths: number[],
  allOwedMonths: number[],
  monthlyFee: number = appConfig.payment.defaultMonthlyFee,
  penaltyFee: number = appConfig.payment.defaultPenaltyFee
): {
  baseAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  breakdown: { month: number; amount: number; penalty: number }[];
} {
  const breakdown: { month: number; amount: number; penalty: number }[] = [];
  let totalPenalty = 0;

  // Sort months by academic year order
  const academicOrder = getAcademicYearMonths();
  const sortedMonths = [...selectedMonths].sort(
    (a, b) => academicOrder.indexOf(a) - academicOrder.indexOf(b)
  );

  for (const month of sortedMonths) {
    const owedIndex = allOwedMonths.indexOf(month);
    // Penalty based on how many months overdue (position in owed list)
    const monthPenalty = owedIndex > 0 ? penaltyFee : 0;
    totalPenalty += monthPenalty;

    breakdown.push({
      month,
      amount: monthlyFee,
      penalty: monthPenalty,
    });
  }

  const baseAmount = selectedMonths.length * monthlyFee;

  return {
    baseAmount,
    penaltyAmount: totalPenalty,
    totalAmount: baseAmount + totalPenalty,
    breakdown,
  };
}

/**
 * Format amount as Thai Baht currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format amount as simple number with Thai Baht symbol
 */
export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("th-TH")}`;
}

/**
 * Get month name in Thai (short or full)
 */
export function getThaiMonthName(month: number, short: boolean = false): string {
  const months = short ? appConfig.thaiMonthsShort : appConfig.thaiMonths;
  return months[month - 1] || "";
}

/**
 * Parse academic year from various formats
 * e.g., "68", "2568", 68, 2568 -> 68
 */
export function parseAcademicYear(input: string | number): number {
  const num = typeof input === "string" ? parseInt(input, 10) : input;
  if (num > 2500) {
    return num % 100; // 2568 -> 68
  }
  if (num > 100) {
    return num % 100; // 2025 -> 25
  }
  return num; // Already 2-digit
}

/**
 * Convert 2-digit year to full Buddhist Era year
 */
export function toFullBuddhistYear(year: number): number {
  if (year > 100) return year;
  return 2500 + year; // 68 -> 2568
}

/**
 * Get current academic year (based on start month)
 */
export function getCurrentAcademicYear(
  startMonth: number = appConfig.academic.startMonth,
  currentDate: Date = new Date()
): number {
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const thaiYear = currentYear + 543;

  // If before start month, still in previous academic year
  if (currentMonth < startMonth) {
    return (thaiYear - 1) % 100;
  }
  return thaiYear % 100;
}

/**
 * Calculate collection rate percentage
 */
export function calculateCollectionRate(
  collected: number,
  expected: number
): number {
  if (expected <= 0) return 0;
  return Math.round((collected / expected) * 100);
}

/**
 * Get payment status color class
 */
export function getPaymentStatusColor(
  status: "verified" | "pending" | "rejected" | "unpaid" | "future"
): string {
  switch (status) {
    case "verified":
      return "text-green-600 dark:text-green-400";
    case "pending":
      return "text-yellow-600 dark:text-yellow-400";
    case "rejected":
    case "unpaid":
      return "text-red-600 dark:text-red-400";
    case "future":
      return "text-gray-400 dark:text-gray-500";
    default:
      return "text-muted";
  }
}

/**
 * Get payment status label in Thai
 */
export function getPaymentStatusLabel(
  status: "verified" | "pending" | "rejected" | "unpaid" | "future"
): string {
  switch (status) {
    case "verified":
      return "ชำระแล้ว";
    case "pending":
      return "รอตรวจสอบ";
    case "rejected":
      return "ปฏิเสธ";
    case "unpaid":
      return "ค้างชำระ";
    case "future":
      return "ยังไม่ถึงกำหนด";
    default:
      return "-";
  }
}
