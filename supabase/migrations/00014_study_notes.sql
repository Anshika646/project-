-- ==============================================================================
-- EDUNEXA MIGRATION 00014: STUDY NOTES & DIGITAL LEARNING
-- AI-Generated Study Material, Handwritten Uploads & Document Tracking
-- ==============================================================================

BEGIN;

-- 1. Study Notes Master
CREATE TABLE IF NOT EXISTS study_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  chapter_title VARCHAR(150),
  topic VARCHAR(150),
  content TEXT NOT NULL,
  note_type VARCHAR(30) NOT NULL DEFAULT 'text',           -- 'ai_generated' | 'handwritten_upload' | 'text'
  file_url TEXT,
  file_name TEXT,
  file_size_kb INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_class_sub ON study_notes(institution_id, class_id, subject_id, is_published);

CREATE TRIGGER trg_study_notes_updated_at
  BEFORE UPDATE ON study_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Study Note File Attachments (Multi-page PDF / image attachments)
CREATE TABLE IF NOT EXISTS study_note_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES study_notes(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_storage_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Note Download & Access Logs (Analytics on Student Material Usage)
CREATE TABLE IF NOT EXISTS note_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  note_id UUID NOT NULL REFERENCES study_notes(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
