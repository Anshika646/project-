-- ==============================================================================
-- EDUNEXA MIGRATION 00007: TEACHERS & WORKLOAD ALLOCATIONS
-- Faculty Profiles, Department Hierarchy & Teacher-Subject-Section Mappings
-- ==============================================================================

BEGIN;

-- 1. Staff Departments
CREATE TABLE IF NOT EXISTS staff_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,                             -- "Mathematics & Computing", "Humanities", "Sciences"
  code VARCHAR(50) NOT NULL,
  head_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_staff_dept_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_staff_dept_code UNIQUE (institution_id, code)
);

-- 2. Teachers Registry (Faculty Professional Master)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES staff_departments(id) ON DELETE SET NULL,
  employee_code VARCHAR(50) NOT NULL,                     -- "TCH-2022-044"
  designation VARCHAR(100) NOT NULL DEFAULT 'Senior Teacher',
  qualification VARCHAR(255) NOT NULL,                    -- "M.Sc Mathematics, B.Ed"
  specialization VARCHAR(255),
  experience_years INTEGER NOT NULL DEFAULT 0,
  date_of_joining DATE NOT NULL DEFAULT CURRENT_DATE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_teachers_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_teacher_emp_code UNIQUE (institution_id, employee_code)
);

CREATE INDEX IF NOT EXISTS idx_teachers_profile ON teachers(profile_id);

CREATE TRIGGER trg_teachers_updated_at
  BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Teacher Subject Allocations (Workload Matrix: Restricts Teacher Access by Class, Section & Subject)
CREATE TABLE IF NOT EXISTS teacher_subject_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  session_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  section_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  periods_per_week INTEGER NOT NULL DEFAULT 6,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_alloc_workload UNIQUE (session_id, section_id, subject_id, teacher_id),
  CONSTRAINT fk_alloc_session FOREIGN KEY (institution_id, session_id) REFERENCES academic_sessions(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_teacher FOREIGN KEY (institution_id, teacher_id) REFERENCES teachers(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_section FOREIGN KEY (institution_id, section_id) REFERENCES sections(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_subject FOREIGN KEY (institution_id, subject_id) REFERENCES subjects(institution_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alloc_teacher_lookup ON teacher_subject_allocations(teacher_id, session_id);
CREATE INDEX IF NOT EXISTS idx_alloc_section_lookup ON teacher_subject_allocations(section_id, subject_id);

CREATE TRIGGER trg_teacher_alloc_updated_at
  BEFORE UPDATE ON teacher_subject_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
