-- ==============================================================================
-- EDUNEXA MIGRATION 00020: COLLEGE & HIGHER EDUCATION ERP
-- Departments, Courses, Semesters, Credits, SGPA/CGPA & Backlog History
-- ==============================================================================

BEGIN;

-- 1. College Academic Departments
CREATE TABLE IF NOT EXISTS college_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,                              -- "CSE", "ECE", "MECH", "MGMT"
  hod_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_clg_dept_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_clg_dept_code UNIQUE (institution_id, code)
);

-- 2. Degree Programmes & Courses (e.g. B.Tech, B.Sc, MBA, M.Tech)
CREATE TABLE IF NOT EXISTS college_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  department_id UUID NOT NULL,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,                              -- "BTECH-CSE"
  degree_level VARCHAR(50) NOT NULL DEFAULT 'Undergraduate', -- 'Undergraduate' | 'Postgraduate' | 'Doctoral'
  duration_semesters INTEGER NOT NULL DEFAULT 8,
  total_credits_required INTEGER NOT NULL DEFAULT 160,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_clg_course_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_clg_course_code UNIQUE (institution_id, code),
  CONSTRAINT fk_course_dept FOREIGN KEY (institution_id, department_id) REFERENCES college_departments(institution_id, id) ON DELETE CASCADE
);

-- 3. College Semesters (Semester Calendar linked to Academic Session)
CREATE TABLE IF NOT EXISTS college_semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  course_id UUID NOT NULL,
  semester_number INTEGER NOT NULL,                       -- 1 to 8
  name VARCHAR(50) NOT NULL,                              -- "Semester 4 (Spring 2026)"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_clg_sem_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_clg_sem_seq UNIQUE (course_id, session_id, semester_number),
  CONSTRAINT fk_clg_sem_session FOREIGN KEY (institution_id, session_id) REFERENCES academic_sessions(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_clg_sem_course FOREIGN KEY (institution_id, course_id) REFERENCES college_courses(institution_id, id) ON DELETE CASCADE
);

-- 4. College Semester Subjects (Credits, Lecture/Lab Hours)
CREATE TABLE IF NOT EXISTS college_semester_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,                              -- "CS401-OS"
  credits NUMERIC(4, 2) NOT NULL DEFAULT 4.00,
  lecture_hours INTEGER NOT NULL DEFAULT 3,
  practical_hours INTEGER NOT NULL DEFAULT 2,
  is_elective BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_clg_sub_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_clg_sub_code UNIQUE (semester_id, code),
  CONSTRAINT fk_clg_sub_semester FOREIGN KEY (institution_id, semester_id) REFERENCES college_semesters(institution_id, id) ON DELETE CASCADE
);

-- 5. College Student Semester Enrollments
CREATE TABLE IF NOT EXISTS college_student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  course_id UUID NOT NULL,
  semester_id UUID NOT NULL,
  registration_number VARCHAR(100) NOT NULL,              -- Permanent University Reg No
  roll_number VARCHAR(50) NOT NULL,
  registered_credits NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  earned_credits NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  sgpa NUMERIC(4, 2) DEFAULT 0.00,                        -- Semester Grade Point Average (0.00 - 10.00)
  cgpa NUMERIC(4, 2) DEFAULT 0.00,                        -- Cumulative Grade Point Average
  active_backlogs_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',           -- 'active' | 'passed' | 'promoted_with_backlog' | 'detained'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_clg_enroll_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_clg_sem_student UNIQUE (semester_id, student_id),
  CONSTRAINT fk_clg_enroll_student FOREIGN KEY (institution_id, student_id) REFERENCES students(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_clg_enroll_course FOREIGN KEY (institution_id, course_id) REFERENCES college_courses(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_clg_enroll_sem FOREIGN KEY (institution_id, semester_id) REFERENCES college_semesters(institution_id, id) ON DELETE RESTRICT
);

-- 6. College Subject Registrations & Detailed Assessment Breakdown
CREATE TABLE IF NOT EXISTS college_subject_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  is_backlog BOOLEAN NOT NULL DEFAULT false,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  internal_continuous_evaluation NUMERIC(5, 2) DEFAULT 0.00, -- Mid-terms / Quizzes (Max 30)
  practical_lab_marks NUMERIC(5, 2) DEFAULT 0.00,             -- Practical / Viva (Max 20)
  end_semester_exam_marks NUMERIC(5, 2) DEFAULT 0.00,         -- University Theory Exam (Max 50)
  total_marks NUMERIC(5, 2) GENERATED ALWAYS AS (
    COALESCE(internal_continuous_evaluation, 0) + 
    COALESCE(practical_lab_marks, 0) + 
    COALESCE(end_semester_exam_marks, 0)
  ) STORED,
  letter_grade VARCHAR(10) DEFAULT 'F',                       -- 'O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'
  grade_point NUMERIC(4, 2) DEFAULT 0.00,                     -- 10.0, 9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 0.0
  credit_points NUMERIC(6, 2) GENERATED ALWAYS AS (grade_point * 4.00) STORED,
  is_passed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_clg_reg_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_clg_reg_entry UNIQUE (enrollment_id, subject_id),
  CONSTRAINT fk_clg_reg_enrollment FOREIGN KEY (institution_id, enrollment_id) REFERENCES college_student_enrollments(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_clg_reg_subject FOREIGN KEY (institution_id, subject_id) REFERENCES college_semester_subjects(institution_id, id) ON DELETE RESTRICT
);

-- 7. College Backlog Clearance History
CREATE TABLE IF NOT EXISTS college_backlogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  failed_semester_id UUID NOT NULL,
  cleared_in_semester_id UUID,
  attempts_count INTEGER NOT NULL DEFAULT 1,
  is_cleared BOOLEAN NOT NULL DEFAULT false,
  cleared_grade VARCHAR(10),
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_clg_backlog_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_clg_backlog_entry UNIQUE (student_id, subject_id, failed_semester_id),
  CONSTRAINT fk_backlog_student FOREIGN KEY (institution_id, student_id) REFERENCES students(institution_id, id) ON DELETE RESTRICT,
  CONSTRAINT fk_backlog_subject FOREIGN KEY (institution_id, subject_id) REFERENCES college_semester_subjects(institution_id, id) ON DELETE RESTRICT
);

-- 8. SGPA and CGPA Calculation Function
CREATE OR REPLACE FUNCTION calculate_college_gpa(p_enrollment_id UUID)
RETURNS TABLE (
  calculated_sgpa NUMERIC(4, 2),
  total_earned_credits NUMERIC(5, 2)
)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_sum_credits NUMERIC(5, 2) := 0.00;
  v_sum_credit_points NUMERIC(7, 2) := 0.00;
  v_earned_credits NUMERIC(5, 2) := 0.00;
  v_sgpa NUMERIC(4, 2) := 0.00;
  r RECORD;
BEGIN
  FOR r IN (
    SELECT csr.grade_point, csr.is_passed, css.credits
    FROM college_subject_registrations csr
    JOIN college_semester_subjects css ON css.id = csr.subject_id
    WHERE csr.enrollment_id = p_enrollment_id
  ) LOOP
    v_sum_credits := v_sum_credits + r.credits;
    v_sum_credit_points := v_sum_credit_points + (r.grade_point * r.credits);
    IF r.is_passed THEN
      v_earned_credits := v_earned_credits + r.credits;
    END IF;
  END LOOP;

  IF v_sum_credits > 0 THEN
    v_sgpa := ROUND(v_sum_credit_points / v_sum_credits, 2);
  END IF;

  UPDATE college_student_enrollments SET
    sgpa = v_sgpa,
    earned_credits = v_earned_credits
  WHERE id = p_enrollment_id;

  RETURN QUERY SELECT v_sgpa, v_earned_credits;
END;
$$;

COMMIT;
