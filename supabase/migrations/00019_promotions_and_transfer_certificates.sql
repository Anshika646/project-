-- ==============================================================================
-- EDUNEXA MIGRATION 00019: PROMOTIONS & TRANSFER CERTIFICATES
-- Session Transition Audit, Retention Flags & Statutory Transfer Documents
-- ==============================================================================

BEGIN;

-- 1. Student Promotions History (Historical Progression between Sessions)
CREATE TABLE IF NOT EXISTS student_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  from_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  to_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  from_section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  to_section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  final_percentage NUMERIC(5, 2) NOT NULL,
  final_grade VARCHAR(10) NOT NULL,
  attendance_percentage NUMERIC(5, 2) NOT NULL,
  promotion_status student_enrollment_status NOT NULL DEFAULT 'promoted',
  approved_by UUID NOT NULL REFERENCES profiles(id),
  remarks TEXT,
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_promotion_event UNIQUE (student_id, from_session_id, to_session_id)
);

CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON student_promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Statutory Transfer Certificates (Official School Leaving Certificates)
CREATE TABLE IF NOT EXISTS transfer_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  tc_number VARCHAR(50) NOT NULL,                          -- e.g. "TC-2026-0089"
  father_name VARCHAR(150) NOT NULL,
  mother_name VARCHAR(150) NOT NULL,
  nationality VARCHAR(50) NOT NULL DEFAULT 'Indian',
  dob DATE NOT NULL,
  last_class_studied VARCHAR(100) NOT NULL,
  school_board_annual_exam_result VARCHAR(50) NOT NULL,   -- 'Passed' | 'Failed' | 'Qualified for Higher Class'
  promoted_to_higher_class BOOLEAN NOT NULL DEFAULT true,
  promoted_to_class_name VARCHAR(100),
  reason_for_leaving TEXT NOT NULL,
  total_working_days INTEGER NOT NULL,
  total_days_present INTEGER NOT NULL,
  general_conduct VARCHAR(50) NOT NULL DEFAULT 'Good',
  date_of_application DATE NOT NULL,
  date_of_issue DATE NOT NULL DEFAULT CURRENT_DATE,
  issued_by UUID NOT NULL REFERENCES profiles(id),
  pdf_storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tc_number UNIQUE (institution_id, tc_number)
);

CREATE TRIGGER trg_tc_updated_at
  BEFORE UPDATE ON transfer_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
