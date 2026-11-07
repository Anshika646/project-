-- ==============================================================================
-- EDUNEXA MIGRATION 00011: ATTENDANCE MANAGEMENT
-- Daily Ledger, Duplicate Prevention, Lockout Policies & Correction Workflows
-- ==============================================================================

BEGIN;

-- 1. Daily Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  section_id UUID NOT NULL,
  student_id UUID NOT NULL,
  enrollment_id UUID,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'unmarked',
  check_in_time TIME,
  reason_for_absence TEXT,
  remarks TEXT,
  marked_by UUID REFERENCES profiles(id),
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Strict Multi-Tenant Prevention of Duplicate Records for the Same Student on the Same Date in a Tenant
  CONSTRAINT uq_student_daily_attendance UNIQUE (institution_id, student_id, date),
  -- Foreign Keys
  CONSTRAINT fk_att_section FOREIGN KEY (institution_id, section_id) REFERENCES sections(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_att_student FOREIGN KEY (institution_id, student_id) REFERENCES students(institution_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_attendance_date_section ON attendance_records(institution_id, section_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_hist ON attendance_records(student_id, date DESC);

CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Attendance Daily Lockouts (Controlled by School Admin)
CREATE TABLE IF NOT EXISTS attendance_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  locked_by UUID REFERENCES profiles(id),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_section_date_lock UNIQUE (section_id, date)
);

-- 3. Attendance Correction Requests (Teacher submits, Admin approves)
CREATE TABLE IF NOT EXISTS attendance_correction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  attendance_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  proposed_status attendance_status NOT NULL,
  justification TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',          -- 'pending' | 'approved' | 'rejected'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_att_req_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TRIGGER trg_att_correction_updated_at
  BEFORE UPDATE ON attendance_correction_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
