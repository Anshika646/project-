-- ==============================================================================
-- EDUNEXA MIGRATION 00009: ADMISSIONS MANAGEMENT
-- Enquiry Pipeline, 7-Section Application Wizard & Statutory Verification
-- ==============================================================================

BEGIN;

-- 1. Admission Enquiries Pipeline
CREATE TABLE IF NOT EXISTS admission_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_name VARCHAR(150) NOT NULL,
  parent_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  target_class VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'enquiry',          -- 'enquiry'|'applied'|'interview_scheduled'|'admitted'|'rejected'
  enquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  previous_school VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_enquiry_status CHECK (status IN ('enquiry', 'applied', 'interview_scheduled', 'admitted', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_enquiries_inst ON admission_enquiries(institution_id, status);

CREATE TRIGGER trg_admission_enquiries_updated_at
  BEFORE UPDATE ON admission_enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Comprehensive Admission Applications (7-Section Statutory Form)
CREATE TABLE IF NOT EXISTS admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES admission_enquiries(id) ON DELETE SET NULL,
  application_number VARCHAR(50) NOT NULL,                -- e.g. "APP-2025-0814"
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  target_class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
  target_stream VARCHAR(50),
  form_data JSONB NOT NULL,                               -- Complete Sections A through G structured data
  status VARCHAR(30) NOT NULL DEFAULT 'draft',            -- 'draft'|'submitted'|'under_review'|'approved'|'enrolled'|'rejected'
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_app_number UNIQUE (institution_id, application_number),
  CONSTRAINT chk_app_status CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'enrolled', 'rejected'))
);

CREATE TRIGGER trg_admission_apps_updated_at
  BEFORE UPDATE ON admission_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Admission Application Documents
CREATE TABLE IF NOT EXISTS admission_application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,                    -- 'birth_certificate'|'transfer_certificate'|'marksheet'|'medical'
  file_name VARCHAR(255) NOT NULL,
  file_storage_path TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Admission Status History (Audit Trail of Progression)
CREATE TABLE IF NOT EXISTS admission_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
  previous_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
