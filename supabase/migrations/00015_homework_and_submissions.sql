-- ==============================================================================
-- EDUNEXA MIGRATION 00015: HOMEWORK & SUBMISSIONS
-- Daily Assignments, Due Dates, Student Submissions & Grading Workflows
-- ==============================================================================

BEGIN;

-- 1. Homework Assignments
CREATE TABLE IF NOT EXISTS homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  teacher_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  max_marks NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  allow_late_submissions BOOLEAN NOT NULL DEFAULT true,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hw_due_date CHECK (due_date >= assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_hw_section ON homework(institution_id, section_id, due_date);

CREATE TRIGGER trg_homework_updated_at
  BEFORE UPDATE ON homework
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Homework Attachments (Reference materials uploaded by teacher)
CREATE TABLE IF NOT EXISTS homework_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_storage_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Student Homework Submissions
CREATE TABLE IF NOT EXISTS homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_session_enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  attachment_url TEXT,
  attachment_storage_path TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',        -- 'submitted' | 'graded' | 'returned_for_resubmission'
  marks_awarded NUMERIC(5, 2),
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hw_student_entry UNIQUE (homework_id, student_id),
  CONSTRAINT chk_hw_status CHECK (status IN ('submitted', 'graded', 'returned_for_resubmission'))
);

CREATE INDEX IF NOT EXISTS idx_hw_sub_hw ON homework_submissions(homework_id, status);

CREATE TRIGGER trg_homework_submissions_updated_at
  BEFORE UPDATE ON homework_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
