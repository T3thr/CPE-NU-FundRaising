// =============================================================================
// Application Configuration
// =============================================================================

export const appConfig = {
  // App Info
  name: "CPE Funds Hub",
  description: "ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์",
  version: "1.0.0",
  
  // URLs
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  
  // Default Bank Info (can be overridden by organization settings)
  defaultBank: {
    name: process.env.NEXT_PUBLIC_BANK_NAME || "KASIKORNTHAI",
    accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "",
  },
  
  // Payment Settings
  payment: {
    defaultMonthlyFee: 70 as number,
    defaultPenaltyFee: 10 as number,
    currency: "THB",
  },
  
  // Bank Info (alias for defaultBank for backward compatibility)
  get bank() {
    return this.defaultBank;
  },
  
  // Academic Year Settings
  academic: {
    // Academic year starts in June (month 6)
    startMonth: 6 as number,
    // Academic year ends in May (month 5) next calendar year
    endMonth: 5 as number,
    // Number of months in academic year
    monthsPerYear: 12 as number,
    // Current academic year (Thai Buddhist Era, 2-digit)
    get currentYear(): number {
      const now = new Date();
      const thaiYear = (now.getFullYear() + 543) % 100;
      // If before June, it's still previous academic year
      return now.getMonth() < 5 ? thaiYear - 1 : thaiYear;
    },
  },
  
  // Thai Month Names
  thaiMonths: [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ],
  
  // Short Thai Month Names
  thaiMonthsShort: [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ],
  
  // EasySlip Settings
  easyslip: {
    apiUrl: "https://developer.easyslip.com/api/v1",
    weeklyLimit: 50,
    enabled: !!process.env.EASYSLIP_API_KEY,
  },
  
  // Line Messaging API Settings (2026 Standard - replaces deprecated Line Notify)
  lineMessaging: {
    apiUrl: "https://api.line.me/v2/bot",
    enabled: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
  },
  
  // Feature Flags
  features: {
    autoSlipVerification: true,
    lineNotifications: true,
    googleSheetsSync: false,
    multiOrganization: false, // Enable for multi-faculty support
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    slipBucket: "slips",
  },
} as const;

// =============================================================================
// Theme Configuration
// =============================================================================

export const themeConfig = {
  // Brand Colors
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    success: {
      500: "#22c55e",
      600: "#16a34a",
    },
    warning: {
      500: "#f59e0b",
      600: "#d97706",
    },
    danger: {
      500: "#ef4444",
      600: "#dc2626",
    },
  },
  
  // Payment Status Colors
  paymentStatus: {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  
  // Payment Cell Colors (for grid view)
  paymentCell: {
    paid: "bg-green-500 text-white",
    unpaid: "bg-red-500 text-white",
    pending: "bg-yellow-500 text-white",
    notDue: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  },
} as const;

// =============================================================================
// Navigation Configuration
// =============================================================================

export const navigationConfig = {
  public: [
    { path: "/", label: "หน้าแรก", icon: "home" },
    { path: "/pay", label: "ชำระเงิน", icon: "credit-card" },
    { path: "/status", label: "เช็คสถานะ", icon: "search" },
  ],
  
  admin: [
    { path: "/admin", label: "ภาพรวม", icon: "dashboard" },
    { path: "/admin/members", label: "สมาชิก", icon: "users" },
    { path: "/admin/payments", label: "การชำระเงิน", icon: "credit-card" },
    { path: "/admin/verify", label: "ตรวจสอบ Slip", icon: "check-circle" },
    { path: "/admin/reports", label: "รายงาน", icon: "chart" },
    { path: "/admin/settings", label: "ตั้งค่า", icon: "settings" },
  ],
  
  superAdmin: [
    { path: "/super-admin", label: "ภาพรวม", icon: "dashboard" },
    { path: "/super-admin/organizations", label: "สาขา", icon: "building" },
    { path: "/super-admin/cohorts", label: "รุ่น", icon: "users" },
    { path: "/super-admin/admins", label: "ผู้ดูแล", icon: "shield" },
    { path: "/super-admin/logs", label: "Audit Logs", icon: "file-text" },
  ],
} as const;

export type AppConfig = typeof appConfig;
export type ThemeConfig = typeof themeConfig;
export type NavigationConfig = typeof navigationConfig;
