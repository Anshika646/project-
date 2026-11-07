-- ==============================================================================
-- EDUNEXA MIGRATION 00013: REPORT CARDS & GRADING SYSTEMS
-- CBSE / State 9-Point Scale, Boundary Calculation & Published Transcripts
-- ==============================================================================

BEGIN;

-- 1. Grading Systems Configuration
CREATE TABLE IF NOT EXISTS grading_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,                             -- "CBSE Secondary 9-Point Scale", "ICSE Standard Scale"
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_grading_system_name UNIQUE (institution_id, name)
);

-- 2. Grade Boundaries (Percentages to Grades & Grade Points)
CREATE TABLE IF NOT EXISTS grade_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  grading_system_id UUID NOT NULL REFERENCES grading_systems(id) ON DELETE CASCADE,
  grade VARCHAR(10) NOT NULL,                             -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E'
  min_percentage NUMERIC(5, 2) NOT NULL,
  max_percentage NUMERIC(5, 2) NOT NULL,
  grade_point NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
  description VARCHAR(100),                               -- 'Outstanding', 'Excellent', 'Very Good', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_grading_bound_grade UNIQUE (grading_system_id, grade),
  CONSTRAINT chk_grade_pct_range CHECK (max_percentage >= min_percentage)
);

-- 3. Consolidated Student Report Cards
CREATE TABLE IF NOT EXISTS student_report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  examination_id UUID NOT NULL,
  enrollment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  total_marks_obtained NUMERIC(6, 2) NOT NULL,
  total_max_marks NUMERIC(6, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  overall_grade VARCHAR(10) NOT NULL,
  rank_in_section INTEGER,
  attendance_percentage NUMERIC(5, 2) NOT NULL,
  principal_remarks TEXT,
  teacher_remarks TEXT,
  pdf_storage_path TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_report_card_entry UNIQUE (examination_id, enrollment_id),
  CONSTRAINT fk_rc_session FOREIGN KEY (institution_id, session_id) REFERENCES academic_sessions(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_rc_student FOREIGN KEY (institution_id, student_id) REFERENCES students(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_rc_enrollment FOREIGN KEY (institution_id, enrollment_id) REFERENCES student_session_enrollments(institution_id, id) ON DELETE CASCADE
);

CREATE TRIGGER trg_report_cards_updated_at
  BEFORE UPDATE ON student_report_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Report Card Publication Batches (Section-Level Publishing Workflow)
CREATE TABLE IF NOT EXISTS report_card_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  published_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_students INTEGER NOT NULL,
  CONSTRAINT uq_pub_exam_section UNIQUE (examination_id, section_id)
);

COMMIT;
