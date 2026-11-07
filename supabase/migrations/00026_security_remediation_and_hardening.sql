-- ==============================================================================
-- EDUNEXA MIGRATION 00026: SECURITY REMEDIATION & HARDENING
-- 1. Report Card Storage SELECT Policy & Strict Path Scoping
-- 2. Hardened SECURITY DEFINER Functions with SET search_path = ''
-- 3. Marks INSERT, UPDATE, DELETE Allocation & Academic Integrity Enforcement
-- 4. Attendance INSERT, UPDATE Scoping, Locking & Role Enforcement
-- 5. Strict RLS Policies with Paired USING and WITH CHECK Clauses
-- 6. Zero-Recursion Compatibility Layer & Privilege Revocation
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. STORAGE SECURITY: REPORT-CARD STORAGE SELECT HELPER & POLICY
-- Path Format: /{institution_id}/reports/{session_id}/{student_id}.pdf
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_report_card_storage_access(p_object_name text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_clean_name text;
  v_parts text[];
  v_inst_id uuid;
  v_folder2 text;
  v_session_id uuid;
  v_filename text;
  v_student_id uuid;
  v_session_inst_id uuid;
  v_student_inst_id uuid;
  v_student_profile_id uuid;
  v_is_guardian boolean;
BEGIN
  -- 1. Require authenticated user and non-null object name
  IF p_user_id IS NULL OR p_object_name IS NULL THEN
    RETURN false;
  END IF;

  -- Strip leading slashes
  v_clean_name := regexp_replace(p_object_name, '^/+', '');
  v_parts := string_to_array(v_clean_name, '/');

  -- Must contain exactly 4 segments: {institution_id}/reports/{session_id}/{student_id}.pdf
  IF array_length(v_parts, 1) <> 4 THEN
    RETURN false;
  END IF;

  -- Folder 1: Institution UUID
  v_inst_id := public.safe_cast_uuid(v_parts[1]);
  IF v_inst_id IS NULL THEN
    RETURN false;
  END IF;

  -- Folder 2: Must be literal 'reports'
  v_folder2 := v_parts[2];
  IF v_folder2 <> 'reports' THEN
    RETURN false;
  END IF;

  -- Folder 3: Academic Session UUID
  v_session_id := public.safe_cast_uuid(v_parts[3]);
  IF v_session_id IS NULL THEN
    RETURN false;
  END IF;

  -- Segment 4: Filename must be {student_id}.pdf (valid UUID ending in .pdf)
  v_filename := v_parts[4];
  IF NOT (v_filename ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$') THEN
    RETURN false;
  END IF;

  v_student_id := public.safe_cast_uuid(substring(v_filename from 1 for 36));
  IF v_student_id IS NULL THEN
    RETURN false;
  END IF;

  -- Verify academic session exists and belongs to this institution
  SELECT institution_id INTO v_session_inst_id
  FROM public.academic_sessions
  WHERE id = v_session_id;

  IF v_session_inst_id IS NULL OR v_session_inst_id <> v_inst_id THEN
    RETURN false;
  END IF;

  -- Verify student exists, is not deleted, and belongs to this institution
  SELECT institution_id, profile_id INTO v_student_inst_id, v_student_profile_id
  FROM public.students
  WHERE id = v_student_id AND is_deleted = false;

  IF v_student_inst_id IS NULL OR v_student_inst_id <> v_inst_id THEN
    RETURN false;
  END IF;

  -- Authorization Check 1: School/College/Super Admin in this institution
  IF EXISTS (
    SELECT 1 FROM public.institution_memberships
    WHERE profile_id = p_user_id
      AND institution_id = v_inst_id
      AND role = ANY(ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role])
      AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_super_admin = true
  ) THEN
    RETURN true;
  END IF;

  -- Authorization Check 2: Teacher/Faculty in this institution
  IF EXISTS (
    SELECT 1 FROM public.institution_memberships
    WHERE profile_id = p_user_id
      AND institution_id = v_inst_id
      AND role = ANY(ARRAY['teacher'::public.user_role, 'college_faculty'::public.user_role])
      AND is_active = true
  ) THEN
    RETURN true;
  END IF;

  -- Authorization Check 3: Student accessing their own report card
  IF v_student_profile_id IS NOT NULL AND v_student_profile_id = p_user_id THEN
    RETURN (
      EXISTS (
        SELECT 1 FROM public.student_session_enrollments
        WHERE student_id = v_student_id AND session_id = v_session_id AND institution_id = v_inst_id
      )
      OR EXISTS (
        SELECT 1 FROM public.student_report_cards
        WHERE student_id = v_student_id AND session_id = v_session_id AND institution_id = v_inst_id AND is_published = true
      )
    );
  END IF;

  -- Authorization Check 4: Authorized Parent/Guardian of this student in this institution
  SELECT EXISTS (
    SELECT 1 
    FROM public.student_guardians sg
    JOIN public.parents p ON p.id = sg.parent_id
    WHERE sg.student_id = v_student_id
      AND p.profile_id = p_user_id
      AND sg.institution_id = v_inst_id
  ) INTO v_is_guardian;

  IF v_is_guardian THEN
    RETURN (
      EXISTS (
        SELECT 1 FROM public.student_session_enrollments
        WHERE student_id = v_student_id AND session_id = v_session_id AND institution_id = v_inst_id
      )
      OR EXISTS (
        SELECT 1 FROM public.student_report_cards
        WHERE student_id = v_student_id AND session_id = v_session_id AND institution_id = v_inst_id AND is_published = true
      )
    );
  END IF;

  -- All other requests denied
  RETURN false;
END;
$$;

-- Apply hardened policy to storage.objects
DROP POLICY IF EXISTS "rc_select" ON storage.objects;
CREATE POLICY "rc_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'report-cards' AND public.check_report_card_storage_access(name, auth.uid())
);

-- ------------------------------------------------------------------------------
-- 2. TEACHER ALLOCATION SECURITY HELPERS (search_path = '')
-- Verifies teacher subject/section assignment for marks and attendance
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auth_is_teacher_allocated_for_mark(
  p_exam_subject_id UUID,
  p_student_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inst_id UUID;
  v_subject_id UUID;
  v_session_id UUID;
  v_student_section_id UUID;
  v_teacher_id UUID;
BEGIN
  IF p_user_id IS NULL OR p_exam_subject_id IS NULL OR p_student_id IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Identify exam subject, session and institution
  SELECT e.institution_id, es.subject_id, e.session_id
  INTO v_inst_id, v_subject_id, v_session_id
  FROM public.exam_subjects es
  JOIN public.examinations e ON e.id = es.examination_id
  WHERE es.id = p_exam_subject_id;

  IF v_inst_id IS NULL OR v_subject_id IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Identify teacher record for caller
  SELECT id INTO v_teacher_id
  FROM public.teachers
  WHERE profile_id = p_user_id AND institution_id = v_inst_id AND is_deleted = false;

  IF v_teacher_id IS NULL THEN
    RETURN false;
  END IF;

  -- 3. Resolve student section in this session
  SELECT se.section_id INTO v_student_section_id
  FROM public.student_session_enrollments se
  WHERE se.student_id = p_student_id 
    AND se.session_id = v_session_id 
    AND se.enrollment_status = 'active'
  LIMIT 1;

  IF v_student_section_id IS NULL THEN
    SELECT section_id INTO v_student_section_id
    FROM public.students
    WHERE id = p_student_id AND institution_id = v_inst_id;
  END IF;

  -- 4. Check teacher workload allocation
  IF EXISTS (
    SELECT 1 
    FROM public.teacher_subject_allocations tsa
    WHERE tsa.teacher_id = v_teacher_id
      AND tsa.subject_id = v_subject_id
      AND (v_student_section_id IS NULL OR tsa.section_id = v_student_section_id)
      AND tsa.session_id = v_session_id
      AND tsa.institution_id = v_inst_id
  ) THEN
    RETURN true;
  END IF;

  -- 5. Check if teacher is class teacher for the student's section
  IF v_student_section_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.sections
    WHERE id = v_student_section_id 
      AND institution_id = v_inst_id
      AND class_teacher_id = p_user_id
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.auth_is_teacher_allocated_for_attendance(
  p_section_id UUID,
  p_session_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_teacher_id UUID;
  v_inst_id UUID;
BEGIN
  IF p_user_id IS NULL OR p_section_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT institution_id INTO v_inst_id
  FROM public.sections
  WHERE id = p_section_id;

  IF v_inst_id IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Check if class teacher for this section
  IF EXISTS (
    SELECT 1 FROM public.sections
    WHERE id = p_section_id AND class_teacher_id = p_user_id
  ) THEN
    RETURN true;
  END IF;

  -- 2. Check if allocated in teacher_subject_allocations for this section
  SELECT id INTO v_teacher_id
  FROM public.teachers
  WHERE profile_id = p_user_id AND institution_id = v_inst_id AND is_deleted = false;

  IF v_teacher_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.teacher_subject_allocations tsa
    WHERE tsa.teacher_id = v_teacher_id
      AND tsa.section_id = p_section_id
      AND (p_session_id IS NULL OR tsa.session_id = p_session_id)
      AND tsa.institution_id = v_inst_id
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. HARDENED MARKS COMPATIBILITY TRIGGERS (INSERT, UPDATE, DELETE)
-- Prevents unauthorized caller entry, cross-tenant pollution & unassigned subject grading
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_instead_of_insert_marks()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_session_id UUID;
  v_inst_id UUID;
  v_enrollment_id UUID;
  v_max_theory NUMERIC(5, 2);
  v_max_practical NUMERIC(5, 2);
  v_max_internal NUMERIC(5, 2);
  v_total NUMERIC(5, 2);
  v_pct NUMERIC(5, 2);
  v_grade VARCHAR(10);
  v_is_admin BOOLEAN;
  v_is_allocated BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to enter marks';
  END IF;

  -- 1. Resolve examination session, institution, and max marks limits
  SELECT e.session_id, e.institution_id, es.max_theory_marks, es.max_practical_marks, es.max_internal_marks
  INTO v_session_id, v_inst_id, v_max_theory, v_max_practical, v_max_internal
  FROM public.exam_subjects es
  JOIN public.examinations e ON e.id = es.examination_id
  WHERE es.id = NEW.exam_subject_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot record mark: exam_subject_id % does not exist', NEW.exam_subject_id;
  END IF;

  -- 2. Never trust client-supplied institution_id
  IF NEW.institution_id IS NOT NULL AND NEW.institution_id <> v_inst_id THEN
    RAISE EXCEPTION 'Tenant isolation violation: Institution mismatch between mark and exam';
  END IF;
  NEW.institution_id := v_inst_id;

  -- 3. Authorization verification: Caller MUST be Admin OR allocated Teacher
  v_is_admin := public.auth_has_role(v_inst_id, ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]);
  IF NOT v_is_admin THEN
    -- Check if caller is student or parent (explicitly forbidden from inserting marks)
    IF public.auth_has_role(v_inst_id, ARRAY['student'::public.user_role, 'parent'::public.user_role]) THEN
      RAISE EXCEPTION 'Access Denied: Students and parents cannot enter marks';
    END IF;

    -- Caller must be allocated teacher for this subject and student
    v_is_allocated := public.auth_is_teacher_allocated_for_mark(NEW.exam_subject_id, NEW.student_id, v_caller_id);
    IF NOT v_is_allocated THEN
      RAISE EXCEPTION 'Access Denied: Teacher is not allocated to teach this subject or section';
    END IF;
  END IF;

  -- 4. Verify student belongs to this institution and resolve active enrollment in this session
  IF NOT EXISTS (SELECT 1 FROM public.students WHERE id = NEW.student_id AND institution_id = v_inst_id AND is_deleted = false) THEN
    RAISE EXCEPTION 'Academic Integrity Failure: Student % does not belong to institution %', NEW.student_id, v_inst_id;
  END IF;

  IF NEW.enrollment_id IS NOT NULL THEN
    SELECT id INTO v_enrollment_id
    FROM public.student_session_enrollments
    WHERE id = NEW.enrollment_id AND student_id = NEW.student_id AND session_id = v_session_id AND institution_id = v_inst_id;
  ELSE
    SELECT id INTO v_enrollment_id
    FROM public.student_session_enrollments
    WHERE student_id = NEW.student_id AND session_id = v_session_id AND institution_id = v_inst_id AND enrollment_status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF v_enrollment_id IS NULL THEN
    RAISE EXCEPTION 'Academic Integrity Failure: Student % has no active enrollment in session % for this exam', NEW.student_id, v_session_id;
  END IF;
  NEW.enrollment_id := v_enrollment_id;

  -- 5. Validate marks boundaries and absent status
  IF COALESCE(NEW.is_absent, false) = true THEN
    NEW.theory_marks := 0.00;
    NEW.practical_marks := 0.00;
    NEW.internal_marks := 0.00;
    NEW.grade := 'AB';
  ELSE
    IF NEW.theory_marks < 0 OR NEW.theory_marks > v_max_theory THEN
      RAISE EXCEPTION 'Theory marks % out of bounds (0 - %)', NEW.theory_marks, v_max_theory;
    END IF;
    IF NEW.practical_marks < 0 OR NEW.practical_marks > v_max_practical THEN
      RAISE EXCEPTION 'Practical marks % out of bounds (0 - %)', NEW.practical_marks, v_max_practical;
    END IF;
    IF NEW.internal_marks < 0 OR NEW.internal_marks > v_max_internal THEN
      RAISE EXCEPTION 'Internal marks % out of bounds (0 - %)', NEW.internal_marks, v_max_internal;
    END IF;

    -- Calculate grade
    v_total := COALESCE(NEW.theory_marks, 0) + COALESCE(NEW.practical_marks, 0) + COALESCE(NEW.internal_marks, 0);
    IF (v_max_theory + v_max_practical + v_max_internal) > 0 THEN
      v_pct := ROUND((v_total / (v_max_theory + v_max_practical + v_max_internal)) * 100, 2);
    ELSE
      v_pct := 0.00;
    END IF;

    IF v_pct >= 90 THEN v_grade := 'A1';
    ELSIF v_pct >= 80 THEN v_grade := 'A2';
    ELSIF v_pct >= 70 THEN v_grade := 'B1';
    ELSIF v_pct >= 60 THEN v_grade := 'B2';
    ELSIF v_pct >= 50 THEN v_grade := 'C1';
    ELSIF v_pct >= 40 THEN v_grade := 'C2';
    ELSIF v_pct >= 33 THEN v_grade := 'D';
    ELSE v_grade := 'E';
    END IF;
    NEW.grade := COALESCE(NEW.grade, v_grade);
  END IF;

  -- Force entered_by to verified caller
  NEW.graded_by := v_caller_id;

  -- 6. Insert or update student_marks atomically
  INSERT INTO public.student_marks (
    id, institution_id, exam_subject_id, enrollment_id, student_id,
    theory_marks, practical_marks, internal_marks, percentage, grade, is_absent, remarks, entered_by, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    NEW.exam_subject_id,
    NEW.enrollment_id,
    NEW.student_id,
    COALESCE(NEW.theory_marks, 0.00),
    COALESCE(NEW.practical_marks, 0.00),
    COALESCE(NEW.internal_marks, 0.00),
    v_pct,
    NEW.grade,
    COALESCE(NEW.is_absent, false),
    NEW.remarks,
    v_caller_id,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (exam_subject_id, student_id) DO UPDATE SET
    theory_marks = EXCLUDED.theory_marks,
    practical_marks = EXCLUDED.practical_marks,
    internal_marks = EXCLUDED.internal_marks,
    percentage = EXCLUDED.percentage,
    grade = EXCLUDED.grade,
    is_absent = EXCLUDED.is_absent,
    remarks = EXCLUDED.remarks,
    entered_by = v_caller_id,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_instead_of_update_marks()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_inst_id UUID;
  v_exam_subject_id UUID;
  v_student_id UUID;
  v_is_admin BOOLEAN;
  v_is_allocated BOOLEAN;
  v_max_theory NUMERIC(5, 2);
  v_max_practical NUMERIC(5, 2);
  v_max_internal NUMERIC(5, 2);
  v_curr_status VARCHAR(20);
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to update marks';
  END IF;

  -- Identify target mark record
  SELECT sm.institution_id, sm.exam_subject_id, sm.student_id, sm.status,
         es.max_theory_marks, es.max_practical_marks, es.max_internal_marks
  INTO v_inst_id, v_exam_subject_id, v_student_id, v_curr_status,
       v_max_theory, v_max_practical, v_max_internal
  FROM public.student_marks sm
  JOIN public.exam_subjects es ON es.id = sm.exam_subject_id
  WHERE sm.id = OLD.id OR (sm.exam_subject_id = OLD.exam_subject_id AND sm.student_id = OLD.student_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mark record not found for update';
  END IF;

  -- Verify authorization
  v_is_admin := public.auth_has_role(v_inst_id, ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]);
  IF NOT v_is_admin THEN
    IF public.auth_has_role(v_inst_id, ARRAY['student'::public.user_role, 'parent'::public.user_role]) THEN
      RAISE EXCEPTION 'Access Denied: Students and parents cannot update marks';
    END IF;

    -- If record is locked/approved, teachers cannot edit
    IF v_curr_status IN ('approved', 'locked') THEN
      RAISE EXCEPTION 'Access Denied: Marks record is % and locked from teacher modification', v_curr_status;
    END IF;

    v_is_allocated := public.auth_is_teacher_allocated_for_mark(v_exam_subject_id, v_student_id, v_caller_id);
    IF NOT v_is_allocated THEN
      RAISE EXCEPTION 'Access Denied: Teacher is not allocated to teach this subject';
    END IF;
  END IF;

  -- Validate marks limits if provided
  IF NEW.theory_marks IS NOT NULL AND (NEW.theory_marks < 0 OR NEW.theory_marks > v_max_theory) THEN
    RAISE EXCEPTION 'Theory marks % out of bounds (0 - %)', NEW.theory_marks, v_max_theory;
  END IF;
  IF NEW.practical_marks IS NOT NULL AND (NEW.practical_marks < 0 OR NEW.practical_marks > v_max_practical) THEN
    RAISE EXCEPTION 'Practical marks % out of bounds (0 - %)', NEW.practical_marks, v_max_practical;
  END IF;
  IF NEW.internal_marks IS NOT NULL AND (NEW.internal_marks < 0 OR NEW.internal_marks > v_max_internal) THEN
    RAISE EXCEPTION 'Internal marks % out of bounds (0 - %)', NEW.internal_marks, v_max_internal;
  END IF;

  UPDATE public.student_marks SET
    theory_marks = COALESCE(NEW.theory_marks, student_marks.theory_marks),
    practical_marks = COALESCE(NEW.practical_marks, student_marks.practical_marks),
    internal_marks = COALESCE(NEW.internal_marks, student_marks.internal_marks),
    grade = COALESCE(NEW.grade, student_marks.grade),
    is_absent = COALESCE(NEW.is_absent, student_marks.is_absent),
    remarks = COALESCE(NEW.remarks, student_marks.remarks),
    entered_by = v_caller_id,
    updated_at = NOW()
  WHERE id = OLD.id OR (exam_subject_id = OLD.exam_subject_id AND student_id = OLD.student_id);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_instead_of_delete_marks()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_inst_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to delete marks';
  END IF;

  SELECT institution_id INTO v_inst_id
  FROM public.student_marks
  WHERE id = OLD.id;

  IF NOT FOUND THEN
    RETURN OLD;
  END IF;

  -- Only Admin can delete marks. Teachers, Students, Parents CANNOT delete marks
  v_is_admin := public.auth_has_role(v_inst_id, ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]);
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access Denied: Only institution administrators can delete marks';
  END IF;

  DELETE FROM public.student_marks WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. HARDENED ATTENDANCE COMPATIBILITY TRIGGERS (INSERT, UPDATE, DELETE)
-- Checks Enrollment, Locks, Dates, Section Allocation & Role Verification
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_instead_of_insert_attendance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_session_id UUID;
  v_section_id UUID;
  v_class_id UUID;
  v_enrollment_id UUID;
  v_is_admin BOOLEAN;
  v_is_allocated BOOLEAN;
  v_is_locked BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to mark attendance';
  END IF;

  -- 1. Check student institution and active enrollment
  SELECT s.institution_id, se.session_id, se.section_id, cso.class_id, se.id
  INTO NEW.institution_id, v_session_id, v_section_id, v_class_id, v_enrollment_id
  FROM public.students s
  LEFT JOIN public.student_session_enrollments se ON se.student_id = s.id AND se.enrollment_status = 'active'
  LEFT JOIN public.class_session_offerings cso ON cso.id = se.offering_id
  WHERE s.id = NEW.student_id AND s.is_deleted = false;

  IF NEW.institution_id IS NULL THEN
    RAISE EXCEPTION 'Student % does not exist or has no active enrollment', NEW.student_id;
  END IF;

  -- Fallbacks if direct class/section provided
  v_section_id := COALESCE(NEW.section_id, v_section_id);
  v_class_id := COALESCE(NEW.class_id, v_class_id);

  IF v_section_id IS NULL THEN
    RAISE EXCEPTION 'Cannot record attendance: Student is not assigned to any section';
  END IF;

  -- 2. Verify attendance date (Cannot be in the future)
  IF NEW.date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Invalid attendance date: Cannot record attendance for future date %', NEW.date;
  END IF;

  -- 3. Authorization check: Admin OR Allocated Teacher
  v_is_admin := public.auth_has_role(NEW.institution_id, ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]);
  IF NOT v_is_admin THEN
    IF public.auth_has_role(NEW.institution_id, ARRAY['student'::public.user_role, 'parent'::public.user_role]) THEN
      RAISE EXCEPTION 'Access Denied: Students and parents cannot mark attendance';
    END IF;

    -- Check teacher section allocation
    v_is_allocated := public.auth_is_teacher_allocated_for_attendance(v_section_id, v_session_id, v_caller_id);
    IF NOT v_is_allocated THEN
      RAISE EXCEPTION 'Access Denied: Teacher is not allocated to section %', v_section_id;
    END IF;

    -- Check lockouts: If attendance for this section/date is locked, teacher cannot write
    SELECT is_locked INTO v_is_locked
    FROM public.attendance_locks
    WHERE section_id = v_section_id AND date = NEW.date;

    IF v_is_locked = true THEN
      RAISE EXCEPTION 'Attendance for section % on date % is locked. Submit a correction request instead', v_section_id, NEW.date;
    END IF;
  END IF;

  -- 4. Upsert into canonical attendance_records
  INSERT INTO public.attendance_records (
    id, institution_id, session_id, class_id, section_id, student_id, enrollment_id,
    date, status, marked_by, remarks, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    v_session_id,
    v_class_id,
    v_section_id,
    NEW.student_id,
    v_enrollment_id,
    NEW.date,
    COALESCE(NEW.status, 'unmarked'::public.attendance_status),
    v_caller_id,
    NEW.remarks,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (institution_id, student_id, date) DO UPDATE SET
    status = EXCLUDED.status,
    remarks = EXCLUDED.remarks,
    marked_by = v_caller_id,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_instead_of_update_attendance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_inst_id UUID;
  v_section_id UUID;
  v_date DATE;
  v_is_admin BOOLEAN;
  v_is_allocated BOOLEAN;
  v_is_locked BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to update attendance';
  END IF;

  SELECT institution_id, section_id, date
  INTO v_inst_id, v_section_id, v_date
  FROM public.attendance_records
  WHERE id = OLD.id OR (student_id = OLD.student_id AND date = OLD.date);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attendance record not found for update';
  END IF;

  v_is_admin := public.auth_has_role(v_inst_id, ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]);
  IF NOT v_is_admin THEN
    IF public.auth_has_role(v_inst_id, ARRAY['student'::public.user_role, 'parent'::public.user_role]) THEN
      RAISE EXCEPTION 'Access Denied: Students and parents cannot update attendance';
    END IF;

    -- Check if locked
    SELECT is_locked INTO v_is_locked
    FROM public.attendance_locks
    WHERE section_id = v_section_id AND date = v_date;

    IF v_is_locked = true THEN
      RAISE EXCEPTION 'Attendance is locked. Submit a correction request instead';
    END IF;

    v_is_allocated := public.auth_is_teacher_allocated_for_attendance(v_section_id, NULL, v_caller_id);
    IF NOT v_is_allocated THEN
      RAISE EXCEPTION 'Access Denied: Teacher is not allocated to this section';
    END IF;
  END IF;

  UPDATE public.attendance_records SET
    status = COALESCE(NEW.status, attendance_records.status),
    remarks = COALESCE(NEW.remarks, attendance_records.remarks),
    marked_by = v_caller_id,
    updated_at = NOW()
  WHERE id = OLD.id OR (student_id = OLD.student_id AND date = OLD.date);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_instead_of_delete_attendance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_inst_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to delete attendance';
  END IF;

  SELECT institution_id INTO v_inst_id
  FROM public.attendance_records
  WHERE id = OLD.id;

  IF NOT FOUND THEN
    RETURN OLD;
  END IF;

  v_is_admin := public.auth_has_role(v_inst_id, ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]);
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access Denied: Only institution administrators can delete attendance records';
  END IF;

  DELETE FROM public.attendance_records WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_delete_attendance ON attendance;
CREATE TRIGGER trg_instead_of_delete_attendance
  INSTEAD OF DELETE ON attendance
  FOR EACH ROW EXECUTE FUNCTION public.fn_instead_of_delete_attendance();

-- ------------------------------------------------------------------------------
-- 5. SECURE STUDY NOTES COMPATIBILITY TRIGGERS (INSERT, UPDATE, DELETE)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_instead_of_insert_notes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_session_id UUID;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to upload notes';
  END IF;

  IF NOT public.auth_has_role(NEW.institution_id, ARRAY['teacher'::public.user_role, 'college_faculty'::public.user_role, 'school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]) THEN
    RAISE EXCEPTION 'Access Denied: Caller cannot upload study materials';
  END IF;

  SELECT id INTO v_session_id
  FROM public.academic_sessions
  WHERE institution_id = NEW.institution_id AND status = 'active'
  LIMIT 1;

  INSERT INTO public.study_notes (
    id, institution_id, session_id, class_id, subject_id, chapter_id,
    author_profile_id, title, content, note_type, file_url, is_published, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    v_session_id,
    NEW.class_id,
    NEW.subject_id,
    NEW.chapter_id,
    v_caller_id,
    NEW.title,
    COALESCE(NEW.content, NEW.description, 'Study Material'),
    COALESCE(NEW.file_type, 'text'),
    NEW.file_url,
    COALESCE(NEW.is_published, true),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    file_url = EXCLUDED.file_url,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_instead_of_update_notes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
  v_inst_id UUID;
  v_author_id UUID;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to edit notes';
  END IF;

  SELECT institution_id, author_profile_id
  INTO v_inst_id, v_author_id
  FROM public.study_notes
  WHERE id = OLD.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Note not found';
  END IF;

  IF v_author_id <> v_caller_id AND NOT public.auth_has_role(v_inst_id, ARRAY['school_admin'::public.user_role, 'college_admin'::public.user_role, 'super_admin'::public.user_role]) THEN
    RAISE EXCEPTION 'Access Denied: Only author or administrator can edit notes';
  END IF;

  UPDATE public.study_notes SET
    title = COALESCE(NEW.title, study_notes.title),
    content = COALESCE(NEW.content, NEW.description, study_notes.content),
    file_url = COALESCE(NEW.file_url, study_notes.file_url),
    is_published = COALESCE(NEW.is_published, study_notes.is_published),
    updated_at = NOW()
  WHERE id = OLD.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_update_notes ON notes;
CREATE TRIGGER trg_instead_of_update_notes
  INSTEAD OF UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION public.fn_instead_of_update_notes();

-- ------------------------------------------------------------------------------
-- 6. AUDIT LOGS IMMUTABILITY & CALLER SPOOFING PREVENTION
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_instead_of_insert_activity_logs()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '' AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required for activity logs';
  END IF;

  INSERT INTO public.audit_logs (
    id, institution_id, actor_profile_id, action, entity_type, entity_id, new_data, created_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    v_caller_id, -- Never trust client-supplied actor_id
    NEW.action,
    NEW.entity_type,
    COALESCE(NEW.entity_id, gen_random_uuid()),
    NEW.details,
    COALESCE(NEW.created_at, NOW())
  );
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. RE-APPLY HARDENED RLS POLICIES FOR MARKS AND ATTENDANCE
-- Paired USING and WITH CHECK clauses, allocation checks & strict tenant isolation
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "marks_insert" ON student_marks;
CREATE POLICY "marks_insert" ON student_marks FOR INSERT TO authenticated WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role])
    AND auth_is_teacher_allocated_for_mark(exam_subject_id, student_id, auth.uid())
  )
);

DROP POLICY IF EXISTS "marks_update" ON student_marks;
CREATE POLICY "marks_update" ON student_marks FOR UPDATE TO authenticated 
USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role]) 
    AND status IN ('draft', 'submitted')
    AND auth_is_teacher_allocated_for_mark(exam_subject_id, student_id, auth.uid())
  )
)
WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role]) 
    AND status IN ('draft', 'submitted')
    AND auth_is_teacher_allocated_for_mark(exam_subject_id, student_id, auth.uid())
  )
);

DROP POLICY IF EXISTS "att_insert" ON attendance_records;
CREATE POLICY "att_insert" ON attendance_records FOR INSERT TO authenticated WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role])
    AND auth_is_teacher_allocated_for_attendance(section_id, session_id, auth.uid())
    AND date <= CURRENT_DATE
  )
);

DROP POLICY IF EXISTS "att_update" ON attendance_records;
CREATE POLICY "att_update" ON attendance_records FOR UPDATE TO authenticated 
USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role])
    AND date = CURRENT_DATE
    AND auth_is_teacher_allocated_for_attendance(section_id, session_id, auth.uid())
    AND NOT EXISTS (SELECT 1 FROM attendance_locks al WHERE al.section_id = attendance_records.section_id AND al.date = attendance_records.date AND al.is_locked = true)
  )
)
WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role])
    AND date = CURRENT_DATE
    AND auth_is_teacher_allocated_for_attendance(section_id, session_id, auth.uid())
    AND NOT EXISTS (SELECT 1 FROM attendance_locks al WHERE al.section_id = attendance_records.section_id AND al.date = attendance_records.date AND al.is_locked = true)
  )
);

-- Paired WITH CHECK for general tenant tables
DROP POLICY IF EXISTS "classes_all" ON classes;
CREATE POLICY "classes_all" ON classes FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]))
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

DROP POLICY IF EXISTS "sections_all" ON sections;
CREATE POLICY "sections_all" ON sections FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]))
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

DROP POLICY IF EXISTS "subjects_all" ON subjects;
CREATE POLICY "subjects_all" ON subjects FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]))
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

DROP POLICY IF EXISTS "students_update" ON students;
CREATE POLICY "students_update" ON students FOR UPDATE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]))
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

DROP POLICY IF EXISTS "teachers_all" ON teachers;
CREATE POLICY "teachers_all" ON teachers FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]))
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

DROP POLICY IF EXISTS "timetables_all" ON timetables;
CREATE POLICY "timetables_all" ON timetables FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]))
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

DROP POLICY IF EXISTS "exams_all" ON examinations;
CREATE POLICY "exams_all" ON examinations FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]))
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- ------------------------------------------------------------------------------
-- 8. REVOKE DANGEROUS EXECUTE PERMISSIONS FROM PUBLIC AND ANON
-- ------------------------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.check_report_card_storage_access(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_report_card_storage_access(text, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.auth_is_teacher_allocated_for_mark(uuid, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_teacher_allocated_for_mark(uuid, uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.auth_is_teacher_allocated_for_attendance(uuid, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_teacher_allocated_for_attendance(uuid, uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_instead_of_insert_marks() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_instead_of_insert_marks() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_instead_of_update_marks() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_instead_of_update_marks() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_instead_of_delete_marks() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_instead_of_delete_marks() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_instead_of_insert_attendance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_instead_of_insert_attendance() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_instead_of_update_attendance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_instead_of_update_attendance() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_instead_of_delete_attendance() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_instead_of_delete_attendance() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_instead_of_insert_notes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_instead_of_insert_notes() TO authenticated;

-- ------------------------------------------------------------------------------
-- 9. FORCE ROW LEVEL SECURITY (Guarantees RLS is never bypassed by table owners)
-- ------------------------------------------------------------------------------

ALTER TABLE public.institutions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.institution_memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.classes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.sections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subjects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.teachers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subject_allocations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;
ALTER TABLE public.student_session_enrollments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.parents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians FORCE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records FORCE ROW LEVEL SECURITY;
ALTER TABLE public.examinations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subjects FORCE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.study_notes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.homework FORCE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

COMMIT;
