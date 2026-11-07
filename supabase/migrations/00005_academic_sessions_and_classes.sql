-- ==============================================================================
-- EDUNEXA MIGRATION 00005: ACADEMIC SESSIONS & CLASS STRUCTURE
-- Session Lifecycle (Draft/Active/Closed) & Session-Aware Class Offerings
-- ==============================================================================

BEGIN;

-- 1. Academic Sessions (Annual Operations & Historical Transcripts)
CREATE TABLE IF NOT EXISTS academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,                              -- "2024 – 2025", "2025 – 2026"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status academic_session_status NOT NULL DEFAULT 'draft',
  terms_count INTEGER NOT NULL DEFAULT 2,
  total_working_days INTEGER NOT NULL DEFAULT 220,
  is_locked BOOLEAN NOT NULL DEFAULT false,               -- When closed, marks and edits are locked
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_session_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_session_inst_name UNIQUE (institution_id, name),
  CONSTRAINT chk_session_dates CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_sessions_active ON academic_sessions(institution_id, status);

CREATE TRIGGER trg_academic_sessions_updated_at
  BEFORE UPDATE ON academic_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Master Classes (Nursery through Class 12)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,                             -- "Nursery", "LKG", "UKG", "Class 1" ... "Class 12"
  grade_level INTEGER NOT NULL,                           -- -2 (Nursery), -1 (LKG), 0 (UKG), 1..12
  stage VARCHAR(50) NOT NULL,                             -- 'Foundational', 'Primary', 'Middle', 'Secondary', 'Senior Secondary'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_classes_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_class_grade_level UNIQUE (institution_id, grade_level)
);

CREATE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Class Session Offerings (Session-Aware Streams & Class Activation)
CREATE TABLE IF NOT EXISTS class_session_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  session_id UUID NOT NULL,
  class_id UUID NOT NULL,
  stream VARCHAR(50),                                     -- NULL for Nursery-10; 'Science (PCM)', 'Commerce', 'Humanities' for 11-12
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_offerings_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_session_class_stream UNIQUE (session_id, class_id, stream),
  CONSTRAINT fk_offering_session FOREIGN KEY (institution_id, session_id) REFERENCES academic_sessions(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_offering_class FOREIGN KEY (institution_id, class_id) REFERENCES classes(institution_id, id) ON DELETE RESTRICT
);

CREATE TRIGGER trg_class_session_offerings_updated_at
  BEFORE UPDATE ON class_session_offerings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Sections (Tied to Specific Class Session Offering & Academic Year)
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  offering_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,                              -- "A", "B", "C", "D"
  room_number VARCHAR(50),
  capacity INTEGER NOT NULL DEFAULT 40,
  class_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_sections_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_offering_section_name UNIQUE (offering_id, name),
  CONSTRAINT fk_section_offering FOREIGN KEY (institution_id, offering_id) REFERENCES class_session_offerings(institution_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sections_offering ON sections(offering_id);

CREATE TRIGGER trg_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
