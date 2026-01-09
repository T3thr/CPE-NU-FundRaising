// =============================================================================
// Date & Time Utilities
// =============================================================================

/**
 * Format date to Thai locale string
 */
export function formatThaiDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", options);
}

/**
 * Format date to short Thai format (e.g., "8 ม.ค. 69")
 */
export function formatThaiDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "2-digit",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date and time to Thai locale
 */
export function formatThaiDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 นาทีที่แล้ว")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} สัปดาห์ที่แล้ว`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} เดือนที่แล้ว`;
  return `${Math.floor(diffDay / 365)} ปีที่แล้ว`;
}

/**
 * Get start and end dates of a month
 */
export function getMonthRange(
  month: number,
  year: number
): { start: Date; end: Date } {
  const fullYear = year > 100 ? year : 2500 + year - 543; // Convert to CE
  const start = new Date(fullYear, month - 1, 1);
  const end = new Date(fullYear, month, 0); // Last day of month
  return { start, end };
}

/**
 * Check if date is within a range
 */
export function isDateInRange(
  date: Date,
  start: Date,
  end: Date
): boolean {
  return date >= start && date <= end;
}

/**
 * Format ISO date string to YYYY-MM-DD
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parse date string safely
 */
export function parseDate(dateString: string): Date | null {
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
}
