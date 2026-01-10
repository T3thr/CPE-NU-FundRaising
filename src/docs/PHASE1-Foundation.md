# 🏗️ Phase 1: Foundation - เอกสารสรุปการพัฒนา

**Project:** ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์ (CPE Funds Hub)  
**Phase:** 1 - Foundation (โครงสร้างพื้นฐาน)  
**Last Updated:** 2026-01-08

---

## 📋 ภาพรวม Phase 1

Phase 1 เน้นการวางรากฐานโครงสร้างของโปรเจค ประกอบด้วยการตั้งค่า Technology Stack, การออกแบบ Database Schema, การกำหนด Configuration, และการสร้าง Type Definitions ที่จะใช้ตลอดทั้งโปรเจค

---

## 🛠️ Technology Stack ที่ใช้

| เทคโนโลยี        | เวอร์ชัน            | วัตถุประสงค์                                     |
| ---------------- | ------------------- | ------------------------------------------------ |
| **Next.js**      | 15.5.9 (App Router) | Framework หลัก                                   |
| **React**        | 19.x                | UI Library                                       |
| **TypeScript**   | 5.x                 | Type Safety                                      |
| **Tailwind CSS** | 4.0                 | Styling (CSS-first config)                       |
| **Refine**       | 4.x                 | Admin Panel Framework                            |
| **Supabase**     | -                   | Backend as a Service (PostgreSQL, Auth, Storage) |

---

## 📁 ไฟล์ที่สร้าง/แก้ไขใน Phase 1

### 1. Configuration Files

#### `postcss.config.mjs`

```
src: postcss.config.mjs
```

- ตั้งค่า PostCSS สำหรับ Tailwind CSS v4
- ใช้ `@tailwindcss/postcss` แทน `tailwindcss` แบบเดิม

#### `src/config/app.config.ts`

```
src: src/config/app.config.ts
```

**รายละเอียด:**

- **App Info:** ชื่อ, คำอธิบาย, เวอร์ชัน
- **URLs:** baseUrl, apiUrl
- **Default Bank:** ข้อมูลธนาคารเริ่มต้น (จาก ENV)
- **Payment Settings:** ค่าธรรมเนียม 70 บาท, ค่าปรับ 10 บาท
- **Academic Settings:** เดือนเริ่มต้น/สิ้นสุด, ปีการศึกษาปัจจุบัน
- **Thai Month Names:** ชื่อเดือนภาษาไทย (เต็ม/ย่อ)
- **Feature Flags:** เปิด/ปิด features ต่างๆ
- **Pagination & Upload Settings**

#### `src/utils/supabase/constants.ts`

```
src: src/utils/supabase/constants.ts
```

- ค่าคงที่สำหรับ Supabase connection
- URLs และ Keys จาก environment variables

---

### 2. Database Schema & Types

#### `supabase/schema.sql`

```
src: supabase/schema.sql
```

**ตารางที่สร้าง:**

| ตาราง           | คำอธิบาย             |
| --------------- | -------------------- |
| `organizations` | สาขา/คณะ             |
| `cohorts`       | รุ่น/ชั้นปี          |
| `members`       | สมาชิก (นิสิต)       |
| `payments`      | บันทึกการชำระเงิน    |
| `admins`        | ผู้ดูแลระบบ          |
| `audit_logs`    | บันทึกการเปลี่ยนแปลง |

**Row Level Security (RLS):**

- ทุกตารางมี RLS policies
- แยกข้อมูลตาม organization/cohort
- Admin สามารถเข้าถึงเฉพาะ cohort ที่รับผิดชอบ

#### `src/types/database.ts`

```
src: src/types/database.ts
```

**TypeScript Interfaces:**

- `Organization` - ข้อมูลสาขา
- `Cohort` - ข้อมูลรุ่น
- `Member` - ข้อมูลสมาชิก
- `Payment` - ข้อมูลการชำระ
- `Admin` - ข้อมูลผู้ดูแล
- `AuditLog` - บันทึกการเปลี่ยนแปลง
- `MemberPaymentStatus` - สถานะการชำระรายบุคคล
- `CohortStats` - สถิติรุ่น
- `EasySlipResponse` - ผลตอบรับจาก EasySlip API
- `ApiResponse<T>` - รูปแบบ API response มาตรฐาน
- `PaginatedResponse<T>` - รูปแบบ pagination

---

### 3. Styling (Tailwind CSS v4)

#### `src/styles/global.css`

```
src: src/styles/global.css
```

**รายละเอียด:**

- **@theme directive:** กำหนด design tokens (colors, shadows, radius)
- **CSS Custom Properties:** สำหรับ dark/light mode
- **Base Styles:** HTML, body, typography, form elements
- **Component Styles:** cards, buttons, badges, tables, modals
- **Utility Classes:** animations, glass effects
- **Responsive Media Queries**

**Design Tokens ที่กำหนด:**

```css
@theme {
  --color-primary-*: /* Blue gradient */
  --color-success: #22c55e
  --color-warning: #f59e0b
  --color-danger: #ef4444
  --shadow-soft, --shadow-medium, --shadow-large
  --radius-sm, --radius-md, --radius-lg, --radius-xl
}
```

---

### 4. Server Actions (Backend Logic)

#### `src/actions/member.actions.ts`

```
src: src/actions/member.actions.ts
```

**Functions:**

- `getMembers()` - ดึงรายชื่อสมาชิก
- `getMemberById()` - ดึงข้อมูลสมาชิกตาม ID
- `createMember()` - สร้างสมาชิกใหม่
- `updateMember()` - แก้ไขข้อมูลสมาชิก
- `deleteMember()` - ลบสมาชิก
- `importMembersFromCSV()` - นำเข้าจาก CSV

#### `src/actions/payment.actions.ts`

```
src: src/actions/payment.actions.ts
```

**Functions:**

- `getPayments()` - ดึงรายการชำระ
- `getPaymentById()` - ดึงข้อมูลการชำระตาม ID
- `createPayment()` - สร้างรายการชำระใหม่
- `verifyPayment()` - ยืนยันการชำระ
- `rejectPayment()` - ปฏิเสธการชำระ

#### `src/actions/cohort.actions.ts`

```
src: src/actions/cohort.actions.ts
```

**Functions:**

- `getCohorts()` - ดึงรายชื่อรุ่น
- `getCohortById()` - ดึงข้อมูลรุ่นตาม ID
- `createCohort()` - สร้างรุ่นใหม่
- `updateCohort()` - แก้ไขข้อมูลรุ่น

#### `src/actions/organization.actions.ts`

```
src: src/actions/organization.actions.ts
```

**Functions:**

- `getOrganizations()` - ดึงรายชื่อสาขา
- `getOrganizationBySlug()` - ดึงข้อมูลสาขาตาม slug

---

### 5. Providers

#### `src/providers/theme-provider/index.tsx`

```
src: src/providers/theme-provider/index.tsx
```

- จัดการ dark/light mode
- ใช้ `next-themes` หรือ custom implementation
- Persist ค่าลง localStorage

#### `src/providers/notification-provider/index.tsx`

```
src: src/providers/notification-provider/index.tsx
```

- Toast notifications system
- สนับสนุน success, error, warning, info
- Auto-dismiss และ manual close

#### `src/providers/auth-provider/index.tsx`

```
src: src/providers/auth-provider/index.tsx
```

- Supabase Auth integration
- Session management
- Role-based access control

---

### 6. Environment Variables

#### `.env.example`

```
src: .env.example
```

**ตัวแปรที่กำหนด:**

```env
# App
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Banking
NEXT_PUBLIC_BANK_NAME="KASIKORNTHAI"
NEXT_PUBLIC_BANK_ACCOUNT_NO=""
NEXT_PUBLIC_BANK_ACCOUNT_NAME=""

# External Services
EASYSLIP_API_KEY=
LINE_NOTIFY_TOKEN=
CRON_SECRET=
```

---

## 🎯 ผลลัพธ์ Phase 1

| หมวด             | สถานะ       | หมายเหตุ                         |
| ---------------- | ----------- | -------------------------------- |
| Tech Stack Setup | ✅ Complete | Next.js 15 + Tailwind 4 + Refine |
| Database Schema  | ✅ Complete | 6 ตารางพร้อม RLS                 |
| TypeScript Types | ✅ Complete | ครอบคลุมทุกตาราง                 |
| Configuration    | ✅ Complete | Centralized config               |
| Server Actions   | ✅ Complete | CRUD operations                  |
| Providers        | ✅ Complete | Theme, Notification, Auth        |
| Styling          | ✅ Complete | Dark/Light mode ready            |

---

## 📌 Dependencies ที่เพิ่ม

```json
{
  "dependencies": {
    "@refinedev/core": "^4.x",
    "@refinedev/nextjs-router": "^6.x",
    "@refinedev/supabase": "^6.x",
    "@supabase/ssr": "^0.x",
    "next": "15.5.9",
    "react": "^19.x"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.x",
    "tailwindcss": "^4.x",
    "typescript": "^5.x"
  }
}
```

---

**ถัดไป:** [Phase 2: Core Features](./PHASE2-CoreFeatures.md)
