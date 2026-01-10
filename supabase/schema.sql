-- =============================================================================
-- CPE Funds Hub - Database Schema
-- =============================================================================
-- Run this SQL in Supabase SQL Editor to create all required tables
-- Version: 1.0.0
-- Date: 2026-01-08
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ORGANIZATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  bank_name TEXT NOT NULL DEFAULT 'KASIKORNTHAI',
  bank_account_no TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for slug lookup
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- =============================================================================
-- 2. COHORTS TABLE (รุ่น/ชั้นปี)
<<<<<<< HEAD
-- Based on: src/docs/DESIGN-Database&DataEntry.md
=======
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
-- =============================================================================
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
<<<<<<< HEAD
  name TEXT NOT NULL,                   -- ชื่อรุ่น (เช่น "CPE30")
  slug TEXT UNIQUE NOT NULL,            -- URL slug (เช่น "cpe30")
  academic_year INT NOT NULL,           -- ปีการศึกษา (เช่น 2566)
  
  -- Fee Configuration
  monthly_fee INT NOT NULL DEFAULT 70,
  penalty_fee INT NOT NULL DEFAULT 10,
  start_month INT NOT NULL DEFAULT 7,   -- กรกฎาคม
  end_month INT NOT NULL DEFAULT 3,     -- มีนาคม (ปีถัดไป)
  
  -- 🚀 Smart Config: ตั้งค่ายืดหยุ่นของแต่ละรุ่น
  config JSONB DEFAULT '{}',            -- เก็บตั้งค่าเพิ่มเติม (เช่น bank_account, line_group)
  
=======
  name TEXT NOT NULL,
  academic_year INT NOT NULL,
  monthly_fee INT NOT NULL DEFAULT 70,
  penalty_fee INT NOT NULL DEFAULT 10,
  start_month INT NOT NULL DEFAULT 6,
  end_month INT NOT NULL DEFAULT 5,
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cohorts_org ON cohorts(organization_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_active ON cohorts(is_active);
CREATE INDEX IF NOT EXISTS idx_cohorts_year ON cohorts(academic_year DESC);

-- =============================================================================
-- 3. MEMBERS TABLE (สมาชิก)
<<<<<<< HEAD
-- Based on: src/docs/DESIGN-Database&DataEntry.md
=======
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
-- =============================================================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
<<<<<<< HEAD
  student_id VARCHAR(8) NOT NULL,       -- รหัสนิสิต (YYMMXXXX)
  title TEXT,                           -- คำนำหน้า (นาย/นางสาว)
  first_name TEXT NOT NULL,             -- ชื่อจริง
  last_name TEXT NOT NULL,              -- นามสกุล
  nickname TEXT,                        -- ชื่อเล่น
  email TEXT,                           -- อีเมล
  phone TEXT,                           -- เบอร์โทร
  line_id TEXT,                         -- Line ID
  
  -- 🚀 Smart Field: ข้อมูลยืดหยุ่นที่อาจเปลี่ยนไปตามรุ่น
  profile_data JSONB DEFAULT '{}',      -- เก็บข้อมูลอื่นๆ เช่น "สายรหัส", "Facebook"
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'graduated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Composite Unique Key: ห้ามมีรหัสนิสิตซ้ำในรุ่นเดียวกัน
=======
  student_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  email TEXT,
  phone TEXT,
  line_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one student ID per cohort
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b
  UNIQUE(cohort_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_members_cohort ON members(cohort_id);
CREATE INDEX IF NOT EXISTS idx_members_student_id ON members(student_id);
<<<<<<< HEAD
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
=======
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
>>>>>>> d281b8382144a1b13889bc6d40060fafce4e224b

-- =============================================================================
-- 4. PAYMENTS TABLE (บันทึกการชำระเงิน)
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  payment_month INT NOT NULL CHECK (payment_month >= 1 AND payment_month <= 12),
  payment_year INT NOT NULL,
  slip_url TEXT,
  slip_trans_ref TEXT,
  slip_verified BOOLEAN NOT NULL DEFAULT false,
  slip_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_cohort ON payments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON payments(payment_year, payment_month);
CREATE INDEX IF NOT EXISTS idx_payments_trans_ref ON payments(slip_trans_ref);

-- =============================================================================
-- 5. ADMINS TABLE (ผู้ดูแลระบบ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'treasurer' CHECK (role IN ('treasurer', 'president', 'super_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one role per user per cohort
  UNIQUE(user_id, cohort_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_user ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_cohort ON admins(cohort_id);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- =============================================================================
-- 6. AUDIT_LOGS TABLE (บันทึกการเปลี่ยนแปลง)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES auth.users(id),
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create helper function to check admin access
CREATE OR REPLACE FUNCTION is_admin_of_cohort(check_cohort_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
    AND (cohort_id = check_cohort_id OR role = 'super_admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check super admin
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations Policies
CREATE POLICY "Organizations are viewable by everyone"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizations are manageable by super admins"
  ON organizations FOR ALL
  TO authenticated
  USING (is_super_admin());

-- Cohorts Policies
CREATE POLICY "Cohorts are viewable by everyone"
  ON cohorts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Cohorts are manageable by super admins"
  ON cohorts FOR ALL
  TO authenticated
  USING (is_super_admin());

-- Members Policies
CREATE POLICY "Members are viewable by cohort admins"
  ON members FOR SELECT
  TO authenticated
  USING (is_admin_of_cohort(cohort_id));

CREATE POLICY "Members are manageable by cohort admins"
  ON members FOR ALL
  TO authenticated
  USING (is_admin_of_cohort(cohort_id));

-- Public read access for status lookup (by student_id)
CREATE POLICY "Members can view their own data"
  ON members FOR SELECT
  TO anon
  USING (true);

-- Payments Policies
CREATE POLICY "Payments are viewable by cohort admins"
  ON payments FOR SELECT
  TO authenticated
  USING (is_admin_of_cohort(cohort_id));

CREATE POLICY "Payments are manageable by cohort admins"
  ON payments FOR ALL
  TO authenticated
  USING (is_admin_of_cohort(cohort_id));

-- Public can insert payments (for payment submission)
CREATE POLICY "Anyone can submit payments"
  ON payments FOR INSERT
  TO anon
  WITH CHECK (true);

-- Payments public read for status check
CREATE POLICY "Payments are viewable by member"
  ON payments FOR SELECT
  TO anon
  USING (true);

-- Admins Policies
CREATE POLICY "Admins viewable by authenticated users"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manageable by super admins"
  ON admins FOR ALL
  TO authenticated
  USING (is_super_admin());

-- Audit Logs Policies
CREATE POLICY "Audit logs viewable by super admins"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- =============================================================================
-- 8. TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohorts_updated_at
  BEFORE UPDATE ON cohorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 9. AUDIT LOG TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
  record_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    record_id := OLD.id;
  ELSE
    record_id := NEW.id;
  END IF;

  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
  VALUES (
    TG_TABLE_NAME,
    record_id,
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
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
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_members
  AFTER INSERT OR UPDATE OR DELETE ON members
  FOR EACH ROW EXECUTE FUNCTION log_changes();

-- =============================================================================
-- 10. INITIAL DATA (Sample Organization)
-- =============================================================================

-- Insert default organization (uncomment to run)
-- INSERT INTO organizations (name, slug, bank_account_no, bank_account_name)
-- VALUES (
--   'สาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร',
--   'cpe-nu',
--   '1931905372',
--   'Theerapat Pooraya'
-- );

-- Insert sample cohort (uncomment to run)
-- INSERT INTO cohorts (organization_id, name, academic_year)
-- SELECT id, 'รุ่นที่ 30', 68
-- FROM organizations WHERE slug = 'cpe-nu';

-- =============================================================================
-- DONE! 🎉
-- =============================================================================
