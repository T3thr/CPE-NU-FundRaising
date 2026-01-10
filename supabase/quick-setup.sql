-- =============================================================================
-- CPE Funds Hub - Quick Setup Script
-- =============================================================================
-- Run this AFTER schema.sql to set up initial data
-- Version: 1.0.0
-- Date: 2026-01-10
-- =============================================================================

-- =============================================================================
-- STEP 1: Create Organization (ภาควิชา)
-- =============================================================================
INSERT INTO organizations (
  id,
  name,
  slug,
  bank_name,
  bank_account_no,
  bank_account_name
) VALUES (
  'a0000000-0000-0000-0000-000000000001', -- Fixed ID for reference
  'ภาควิชาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร',
  'cpe-nu',
  'KASIKORNTHAI',
  '000-0-00000-0',  -- ⚠️ เปลี่ยนเป็นเลขบัญชีจริง
  'นาย ธีรพัฒน์ พ...' -- ⚠️ เปลี่ยนเป็นชื่อบัญชีจริง
) ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- STEP 2: Create Cohort (รุ่น CPE30)
-- =============================================================================
INSERT INTO cohorts (
  id,
  organization_id,
  name,
  slug,
  academic_year,
  monthly_fee,
  penalty_fee,
  start_month,
  end_month,
  is_active,
  config
) VALUES (
  'c0000000-0000-0000-0000-000000000030', -- Fixed ID for CPE30
  'a0000000-0000-0000-0000-000000000001', -- Reference to organization
  'CPE30',
  'cpe30',
  68,      -- ปีการศึกษา 2568 (พ.ศ. 2 หลัก)
  70,      -- ค่าธรรมเนียม 70 บาท/เดือน
  10,      -- ค่าปรับ 10 บาท
  7,       -- เริ่มเก็บเดือน กรกฎาคม (7)
  3,       -- สิ้นสุด มีนาคม (3) ปีถัดไป
  true,    -- Active
  '{
    "autoVerifyEnabled": true,
    "notificationsEnabled": true,
    "line_group_id": null,
    "promptpay_id": null
  }'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- =============================================================================
-- STEP 3: Verify Setup
-- =============================================================================
-- Check if setup was successful
SELECT '✅ Organization created:' AS status, name FROM organizations LIMIT 1;
SELECT '✅ Cohort created:' AS status, name, academic_year, monthly_fee FROM cohorts WHERE is_active = true LIMIT 1;

-- =============================================================================
-- STEP 4: (Optional) Import Sample Members
-- =============================================================================
-- Uncomment and modify to add sample members for testing

/*
INSERT INTO members (cohort_id, student_id, title, first_name, last_name, nickname, status)
VALUES 
  ('c0000000-0000-0000-0000-000000000030', '66360001', 'นาย', 'สมชาย', 'ใจดี', 'ชาย', 'active'),
  ('c0000000-0000-0000-0000-000000000030', '66360002', 'นางสาว', 'สมหญิง', 'รักเรียน', 'หญิง', 'active'),
  ('c0000000-0000-0000-0000-000000000030', '66360003', 'นาย', 'พร้อม', 'เสมอ', 'พี่พร้อม', 'active')
ON CONFLICT (cohort_id, student_id) DO NOTHING;

SELECT '✅ Sample members created:' AS status, COUNT(*) AS count FROM members;
*/

-- =============================================================================
-- DONE! 
-- =============================================================================
-- Now you can:
-- 1. Go to /admin/members and use Smart Import to add real members
-- 2. Configure settings at /admin/settings
-- 3. Start using the system!
-- =============================================================================
