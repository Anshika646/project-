-- ==============================================================================
-- EDUNEXA MIGRATION 00002: CORE TENANT TABLES
-- Multi-Tenant SaaS ERP Architecture (Institutions & Settings)
-- ==============================================================================

BEGIN;

-- 1. Tenant Root: Institutions (School or College)
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,                       -- E.g. "SIS-DELHI-08914"
  type VARCHAR(30) NOT NULL DEFAULT 'school',             -- 'school' | 'college'
  board VARCHAR(50) NOT NULL DEFAULT 'CBSE',              -- 'CBSE' | 'ICSE' | 'State Board' | 'Cambridge / IB' | 'Custom'
  affiliation_number VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{
    "min_attendance_pct": 75,
    "passing_pct": 33,
    "grading_scale": "cbse_9point",
    "periods_per_day": 8,
    "attendance_cutoff_time": "09:15"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_institution_tenant UNIQUE (id)
);

CREATE TRIGGER trg_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Tenant Settings: Institutional Configurations (Audit & Policy Rules)
CREATE TABLE IF NOT EXISTS institution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  academic_calendar_type VARCHAR(50) NOT NULL DEFAULT 'term_based', -- 'term_based' | 'semester_based'
  allow_parent_portal BOOLEAN NOT NULL DEFAULT true,
  allow_student_portal BOOLEAN NOT NULL DEFAULT true,
  require_two_factor_for_admins BOOLEAN NOT NULL DEFAULT false,
  auto_lock_attendance_after_days INTEGER NOT NULL DEFAULT 1,
  auto_lock_marks_after_publication BOOLEAN NOT NULL DEFAULT true,
  official_principal_signature_url TEXT,
  official_school_seal_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_inst_settings_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_institution_single_settings UNIQUE (institution_id)
);

CREATE TRIGGER trg_institution_settings_updated_at
  BEFORE UPDATE ON institution_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
