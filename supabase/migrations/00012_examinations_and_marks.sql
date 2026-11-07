-- ==============================================================================
-- EDUNEXA MIGRATION 00012: EXAMINATIONS & STUDENT MARKS
-- Assessments, Theory/Practical Breakdown, Maximum Limits & Grade Validation
-- ==============================================================================

BEGIN;

-- 1. Examinations (Term Events per Academic Year)
CREATE TABLE IF NOT EXISTS examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  name VARCHAR(150) NOT NULL,                             -- "Term 1 Final Examination", "Mid-Term Periodic Test"
  exam_type VARCHAR(50) NOT NULL,                         -- 'Term 1' | 'Term 2' | 'Unit Test' | 'Pre-Board' | 'Practical'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_exam_session_name UNIQUE (session_id, name),
  CONSTRAINT fk_exam_session FOREIGN KEY (institution_id, session_id) REFERENCES academic_sessions(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_exam_dates CHECK (end_date >= start_date)
);

CREATE TRIGGER trg_examinations_updated_at
  BEFORE UPDATE ON examinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Exam Subjects (Class-Subject Specific Assessment Rules & Max Limits)
CREATE TABLE IF NOT EXISTS exam_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  examination_id UUID NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
  offering_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 180,
  max_theory_marks NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
  max_practical_marks NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  max_internal_marks NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  passing_marks NUMERIC(5, 2) NOT NULL DEFAULT 33.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_exam_offering_sub UNIQUE (examination_id, offering_id, subject_id),
  CONSTRAINT fk_examsub_offering FOREIGN KEY (institution_id, offering_id) REFERENCES class_session_offerings(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_examsub_subject FOREIGN KEY (institution_id, subject_id) REFERENCES subjects(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_positive_max_marks CHECK (max_theory_marks >= 0 AND max_practical_marks >= 0 AND max_internal_marks >= 0)
);

CREATE TRIGGER trg_exam_subjects_updated_at
  BEFORE UPDATE ON exam_subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Student Marks Ledger (Theory, Practical, Internal, CBSE Grade, Audit Status)
CREATE TABLE IF NOT EXISTS student_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  exam_subject_id UUID NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL,
  student_id UUID NOT NULL,
  theory_marks NUMERIC(5, 2) DEFAULT 0.00,
  practical_marks NUMERIC(5, 2) DEFAULT 0.00,
  internal_marks NUMERIC(5, 2) DEFAULT 0.00,
  total_marks NUMERIC(5, 2) GENERATED ALWAYS AS (
    COALESCE(theory_marks, 0) + COALESCE(practical_marks, 0) + COALESCE(internal_marks, 0)
  ) STORED,
  percentage NUMERIC(5, 2),
  grade VARCHAR(10) NOT NULL DEFAULT 'E',
  is_absent BOOLEAN NOT NULL DEFAULT false,
  is_exempted BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',            -- 'draft' | 'submitted' | 'approved' | 'locked'
  remarks TEXT,
  entered_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_exam_mark UNIQUE (exam_subject_id, enrollment_id),
  CONSTRAINT fk_mark_enrollment FOREIGN KEY (institution_id, enrollment_id) REFERENCES student_session_enrollments(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_mark_student FOREIGN KEY (institution_id, student_id) REFERENCES students(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT chk_marks_status CHECK (status IN ('draft', 'submitted', 'approved', 'locked'))
);

CREATE INDEX IF NOT EXISTS idx_marks_lookup ON student_marks(exam_subject_id, student_id);

CREATE TRIGGER trg_student_marks_updated_at
  BEFORE UPDATE ON student_marks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
