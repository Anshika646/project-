-- ==============================================================================
-- EDUNEXA MIGRATION 00008: STUDENTS & GUARDIANS
-- Permanent Student Registry, Multi-Session Enrollment History & M:N Family Links
-- ==============================================================================

BEGIN;

-- 1. Students (Permanent Master Demographics)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable initially; linked when student activates online account
  admission_number VARCHAR(50) NOT NULL,                  -- Permanent Lifetime ID: "ADM-2022-0041"
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  blood_group VARCHAR(10),
  category VARCHAR(20) DEFAULT 'General',                 -- 'General' | 'OBC' | 'SC' | 'ST' | 'EWS'
  mother_tongue VARCHAR(50) DEFAULT 'English',
  nationality VARCHAR(50) NOT NULL DEFAULT 'Indian',
  national_id_hash VARCHAR(128),                          -- Secure SHA-256 hash of national ID (No raw plaintext stored)
  emergency_contact VARCHAR(50) NOT NULL,
  residential_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  previous_school_name VARCHAR(255),
  previous_school_board VARCHAR(100),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_students_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_student_adm_num UNIQUE (institution_id, admission_number)
);

CREATE INDEX IF NOT EXISTS idx_students_inst ON students(institution_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_students_profile ON students(profile_id);

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Student Session Enrollments (Preserves Progression & Academic History)
CREATE TABLE IF NOT EXISTS student_session_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  student_id UUID NOT NULL,
  session_id UUID NOT NULL,
  offering_id UUID NOT NULL,
  section_id UUID NOT NULL,
  roll_number VARCHAR(50) NOT NULL,
  enrollment_status student_enrollment_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  promoted_to_enrollment_id UUID REFERENCES student_session_enrollments(id) ON DELETE SET NULL,
  tc_issued BOOLEAN NOT NULL DEFAULT false,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_enrollments_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_student_session UNIQUE (student_id, session_id),
  CONSTRAINT uq_section_roll UNIQUE (section_id, roll_number),
  CONSTRAINT fk_enroll_student FOREIGN KEY (institution_id, student_id) REFERENCES students(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_enroll_session FOREIGN KEY (institution_id, session_id) REFERENCES academic_sessions(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_enroll_offering FOREIGN KEY (institution_id, offering_id) REFERENCES class_session_offerings(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_enroll_section FOREIGN KEY (institution_id, section_id) REFERENCES sections(institution_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_enrollment_lookup ON student_session_enrollments(institution_id, session_id, section_id, enrollment_status);
CREATE INDEX IF NOT EXISTS idx_enrollment_student ON student_session_enrollments(student_id);

CREATE TRIGGER trg_student_enrollments_updated_at
  BEFORE UPDATE ON student_session_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Parents Registry (Verified Parent/Guardian Identity)
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Linked when parent activates online credentials
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  occupation VARCHAR(100),
  annual_income VARCHAR(50),
  residential_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_parents_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_parent_inst_phone UNIQUE (institution_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_parents_profile ON parents(profile_id);

CREATE TRIGGER trg_parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Student Guardians (M:N Family Linkage: Multiple Children per Parent & Multiple Guardians per Child)
CREATE TABLE IF NOT EXISTS student_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  relationship VARCHAR(50) NOT NULL,                      -- 'Father', 'Mother', 'Legal Guardian'
  is_primary BOOLEAN NOT NULL DEFAULT true,
  can_pickup BOOLEAN NOT NULL DEFAULT true,
  emergency_priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_guardian UNIQUE (parent_id, student_id),
  CONSTRAINT fk_guardian_parent FOREIGN KEY (institution_id, parent_id) REFERENCES parents(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_guardian_student FOREIGN KEY (institution_id, student_id) REFERENCES students(institution_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guardians_parent ON student_guardians(parent_id);
CREATE INDEX IF NOT EXISTS idx_guardians_student ON student_guardians(student_id);

CREATE TRIGGER trg_student_guardians_updated_at
  BEFORE UPDATE ON student_guardians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
