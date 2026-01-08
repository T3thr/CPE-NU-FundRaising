🚀 CPE Multi-Cohort Fundraising System - Solution Blueprint
เป้าหมาย: สร้างระบบเก็บเงินกองกลางสำเร็จรูปที่เป็นมาตรฐานสากล, โปร่งใส, ประหยัดต้นทุน, และส่งต่อรุ่นน้องได้ง่าย

📋 สรุปผลการวิเคราะห์ปัญหาเดิม
❌ Pain Points ของระบบ Stripe + Custom Dashboard เดิม
ปัญหา	ผลกระทบ
ค่าธรรมเนียม Stripe ~2.9% + 30฿	ยอดเก็บ 70฿/เดือน สูญเสีย ~32฿/transaction
Custom code maintenance	ต้อง coding ทุกปี, ส่งต่อยาก
Single-cohort design	ไม่รองรับหลายรุ่นพร้อมกัน
No admin self-service	ต้องมี dev คอยดูแล
✅ สิ่งที่มีอยู่แล้วและใช้ได้
EasySlip API - ฟรี 50 slip/สัปดาห์ (~200/เดือน เพียงพอสำหรับ 70 คน)
Refine Framework - Admin panel สำเร็จรูป มี CRUD, Auth
Supabase - Free tier รองรับ 500MB, 50,000 rows
Google Sheets - ใช้เป็น backup/export ได้
🎯 Proposed Solution: "CPE Funds Hub" - Multi-Tenant Fundraising Platform
🏗️ Architecture Overview
Notification
Verification
Backend - Supabase
Frontend - Next.js + Refine
Submit Slip
Manage Payments
Manage All Cohorts
Verify Slip
Notify
Isolate Data
Public Payment Page
Admin Dashboard
Super Admin Panel
PostgreSQL
Row Level Security
Auth
Realtime
EasySlip API
Line Notify Free
💰 Cost Analysis (Zero-Cost Solution)
Service	Free Tier Limit	Usage Estimate	Status
Supabase	500MB DB, 2GB storage	~50MB/year	✅ เหลือมาก
Vercel	100GB bandwidth	~5GB/year	✅ เหลือมาก
EasySlip	50 slip/week	~15 slip/week	✅ พอ
Line Notify	Unlimited	-	✅ ฟรีถาวร
Google Sheets	10M cells	-	✅ Backup
รวม	-	-	฿0/เดือน
📊 Database Schema Design
1. organizations (สำหรับหลายสาขา/คณะ)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'CPE มหาวิทยาลัยนเรศวร'
  slug TEXT UNIQUE NOT NULL, -- 'cpe-nu'
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
2. cohorts (รุ่น/ชั้นปี)
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL, -- 'รุ่นที่ 30'
  academic_year INT NOT NULL, -- 2568
  monthly_fee INT DEFAULT 70,
  penalty_fee INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
3. members (สมาชิก)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id),
  student_id TEXT NOT NULL, -- รหัสนิสิต
  full_name TEXT NOT NULL,
  nickname TEXT,
  email TEXT,
  line_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, student_id)
);
4. payments (บันทึกการชำระ)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  cohort_id UUID REFERENCES cohorts(id),
  amount INT NOT NULL,
  payment_month INT NOT NULL, -- 1-12
  payment_year INT NOT NULL, -- 68, 69
  slip_url TEXT,
  slip_trans_ref TEXT, -- จาก EasySlip
  slip_verified BOOLEAN DEFAULT false,
  slip_verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, verified, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);
5. admins (ผู้ดูแลระบบแต่ละรุ่น)
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  cohort_id UUID REFERENCES cohorts(id),
  role TEXT DEFAULT 'treasurer', -- treasurer, president, super_admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cohort_id)
);
Row Level Security (RLS) Policies
-- สมาชิกดูได้เฉพาะข้อมูลรุ่นตัวเอง
CREATE POLICY "Members can view own cohort"
  ON members FOR SELECT
  USING (cohort_id IN (
    SELECT cohort_id FROM admins WHERE user_id = auth.uid()
  ));
-- Admin ดูแลได้เฉพาะรุ่นที่รับผิดชอบ
CREATE POLICY "Admins manage own cohort"
  ON payments FOR ALL
  USING (cohort_id IN (
    SELECT cohort_id FROM admins WHERE user_id = auth.uid()
  ));
🖥️ Features & Pages
A. หน้าสาธารณะ (Public)
1. /pay/[cohort-slug] - หน้าแจ้งชำระเงิน
แสดงข้อมูลบัญชีปลายทาง (QR Code)
เลือกสมาชิกจาก dropdown (รหัสนิสิต + ชื่อ)
อัปโหลด slip
เลือกเดือนที่จ่าย (รองรับจ่ายหลายเดือน)
Auto-verify ด้วย EasySlip (ถ้าเปิดใช้งาน)
2. /status/[student-id] - เช็คสถานะการชำระ
แสดงตารางสถานะรายเดือน (เหมือน Google Sheets เดิม)
สีเขียว = จ่ายแล้ว, สีแดง = ค้างชำระ
แสดงยอดค้าง + ดอกเบี้ย
ดาวน์โหลด PDF ใบเสร็จได้
B. Admin Dashboard (/admin)
3. Dashboard Overview
กราฟสรุปยอดเก็บรายเดือน
จำนวนสมาชิกที่จ่าย vs ค้างชำระ
รายการรอตรวจสอบ slip
4. Members Management
CRUD สมาชิก
Import จาก CSV/Excel
Export เป็น Google Sheets
5. Payments Management
ตารางการชำระแบบ Grid (เหมือน Sheets เดิม)
Verify/Reject slip
Manual add payment
Bulk actions
6. Reports & Analytics
รายงานรายรับ-รายจ่าย
Export PDF/Excel
แชร์ link รายงานสาธารณะ
C. Super Admin (/super-admin)
7. Organizations Management
สร้าง/จัดการหลายสาขา
8. Cohorts Management
สร้างรุ่นใหม่ (ปีละครั้ง)
คัดลอกโครงสร้างจากรุ่นก่อน
กำหนด admin แต่ละรุ่น
🔄 Workflow Automation
1. Auto Slip Verification Flow
Line Notify
EasySlip API
System
User
Line Notify
EasySlip API
System
User
alt
[Verified]
[Failed]
Upload Slip
Verify Slip (transRef, amount)
Success + Transaction Data
Update payment.status = 'verified'
Notify Admin (success)
Not Found
Update payment.status = 'pending'
Notify Admin (manual verify needed)
2. Monthly Cron Job (Supabase Edge Function)
// ทุกวันที่ 1 ของเดือน เวลา 00:01
// - คำนวณยอดค้างชำระอัตโนมัติ
// - ส่ง Line Notify แจ้งเตือนสมาชิกที่ค้างชำระ
// - Update dashboard statistics
📁 Proposed File Structure
src/
├── app/
│   ├── (public)/
│   │   ├── pay/[cohort]/page.tsx          # หน้าจ่ายเงิน
│   │   ├── status/[student-id]/page.tsx   # เช็คสถานะ
│   │   └── report/[cohort]/page.tsx       # รายงานสาธารณะ
│   │
│   ├── (admin)/
│   │   ├── dashboard/page.tsx             # ภาพรวม
│   │   ├── members/
│   │   │   ├── page.tsx                   # รายชื่อ
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── payments/
│   │   │   ├── page.tsx                   # ตารางการชำระ
│   │   │   └── verify/page.tsx            # ตรวจสอบ slip
│   │   └── reports/page.tsx
│   │
│   ├── (super-admin)/
│   │   ├── organizations/page.tsx
│   │   ├── cohorts/page.tsx
│   │   └── admins/page.tsx
│   │
│   └── api/
│       ├── easyslip/verify/route.ts       # Verify slip API
│       ├── line-notify/route.ts           # Send notifications
│       └── cron/monthly/route.ts          # Monthly jobs
│
├── components/
│   ├── payments/
│   │   ├── PaymentGrid.tsx                # ตาราง Grid แบบ Sheets
│   │   ├── SlipUploader.tsx
│   │   └── StatusBadge.tsx
│   ├── reports/
│   │   └── FinancialChart.tsx
│   └── ui/
│
├── providers/
│   ├── auth-provider/
│   ├── data-provider/
│   └── notification-provider/
│
└── utils/
    ├── supabase/
    ├── easyslip/
    │   └── client.ts                      # EasySlip API wrapper
    └── calculations/
        └── debt.ts                        # คำนวณหนี้สิน
🔧 Implementation Phases
Phase 1: Foundation (Week 1-2)
 Setup Supabase project + tables + RLS
 Configure Refine resources
 Basic authentication flow
Phase 2: Core Features (Week 3-4)
 Members CRUD
 Payments grid with status display
 Slip upload + manual verification
Phase 3: Automation (Week 5-6)
 EasySlip integration
 Line Notify integration
 Monthly cron job
Phase 4: Polish (Week 7-8)
 Public pages (pay, status, report)
 Export/Import features
 Mobile responsive optimization
🛡️ Security & Transparency Features
1. Immutable Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  table_name TEXT,
  record_id UUID,
  action TEXT, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  performed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
2. Public Transparency Dashboard
ยอดรวมที่เก็บได้ (realtime)
รายจ่ายที่ได้รับอนุมัติ
สมาชิกดูได้ตลอดเวลา (read-only)
3. Receipt Generation
PDF ใบเสร็จอัตโนมัติ
QR Code ยืนยันตัวตน
📱 Migration Strategy จากระบบเดิม
Step 1: Export ข้อมูลจาก Google Sheets
// Google Apps Script to export to JSON
function exportToJSON() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  // Convert to JSON and upload to Supabase
}
Step 2: Import เข้า Supabase
CSV import ผ่าน Supabase Dashboard
หรือ script migration ทีเดียว
Step 3: Parallel Run
รันระบบเดิมกับใหม่คู่กัน 1 เดือน
ตรวจสอบความถูกต้อง
ปิดระบบเดิมเมื่อมั่นใจ
✅ Benefits Summary
Criteria	Old System	New System
ต้นทุน	Stripe fees + hosting	ฟรี 100%
Scalability	เฉพาะรุ่นเดียว	รองรับหลายรุ่น/สาขา
Maintenance	ต้อง coding	Admin UI สำเร็จรูป
Transparency	จำกัด	Public dashboard
Handover	ส่งต่อยาก	สร้างรุ่นใหม่ได้เอง
Verification	Manual	Auto (EasySlip)
🚀 Quick Start for Next Admin
เมื่อขึ้นปีการศึกษาใหม่:

Login เข้า Super Admin
สร้าง Cohort ใหม่ (เช่น "รุ่นที่ 31")
Import รายชื่อ จาก CSV ของมหาวิทยาลัย
มอบหมาย Admin (เหรัญญิก + ประธาน)
เปิดให้ใช้งาน - ระบบพร้อมใช้ทันที!
💡 ไม่ต้อง coding ใดๆ - ทุกอย่างจัดการผ่าน UI

⚠️ User Review Required
IMPORTANT

ต้องการ feedback จากคุณ:

ต้องการรองรับหลายสาขา/คณะ หรือเฉพาะ CPE อย่างเดียว?
ต้องการ Line Notify หรือ Email แจ้งเตือน หรือทั้งสอง?
มี API Key ของ EasySlip แล้วหรือยัง? (ต้องขอจาก slip.rdcw.co.th)
ต้องการ feature อื่นเพิ่มเติมไหม?
📝 Verification Plan
Automated Tests
ยังไม่มี test framework ในโปรเจกต์ปัจจุบัน จะเพิ่ม:

Unit tests สำหรับ calculation functions (debt, penalty)
Integration tests สำหรับ Supabase operations
Manual Verification
สร้าง test cohort และทดสอบ flow ทั้งหมด
อัปโหลด slip จริง ทดสอบ EasySlip verification
เช็คสถานะ ว่าแสดงผลถูกต้อง
ทดสอบ mobile responsive design
🔗 References
EasySlip API Docs
Supabase Row Level Security
Refine Documentation
Line Notify API
พร้อมที่จะเริ่ม implement ไหมครับ? โปรดตรวจสอบแผนและตอบคำถามด้านบน