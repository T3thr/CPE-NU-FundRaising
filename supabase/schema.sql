-- =============================================================================
-- CPE Funds Hub - Database Schema
-- =============================================================================
-- Version: 2.0.0
-- Date: 2026-01-11
-- Author: CPE Dev Team
--
-- IMPORTANT: Run this script first, then run fix_rls_and_seed_admin.sql
--
-- This schema is designed to be:
-- ✅ Scalable - Supports multi-tenancy (multiple cohorts/organizations)
-- ✅ Maintainable - Clean structure with proper constraints
-- ✅ Secure - RLS policies for data isolation
-- ✅ Compatible - Works with Supabase latest version
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ORGANIZATIONS TABLE (องค์กร/สาขา)
-- =============================================================================
-- Primary entity representing a department or organization
-- Example: "สาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร"
-- =============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                           -- ชื่อองค์กร
  slug TEXT UNIQUE NOT NULL,                    -- URL-friendly identifier
  logo_url TEXT,                                -- URL รูปโลโก้
  
  -- Banking Information (for payment display)
  bank_name TEXT NOT NULL DEFAULT 'KASIKORNTHAI',
  bank_account_no TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,
  
  -- Metadata
  settings JSONB DEFAULT '{}',                  -- Flexible settings storage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- =============================================================================
-- 2. COHORTS TABLE (รุ่น/ชั้นปี)
-- =============================================================================
-- Each cohort represents a student batch (e.g., CPE30, CPE31)
-- Based on: src/docs/SYSTEM-Validation&BusinessRules.md
--
-- Business Logic:
-- - CPE Generation = (Academic Year last 2 digits) - 36
-- - Example: Year 66 (2566) → CPE30
-- - Collection Period: 9 months (July to March next year)
-- =============================================================================
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,                           -- ชื่อรุ่น (เช่น "CPE30", "รุ่นที่ 30")
  slug TEXT UNIQUE NOT NULL,                    -- URL slug (เช่น "cpe30")
  academic_year INT NOT NULL,                   -- ปีการศึกษา (เลข 2 ตัว เช่น 66, 67, 68)
  
  -- Fee Configuration (Configurable per cohort)
  -- Based on: SYSTEM-Validation&BusinessRules.md - Section 3
  monthly_fee INT NOT NULL DEFAULT 70,          -- ค่าสาขา/เดือน (บาท)
  penalty_fee INT NOT NULL DEFAULT 10,          -- ค่าปรับ/เดือน (ขั้นต่ำ 10 บาท)
  
  -- Collection Period Configuration
  -- Based on: SYSTEM-Validation&BusinessRules.md - Section 2
  start_month INT NOT NULL DEFAULT 7,           -- เดือนเริ่มเก็บ (1-12, default: กรกฎาคม)
  end_month INT NOT NULL DEFAULT 3,             -- เดือนสิ้นสุด (1-12, default: มีนาคม)
  
  -- Smart Config: Flexible settings per cohort
  config JSONB DEFAULT '{}',                    -- { "line_group_id": "xxx", "custom_bank": {...} }
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cohorts_org ON cohorts(organization_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_active ON cohorts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cohorts_year ON cohorts(academic_year DESC);

-- =============================================================================
-- 3. MEMBERS TABLE (สมาชิก/นิสิต)
-- =============================================================================
-- Student members who pay the fund
-- Based on: OLD-SYSTEM-GoogleSheetSpec.md & SYSTEM-Validation&BusinessRules.md
--
-- Student ID Format: YYMMXXXX
-- - YY: Class Year (ปีการศึกษา)
-- - MM: Major Code (36 = Computer Engineering)
-- - XXXX: Running Number
-- =============================================================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  
  -- Core Identity
  student_id VARCHAR(8) NOT NULL,               -- รหัสนิสิต (YYMMXXXX)
  
  -- Name Information
  title TEXT,                                   -- คำนำหน้า (นาย/นางสาว)
  first_name TEXT NOT NULL,                     -- ชื่อจริง
  last_name TEXT NOT NULL,                      -- นามสกุล
  full_name TEXT GENERATED ALWAYS AS (
    COALESCE(title || ' ', '') || first_name || ' ' || last_name
  ) STORED,                                     -- ชื่อเต็ม (auto-generated)
  nickname TEXT,                                -- ชื่อเล่น
  
  -- Contact Information
  email TEXT,
  phone TEXT,
  line_id TEXT,
  
  -- Flexible Data (for future extensions)
  profile_data JSONB DEFAULT '{}',              -- { "facebook": "xxx", "code_group": "A" }
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'resigned', 'graduated')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(cohort_id, student_id)                 -- ห้ามมีรหัสนิสิตซ้ำในรุ่นเดียวกัน
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_cohort ON members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_members_student_id ON members(student_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_members_full_name ON members(full_name);

-- =============================================================================
-- 4. PAYMENTS TABLE (บันทึกการชำระเงิน)
-- =============================================================================
-- Payment records with slip verification
-- Based on: PROJECT-Background&Mission.md - Smart Payment feature
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount INT NOT NULL CHECK (amount > 0),
  payment_month INT NOT NULL CHECK (payment_month >= 1 AND payment_month <= 12),
  payment_year INT NOT NULL CHECK (payment_year >= 60 AND payment_year <= 99), -- 2560-2599
  
  -- Slip Information
  slip_url TEXT,                                -- URL ของสลิป
  slip_trans_ref TEXT,                          -- Reference จาก EasySlip API
  slip_data JSONB DEFAULT '{}',                 -- Raw data from EasySlip
  
  -- Verification Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'verified', 'rejected', 'manual')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Notes & Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',                  -- { "ip": "xxx", "user_agent": "xxx" }
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_cohort ON payments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON payments(payment_year, payment_month);
CREATE INDEX IF NOT EXISTS idx_payments_trans_ref ON payments(slip_trans_ref) 
  WHERE slip_trans_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- Unique constraint: One payment per member per month
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique_month 
  ON payments(member_id, payment_month, payment_year) 
  WHERE status = 'verified';

-- =============================================================================
-- 5. ADMINS TABLE (ผู้ดูแลระบบ)
-- =============================================================================
-- Admin users who manage the system
-- Based on: STANDARD-Security.md - Roles: super_admin, treasurer, president
-- =============================================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  
  -- Role & Permissions
  role TEXT NOT NULL DEFAULT 'treasurer' 
    CHECK (role IN ('treasurer', 'president', 'super_admin')),
  permissions JSONB DEFAULT '{}',               -- Fine-grained permissions
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, cohort_id)                    -- One role per user per cohort
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admins_user ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_org ON admins(organization_id);
CREATE INDEX IF NOT EXISTS idx_admins_cohort ON admins(cohort_id);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active) WHERE is_active = true;

-- =============================================================================
-- 6. AUDIT_LOGS TABLE (บันทึกการเปลี่ยนแปลง)
-- =============================================================================
-- Track all changes for compliance and debugging
-- Based on: STANDARD-Security.md - OWASP A09 Logging Failures
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Change data
  old_data JSONB,
  new_data JSONB,
  
  -- Who did it
  performed_by UUID REFERENCES auth.users(id),
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- When
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (optimized for query patterns)
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);

-- =============================================================================
-- 7. HELPER FUNCTIONS
-- =============================================================================

-- Function to check if user is admin of a specific cohort
CREATE OR REPLACE FUNCTION is_admin_of_cohort(check_cohort_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
    AND is_active = true
    AND (cohort_id = check_cohort_id OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is any admin
CREATE OR REPLACE FUNCTION is_any_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user's cohort IDs
CREATE OR REPLACE FUNCTION get_user_cohort_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT cohort_id FROM admins
    WHERE user_id = auth.uid()
    AND is_active = true
    AND cohort_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Organizations Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Organizations: Public read"
  ON organizations FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Organizations: Super admin manage"
  ON organizations FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- -----------------------------------------------------------------------------
-- Cohorts Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Cohorts: Public read active"
  ON cohorts FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Cohorts: Admin read all"
  ON cohorts FOR SELECT
  TO authenticated
  USING (is_any_admin());

CREATE POLICY "Cohorts: Super admin manage"
  ON cohorts FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- -----------------------------------------------------------------------------
-- Members Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Members: Public read for check status"
  ON members FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Members: Admin of cohort read"
  ON members FOR SELECT
  TO authenticated
  USING (is_admin_of_cohort(cohort_id));

CREATE POLICY "Members: Admin of cohort manage"
  ON members FOR ALL
  TO authenticated
  USING (is_admin_of_cohort(cohort_id))
  WITH CHECK (is_admin_of_cohort(cohort_id));

-- -----------------------------------------------------------------------------
-- Payments Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Payments: Public insert for submission"
  ON payments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Payments: Public read for status check"
  ON payments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Payments: Admin of cohort read"
  ON payments FOR SELECT
  TO authenticated
  USING (is_admin_of_cohort(cohort_id));

CREATE POLICY "Payments: Admin of cohort manage"
  ON payments FOR ALL
  TO authenticated
  USING (is_admin_of_cohort(cohort_id))
  WITH CHECK (is_admin_of_cohort(cohort_id));

-- -----------------------------------------------------------------------------
-- Admins Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Admins: Authenticated read"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins: Super admin manage"
  ON admins FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- -----------------------------------------------------------------------------
-- Audit Logs Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Audit: Super admin read"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Audit: System insert"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================================================
-- 9. TRIGGERS
-- =============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_organizations ON organizations;
CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cohorts ON cohorts;
CREATE TRIGGER set_updated_at_cohorts
  BEFORE UPDATE ON cohorts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_members ON members;
CREATE TRIGGER set_updated_at_members
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_payments ON payments;
CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_admins ON admins;
CREATE TRIGGER set_updated_at_admins
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- -----------------------------------------------------------------------------
-- Audit Log Trigger Function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_record_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
  ELSE
    v_record_id := NEW.id;
  END IF;

  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
  VALUES (
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

DROP TRIGGER IF EXISTS audit_members ON members;
CREATE TRIGGER audit_members
  AFTER INSERT OR UPDATE OR DELETE ON members
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

DROP TRIGGER IF EXISTS audit_admins ON admins;
CREATE TRIGGER audit_admins
  AFTER INSERT OR UPDATE OR DELETE ON admins
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- =============================================================================
-- DONE! 🎉
-- =============================================================================
-- Next step: Run fix_rls_and_seed_admin.sql to create admin users
-- =============================================================================
