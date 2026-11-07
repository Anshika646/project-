-- ==============================================================================
-- EDUNEXA MIGRATION 00006: SUBJECTS & SYLLABUS
-- Master Subjects, Session-Class Offerings, Credits & Chapters
-- ==============================================================================

BEGIN;

-- 1. Master Subjects Catalog
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,                             -- "Mathematics", "Physics", "English Literature"
  code VARCHAR(50) NOT NULL,                              -- "MATH-041", "PHY-042"
  department VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_subjects_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_subject_inst_code UNIQUE (institution_id, code)
);

CREATE TRIGGER trg_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Session Class Subjects (Session-Aware Curriculum Mapping & Credit Allocations)
CREATE TABLE IF NOT EXISTS session_class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  offering_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  is_elective BOOLEAN NOT NULL DEFAULT false,
  theory_max_marks NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
  practical_max_marks NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  internal_max_marks NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  credits NUMERIC(4, 2) NOT NULL DEFAULT 4.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_session_class_sub_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_offering_subject UNIQUE (offering_id, subject_id),
  CONSTRAINT fk_class_sub_offering FOREIGN KEY (institution_id, offering_id) REFERENCES class_session_offerings(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_class_sub_subject FOREIGN KEY (institution_id, subject_id) REFERENCES subjects(institution_id, id) ON DELETE RESTRICT
);

CREATE TRIGGER trg_session_class_subjects_updated_at
  BEFORE UPDATE ON session_class_subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Syllabus Chapters (Ordered Units per Class-Subject)
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  session_class_subject_id UUID NOT NULL,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_periods INTEGER NOT NULL DEFAULT 10,
  learning_objectives TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_chapters_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_chapter_num UNIQUE (session_class_subject_id, chapter_number),
  CONSTRAINT fk_chapter_session_class_sub FOREIGN KEY (institution_id, session_class_subject_id) REFERENCES session_class_subjects(institution_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chapters_sub ON chapters(session_class_subject_id);

CREATE TRIGGER trg_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
