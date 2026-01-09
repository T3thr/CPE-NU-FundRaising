# 📖 คู่มือเปลี่ยน Mock Data เป็น Real Data

**Project:** ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์ (CPE Funds Hub)  
**อ้างอิง:** [imprementation_plan.md](./imprementation_plan.md), [OLD-SYSTEM-Background&Basicflow.md](./OLD-SYSTEM-Background&Basicflow.md)  
**Last Updated:** 2026-01-08

---

## 📋 สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Phase 1: Supabase Setup](#2-phase-1-supabase-setup)
3. [Phase 2: Database Migration](#3-phase-2-database-migration)
4. [Phase 3: External Services](#4-phase-3-external-services)
5. [Phase 4: Data Import](#5-phase-4-data-import)
6. [Code Integration](#6-code-integration)
7. [Cron Jobs Setup](#7-cron-jobs-setup)
8. [Checklist](#8-checklist)

---

## 1. ภาพรวม

### 1.1 สถานะ Mock Data ปัจจุบัน

ระบบใช้ Mock Data ใน Development เพื่อให้ทำงานได้โดยไม่ต้องเชื่อมต่อ Database จริง

| Component       | Mock Location             | Real Data Source              |
| --------------- | ------------------------- | ----------------------------- |
| Dashboard Stats | `DashboardContent.tsx`    | Supabase Query                |
| Members List    | `MembersListContent.tsx`  | Supabase `members`            |
| Payments        | `PaymentsListContent.tsx` | Supabase `payments`           |
| Verify Slips    | `VerifySlipsContent.tsx`  | Supabase `payments` (pending) |
| Payment Status  | `StatusPageContent.tsx`   | Server Action                 |

### 1.2 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CPE Funds Hub                        │
├─────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15 + Refine)                        │
│  ├── Public Pages (/, /pay, /status)                   │
│  └── Admin Pages (/admin/*)                            │
├─────────────────────────────────────────────────────────┤
│  Server Actions (src/actions/*.ts)                     │
│  ├── CRUD Operations                                   │
│  └── Business Logic                                    │
├─────────────────────────────────────────────────────────┤
│  Supabase (Backend)                                    │
│  ├── PostgreSQL Database                               │
│  ├── Row Level Security (RLS)                          │
│  ├── Authentication                                    │
│  └── Storage (Slips)                                   │
├─────────────────────────────────────────────────────────┤
│  External Services                                     │
│  ├── EasySlip API (Slip Verification)                  │
│  ├── Line Messaging API (Notifications)                │
│  └── Vercel Cron (Scheduled Tasks)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Supabase Setup

### 2.1 สร้าง Supabase Project

1. ไปที่ [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. คลิก **New Project**
3. ตั้งค่า:
   - **Organization:** สร้างใหม่หรือใช้ที่มี
   - **Name:** `cpe-funds-hub`
   - **Database Password:** (จดไว้!)
   - **Region:** Singapore (ใกล้ไทยที่สุด)
4. รอ 2-3 นาทีให้สร้างเสร็จ

### 2.2 ดึง Credentials

ไปที่ **Settings > API**:

```env
# .env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

> ⚠️ **สำคัญ:** `SUPABASE_SERVICE_ROLE_KEY` ห้าม expose ไป client!

### 2.3 สร้าง Storage Bucket

1. ไปที่ **Storage**
2. คลิก **New Bucket**
3. ตั้งค่า:
   - **Name:** `slips`
   - **Public:** ✅ (เพื่อแสดงรูป slip)
4. สร้าง Policy:

   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Allow upload for authenticated"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'slips');

   -- Allow public read
   CREATE POLICY "Allow public read"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'slips');
   ```

---

## 3. Phase 2: Database Migration

### 3.1 Run Schema SQL

ไปที่ **SQL Editor** และรัน:

```sql
-- =================================================================
-- 1. Organizations (สาขา/คณะ)
-- =================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  bank_name TEXT,
  bank_account_no TEXT,
  bank_account_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 2. Cohorts (รุ่น)
-- =================================================================
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year INT NOT NULL,
  monthly_fee INT DEFAULT 70,
  penalty_fee INT DEFAULT 10,
  start_month INT DEFAULT 7,
  end_month INT DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 3. Members (สมาชิก)
-- =================================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id VARCHAR(8) NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  email TEXT,
  phone VARCHAR(10),
  line_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, student_id)
);

-- Create index for fast student lookup
CREATE INDEX idx_members_student_id ON members(student_id);

-- =================================================================
-- 4. Payments (การชำระเงิน)
-- =================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  payment_month INT NOT NULL CHECK (payment_month BETWEEN 1 AND 12),
  payment_year INT NOT NULL,
  slip_url TEXT,
  slip_trans_ref TEXT,
  slip_verified BOOLEAN DEFAULT false,
  slip_verified_at TIMESTAMPTZ,
  verified_by TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for payment queries
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_member ON payments(member_id);

-- =================================================================
-- 5. Admins (ผู้ดูแล)
-- =================================================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'treasurer' CHECK (role IN ('treasurer', 'president', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cohort_id)
);

-- =================================================================
-- 6. Settings (ค่าคงที่ระบบ)
-- =================================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, key)
);
```

### 3.2 Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public read for organizations
CREATE POLICY "Public read organizations"
ON organizations FOR SELECT TO public
USING (true);

-- Cohort admins can manage their cohort
CREATE POLICY "Admin manage cohort"
ON cohorts FOR ALL
TO authenticated
USING (
  id IN (SELECT cohort_id FROM admins WHERE user_id = auth.uid())
);

-- Member access policies
CREATE POLICY "Admin manage members"
ON members FOR ALL
TO authenticated
USING (
  cohort_id IN (SELECT cohort_id FROM admins WHERE user_id = auth.uid())
);

-- Payment access policies
CREATE POLICY "Admin manage payments"
ON payments FOR ALL
TO authenticated
USING (
  cohort_id IN (SELECT cohort_id FROM admins WHERE user_id = auth.uid())
);

-- Public can insert payments (for pay page)
CREATE POLICY "Public insert payments"
ON payments FOR INSERT
TO public
WITH CHECK (true);
```

---

## 4. Phase 3: External Services

### 4.1 EasySlip API

1. สมัครที่ [https://developer.easyslip.com](https://developer.easyslip.com)
2. สร้าง API Key
3. เพิ่มใน `.env`:
   ```env
   EASYSLIP_API_KEY=your_api_key
   ```

**ข้อจำกัด Free Tier:**

- 50 requests / สัปดาห์
- พอสำหรับ ~70 สมาชิก

### 4.2 Line Messaging API (2026 Standard)

> ⚠️ **สำคัญ:** Line Notify หยุดให้บริการ มี.ค. 2025 ใช้ Line Messaging API แทน

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง **Provider** (ถ้ายังไม่มี)
3. สร้าง **Messaging API Channel**:
   - **Channel name:** CPE Funds Hub
   - **Channel description:** ระบบแจ้งเตือนการชำระเงิน
4. ดึง Credentials จาก **Messaging API** tab:
   ```env
   LINE_CHANNEL_ACCESS_TOKEN=xxxxx
   LINE_CHANNEL_SECRET=xxxxx
   ```
5. เพิ่ม Bot เข้ากลุ่ม Admin:
   - Scan QR Code หรือ
   - ค้นหาด้วย LINE ID
6. รับ Group ID (จาก Webhook เมื่อ Bot เข้ากลุ่ม):
   ```env
   LINE_GROUP_ID=Cxxxxxxxxx
   ```

### 4.3 Vercel Cron

ตั้งค่าใน `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/daily",
      "schedule": "0 13 * * *"
    }
  ]
}
```

**หมายเหตุ:** Vercel Cron สำหรับ Hobby plan จำกัด 2 cron jobs

---

## 5. Phase 4: Data Import

### 5.1 สร้าง Organization แรก

```sql
INSERT INTO organizations (name, slug, bank_name, bank_account_no, bank_account_name)
VALUES (
  'ภาควิชาวิศวกรรมคอมพิวเตอร์',
  'cpe-nu',
  'KASIKORNBANK',
  '1931905372',
  'Theerapat Pooraya'
);
```

### 5.2 สร้าง Cohort (รุ่น)

```sql
INSERT INTO cohorts (organization_id, name, academic_year, monthly_fee, penalty_fee, start_month, end_month)
VALUES (
  (SELECT id FROM organizations WHERE slug = 'cpe-nu'),
  'CPE32 (2568)',
  68,
  70,
  10,
  7,  -- กรกฎาคม
  3   -- มีนาคม
);
```

### 5.3 Import สมาชิกจาก CSV

**Format CSV:**

```csv
student_id,full_name,nickname,email,phone,line_id
68360001,นายสมชาย ใจดี,ชาย,somchai@email.com,0812345678,somchai_line
68360002,นางสาวสมหญิง รักเรียน,หญิง,somying@email.com,0823456789,somying_line
```

**Import ผ่าน SQL:**

```sql
-- Copy from CSV (run in Supabase Dashboard > SQL Editor)
-- OR use Supabase Table Editor > Import from CSV
INSERT INTO members (cohort_id, student_id, full_name, nickname)
VALUES
  ((SELECT id FROM cohorts WHERE academic_year = 68), '68360001', 'นายสมชาย ใจดี', 'ชาย'),
  ((SELECT id FROM cohorts WHERE academic_year = 68), '68360002', 'นางสาวสมหญิง รักเรียน', 'หญิง');
```

### 5.4 Import ประวัติจากระบบเก่า (Google Sheets)

ถ้ามีข้อมูลจากระบบเก่า (ตาม [OLD-SYSTEM-Background&Basicflow.md](./OLD-SYSTEM-Background&Basicflow.md)):

```sql
-- Import historical payments
INSERT INTO payments (member_id, cohort_id, amount, payment_month, payment_year, status)
SELECT
  m.id,
  c.id,
  70,
  old.payment_month,
  68,
  'verified'
FROM old_payments_csv old
JOIN cohorts c ON c.academic_year = 68
JOIN members m ON m.student_id = old.student_id AND m.cohort_id = c.id;
```

---

## 6. Code Integration

### 6.1 เปลี่ยน Mock → Server Actions

**ก่อน (Mock):**

```typescript
// DashboardContent.tsx
const dashboardStats = {
  totalMembers: 68,
  activeMembersThisMonth: 45,
  // ... hardcoded values
};
```

**หลัง (Real):**

```typescript
// DashboardContent.tsx
import { getDashboardStats } from "@/actions/dashboard.actions";

export default async function DashboardContent({ cohortId }: Props) {
  const stats = await getDashboardStats(cohortId);
  // ... use real data
}
```

### 6.2 สร้าง Dashboard Action

```typescript
// src/actions/dashboard.actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function getDashboardStats(cohortId: string) {
  const supabase = await createClient();

  // Get total members
  const { count: totalMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId)
    .eq("is_active", true);

  // Get current month stats
  const currentMonth = new Date().getMonth() + 1;
  const { count: paidThisMonth } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId)
    .eq("payment_month", currentMonth)
    .eq("status", "verified");

  // Get pending verification
  const { count: pendingCount } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("cohort_id", cohortId)
    .eq("status", "pending");

  return {
    totalMembers: totalMembers || 0,
    paidThisMonth: paidThisMonth || 0,
    pendingVerification: pendingCount || 0,
    unpaidMembers: (totalMembers || 0) - (paidThisMonth || 0),
  };
}
```

### 6.3 ใช้ Refine Data Provider

```typescript
// ใช้ Refine hooks สำหรับ CRUD
import { useList, useCreate, useUpdate } from "@refinedev/core";

function MembersList() {
  const { data, isLoading } = useList({
    resource: "members",
    filters: [
      { field: "cohort_id", operator: "eq", value: cohortId },
      { field: "is_active", operator: "eq", value: true },
    ],
    sorters: [{ field: "student_id", order: "asc" }],
  });

  if (isLoading) return <Skeleton />;
  return <DataTable data={data?.data} />;
}
```

---

## 7. Cron Jobs Setup

### 7.1 Monthly Reminder

```typescript
// src/app/api/cron/monthly/route.ts
import { notifyMonthlyReminder } from "@/actions/line-messaging.actions";

export async function POST(request: NextRequest) {
  // Verify CRON_SECRET
  // Fetch unpaid members
  // Send Line notifications
}
```

### 7.2 Daily Summary

```typescript
// src/app/api/cron/daily/route.ts
import { notifyDailySummary } from "@/actions/line-messaging.actions";

export async function POST(request: NextRequest) {
  // Verify CRON_SECRET
  // Fetch today's payments
  // Send summary via Line
}
```

### 7.3 Environment Variable

```env
# Generate: openssl rand -hex 32
CRON_SECRET=your_32_char_hex_secret
```

---

## 8. Checklist

### ✅ Supabase Setup

- [ ] สร้าง Supabase Project
- [ ] รัน Schema SQL
- [ ] ตั้งค่า RLS Policies
- [ ] สร้าง Storage Bucket "slips"
- [ ] ตั้งค่า Storage Policies
- [ ] คัดลอก Credentials ไป .env

### ✅ External Services

- [ ] สมัคร EasySlip API
- [ ] สร้าง Line Messaging API Channel
- [ ] เพิ่ม Bot เข้ากลุ่ม Admin
- [ ] ตั้งค่า vercel.json สำหรับ Cron

### ✅ Data Migration

- [ ] สร้าง Organization (CPE)
- [ ] สร้าง Cohort (รุ่นปัจจุบัน)
- [ ] Import รายชื่อสมาชิก
- [ ] Import ประวัติการชำระ (ถ้ามี)
- [ ] สร้าง Admin User

### ✅ Code Integration

- [ ] Dashboard → getDashboardStats()
- [ ] Members → getMembers() / Refine useList
- [ ] Payments → getPendingPayments()
- [ ] Verify → verifyPayment() / rejectPayment()
- [ ] Pay Page → submitPayment()
- [ ] Status Page → getMemberPaymentStatus()

### ✅ Testing

- [ ] ทดสอบ Login/Auth
- [ ] ทดสอบ CRUD Members
- [ ] ทดสอบ Payment Flow
- [ ] ทดสอบ EasySlip Verification
- [ ] ทดสอบ Line Messaging
- [ ] ทดสอบ Cron Jobs

---

## 🔐 Security Checklist

- [ ] ไม่ expose `SUPABASE_SERVICE_ROLE_KEY` ไป client
- [ ] RLS enabled ทุกตาราง
- [ ] CRON_SECRET ตั้งค่าและตรวจสอบ
- [ ] Input validation ทุก endpoint
- [ ] Rate limiting (ถ้าจำเป็น)

---

**เอกสารเกี่ยวข้อง:**

- [imprementation_plan.md](./imprementation_plan.md) - แผนพัฒนาภาพรวม
- [OLD-SYSTEM-Background&Basicflow.md](./OLD-SYSTEM-Background&Basicflow.md) - ระบบเดิม
- [SYSTEM-Validation&BusinessRules.md](./SYSTEM-Validation&BusinessRules.md) - กฎเกณฑ์ธุรกิจ
- [STANDARD-TailwindCSS.md](./STANDARD-TailwindCSS.md) - มาตรฐาน UI
