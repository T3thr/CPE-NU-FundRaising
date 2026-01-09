// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Validate Thai student ID format (8 digits)
 */
export function isValidStudentId(studentId: string): boolean {
  return /^\d{8}$/.test(studentId.trim());
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate Thai phone number (10 digits starting with 0)
 */
export function isValidThaiPhone(phone: string): boolean {
  const cleaned = phone.replace(/[-\s]/g, "");
  return /^0\d{9}$/.test(cleaned);
}

/**
 * Validate Line ID format
 */
export function isValidLineId(lineId: string): boolean {
  // Line ID: 4-20 characters, alphanumeric and some special chars
  return /^[a-zA-Z0-9._-]{4,20}$/.test(lineId.trim());
}

/**
 * Validate file type for slip upload
 */
export function isValidSlipFileType(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (max 5MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Validate payment amount
 */
export function isValidPaymentAmount(
  amount: number,
  minAmount: number = 1,
  maxAmount: number = 100000
): boolean {
  return amount >= minAmount && amount <= maxAmount && Number.isInteger(amount);
}

/**
 * Validate month number (1-12)
 */
export function isValidMonth(month: number): boolean {
  return month >= 1 && month <= 12 && Number.isInteger(month);
}

/**
 * Validate year format (2-digit or 4-digit Thai Buddhist era)
 */
export function isValidAcademicYear(year: number): boolean {
  if (year >= 60 && year <= 99) return true; // 2-digit BE (60-99)
  if (year >= 2560 && year <= 2599) return true; // 4-digit BE
  return false;
}

/**
 * Sanitize string input (remove XSS-prone characters)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number {
  const num = typeof input === "string" ? parseFloat(input) : input;
  return isNaN(num) ? 0 : num;
}

/**
 * Validate and clean student ID
 */
export function cleanStudentId(studentId: string): string {
  return studentId.replace(/\D/g, "").slice(0, 8);
}

/**
 * Validate slug format (URL-friendly)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate member data for creation/update
 */
export function validateMemberData(data: {
  studentId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  lineId?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (data.studentId !== undefined) {
    if (!data.studentId.trim()) {
      errors.push("กรุณากรอกรหัสนิสิต");
    } else if (!isValidStudentId(data.studentId)) {
      errors.push("รหัสนิสิตต้องเป็นตัวเลข 8 หลัก");
    }
  }

  if (data.fullName !== undefined) {
    if (!data.fullName.trim()) {
      errors.push("กรุณากรอกชื่อ-นามสกุล");
    } else if (data.fullName.length < 3) {
      errors.push("ชื่อ-นามสกุลต้องมีอย่างน้อย 3 ตัวอักษร");
    }
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("รูปแบบอีเมลไม่ถูกต้อง");
  }

  if (data.phone && !isValidThaiPhone(data.phone)) {
    errors.push("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0");
  }

  if (data.lineId && !isValidLineId(data.lineId)) {
    errors.push("Line ID ไม่ถูกต้อง (4-20 ตัวอักษร)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate payment submission data
 */
export function validatePaymentData(data: {
  memberId?: string;
  amount?: number;
  months?: number[];
}): ValidationResult {
  const errors: string[] = [];

  if (!data.memberId) {
    errors.push("กรุณาเลือกสมาชิก");
  }

  if (data.amount !== undefined) {
    if (!isValidPaymentAmount(data.amount)) {
      errors.push("จำนวนเงินไม่ถูกต้อง");
    }
  }

  if (data.months) {
    if (data.months.length === 0) {
      errors.push("กรุณาเลือกเดือนที่ต้องการชำระ");
    }
    for (const month of data.months) {
      if (!isValidMonth(month)) {
        errors.push(`เดือนที่ ${month} ไม่ถูกต้อง`);
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
