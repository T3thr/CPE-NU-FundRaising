// =============================================================================
// Validation Utilities
// Based on: src/docs/SYSTEM-Validation&BusinessRules.md
// =============================================================================

// =============================================================================
// Constants
// =============================================================================
const CPE_MAJOR_CODE = "36"; // รหัสสาขาวิศวกรรมคอมพิวเตอร์
const CPE_BASE_YEAR = 36;    // ปีฐานสำหรับคำนวณรุ่น (CPE1 = พ.ศ. 2537)

/**
 * Validate Thai student ID format (8 digits, major code 36 for CPE)
 * Format: YYMMXXXX where YY=year, MM=major(36), XXXX=running number
 */
export function isValidStudentId(studentId: string): boolean {
  return /^\d{8}$/.test(studentId.trim());
}

/**
 * Validate CPE student ID (must have major code 36)
 */
export function isValidCPEStudentId(studentId: string): boolean {
  if (!isValidStudentId(studentId)) return false;
  const majorCode = studentId.substring(2, 4);
  return majorCode === CPE_MAJOR_CODE;
}

/**
 * Extract CPE Generation from student ID
 * Formula: (2-digit year) - 36 = CPE Generation
 * Example: 66360001 → 66 - 36 = CPE30
 */
export function getCPEGeneration(studentId: string): number | null {
  if (!isValidStudentId(studentId)) return null;
  const yearCode = parseInt(studentId.substring(0, 2), 10);
  return yearCode - CPE_BASE_YEAR;
}

/**
 * Get formatted CPE Generation string
 * Example: "CPE30", "CPE31"
 */
export function getCPEGenerationText(studentId: string): string {
  const gen = getCPEGeneration(studentId);
  return gen !== null ? `CPE${gen}` : "ไม่ทราบรุ่น";
}

/**
 * Get NU Generation from student ID
 * Example: 66360001 → "NU66"
 */
export function getNUGeneration(studentId: string): string {
  if (!isValidStudentId(studentId)) return "ไม่ทราบรุ่น";
  const yearCode = studentId.substring(0, 2);
  return `NU${yearCode}`;
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
  if (year >= 60 && year <= 99) return true;
  if (year >= 2560 && year <= 2599) return true;
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

// =============================================================================
// Smart Import: Parse Paste Data (TSV from Excel/Sheets)
// =============================================================================

export interface ParsedMember {
  studentId: string;
  title?: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  email?: string;
  phone?: string;
  lineId?: string;
  isValid: boolean;
  errors: string[];
}

/**
 * Parse pasted TSV data (Tab-Separated Values from Excel/Sheets)
 * Supports flexible column order with smart detection
 * 
 * SMART NICKNAME DETECTION:
 * - Separate column for nickname (e.g., "นาย ธีรภัทร ภู่ระย้า\tเซ็นเตอร์\t66362416")
 * - Nickname after full name in same cell (e.g., "นายธีรภัทร ภู่ระย้า เซ็นเตอร์")
 */
export function parsePasteData(text: string): ParsedMember[] {
  const lines = text.trim().split("\n");
  const results: ParsedMember[] = [];

  // Common Thai nicknames pattern (single Thai word, usually 2-5 chars)
  const isLikelyNickname = (str: string): boolean => {
    const cleaned = str.trim();
    // Thai nickname: single word, 1-8 Thai characters, no spaces
    // Not a title (นาย, นางสาว, etc.), not a number
    if (!cleaned) return false;
    if (/^\d+$/.test(cleaned)) return false;
    if (/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)/.test(cleaned)) return false;
    // Single word, Thai characters, reasonable length
    if (/^[\u0E00-\u0E7F]{1,10}$/.test(cleaned)) return true;
    // English nickname
    if (/^[A-Za-z]{2,15}$/.test(cleaned)) return true;
    return false;
  };

  for (const line of lines) {
    const cols = line.split("\t").map((c) => c.trim());
    if (cols.length < 2) continue; // Skip invalid lines

    // Try to detect student ID (8 digits)
    let studentId = "";
    let firstName = "";
    let lastName = "";
    let title = "";
    let nickname = "";
    const errors: string[] = [];

    // First pass: collect all data
    const parsedCols: { type: "studentId" | "name" | "nickname" | "unknown"; value: string }[] = [];

    for (const col of cols) {
      // Detect student ID (8 digits)
      if (/^\d{8}$/.test(col)) {
        parsedCols.push({ type: "studentId", value: col });
        continue;
      }
      // Detect Thai title with name
      if (/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)/.test(col)) {
        parsedCols.push({ type: "name", value: col });
        continue;
      }
      // Likely a nickname (single Thai word)
      if (isLikelyNickname(col)) {
        parsedCols.push({ type: "nickname", value: col });
        continue;
      }
      // Multi-word could be a name
      if (col.includes(" ") && !studentId) {
        parsedCols.push({ type: "name", value: col });
        continue;
      }
      // Unknown
      if (col) {
        parsedCols.push({ type: "unknown", value: col });
      }
    }

    // Second pass: assign values
    for (const parsed of parsedCols) {
      if (parsed.type === "studentId" && !studentId) {
        studentId = parsed.value;
        continue;
      }
      if (parsed.type === "name" && !firstName) {
        const fullName = parsed.value;
        // Parse title and name
        const titleMatch = fullName.match(/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)\s*(.+)$/);
        if (titleMatch) {
          title = titleMatch[1];
          const namePart = titleMatch[2].trim();
          // Check if nickname is embedded (e.g., "ธีรภัทร ภู่ระย้า เซ็นเตอร์")
          const nameWords = namePart.split(/\s+/);
          if (nameWords.length >= 3 && isLikelyNickname(nameWords[nameWords.length - 1])) {
            // Last word is likely a nickname
            firstName = nameWords[0];
            lastName = nameWords.slice(1, -1).join(" ");
            nickname = nameWords[nameWords.length - 1];
          } else if (nameWords.length >= 2) {
            firstName = nameWords[0];
            lastName = nameWords.slice(1).join(" ");
          } else {
            firstName = namePart;
          }
        } else {
          // No title, parse name directly
          const nameWords = fullName.split(/\s+/);
          if (nameWords.length >= 3 && isLikelyNickname(nameWords[nameWords.length - 1])) {
            firstName = nameWords[0];
            lastName = nameWords.slice(1, -1).join(" ");
            nickname = nameWords[nameWords.length - 1];
          } else if (nameWords.length >= 2) {
            firstName = nameWords[0];
            lastName = nameWords.slice(1).join(" ");
          } else {
            firstName = fullName;
          }
        }
        continue;
      }
      if (parsed.type === "nickname" && !nickname) {
        nickname = parsed.value;
        continue;
      }
    }

    // Validate
    if (!studentId) errors.push("ไม่พบรหัสนิสิต");
    else if (!isValidStudentId(studentId)) errors.push("รหัสนิสิตไม่ถูกต้อง");
    if (!firstName) errors.push("ไม่พบชื่อ");

    results.push({
      studentId,
      title,
      firstName,
      lastName,
      nickname: nickname || undefined,
      isValid: errors.length === 0,
      errors,
    });
  }

  return results;
}

/**
 * Validate member data for creation/update (updated for new schema)
 */
export function validateMemberData(data: {
  studentId?: string;
  firstName?: string;
  lastName?: string;
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

  if (data.firstName !== undefined) {
    if (!data.firstName.trim()) {
      errors.push("กรุณากรอกชื่อ");
    }
  }

  if (data.lastName !== undefined) {
    if (!data.lastName.trim()) {
      errors.push("กรุณากรอกนามสกุล");
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

