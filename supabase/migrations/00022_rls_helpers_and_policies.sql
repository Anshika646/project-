-- ==============================================================================
-- EDUNEXA MIGRATION 00022: RLS SECURITY HELPERS & POLICIES
-- Granular SELECT, INSERT, UPDATE, DELETE Rules Across Every Tenant Table
-- ==============================================================================

BEGIN;

-- 1. Helper Security Functions (Hardened with fixed search_path)
CREATE OR REPLACE FUNCTION auth_user_institutions()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT institution_id 
  FROM institution_memberships 
  WHERE profile_id = auth.uid() 
    AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION auth_has_role(inst_id UUID, required_roles user_role[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM institution_memberships
    WHERE profile_id = auth.uid()
      AND institution_id = inst_id
      AND role = ANY(required_roles)
      AND is_active = true
  ) OR EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
      AND is_super_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION auth_teacher_sections(p_session_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT DISTINCT tsa.section_id 
  FROM teacher_subject_allocations tsa
  JOIN teachers t ON t.id = tsa.teacher_id
  WHERE t.profile_id = auth.uid()
    AND tsa.session_id = p_session_id;
$$;

CREATE OR REPLACE FUNCTION auth_parent_students()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT DISTINCT sg.student_id 
  FROM student_guardians sg
  JOIN parents p ON p.id = sg.parent_id
  WHERE p.profile_id = auth.uid();
$$;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_session_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subject_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_session_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_card_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptm_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_semester_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_subject_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_backlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES: INSTITUTIONS & MEMBERSHIPS
CREATE POLICY "inst_select" ON institutions FOR SELECT TO authenticated
  USING (id IN (SELECT auth_user_institutions()) OR auth_has_role(id, ARRAY['super_admin'::user_role]));

CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_super_admin = true OR EXISTS (
    SELECT 1 FROM institution_memberships im1
    JOIN institution_memberships im2 ON im1.institution_id = im2.institution_id
    WHERE im1.profile_id = auth.uid() AND im2.profile_id = profiles.id
  ));

CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "memberships_select" ON institution_memberships FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "memberships_insert" ON institution_memberships FOR INSERT TO authenticated
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "memberships_update" ON institution_memberships FOR UPDATE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "memberships_delete" ON institution_memberships FOR DELETE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 4. POLICIES: ATTENDANCE RECORDS (Explicit Separation: Teachers CANNOT Delete)
CREATE POLICY "att_select" ON attendance_records FOR SELECT TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role]) AND section_id IN (SELECT auth_teacher_sections(session_id)))
  OR student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  OR student_id IN (SELECT auth_parent_students())
);

CREATE POLICY "att_insert" ON attendance_records FOR INSERT TO authenticated WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  OR (auth_has_role(institution_id, ARRAY['teacher'::user_role]) AND section_id IN (SELECT auth_teacher_sections(session_id)))
);

CREATE POLICY "att_update" ON attendance_records FOR UPDATE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role]) 
    AND section_id IN (SELECT auth_teacher_sections(session_id))
    AND date = CURRENT_DATE
    AND NOT EXISTS (SELECT 1 FROM attendance_locks al WHERE al.section_id = attendance_records.section_id AND al.date = attendance_records.date AND al.is_locked = true)
  )
);

CREATE POLICY "att_delete" ON attendance_records FOR DELETE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
);

-- 5. POLICIES: STUDENT MARKS (Explicit Separation: Teachers CANNOT Delete; Locked after Approval)
CREATE POLICY "marks_select" ON student_marks FOR SELECT TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (auth_has_role(institution_id, ARRAY['teacher'::user_role]) AND exam_subject_id IN (
    SELECT es.id FROM exam_subjects es 
    JOIN teacher_subject_allocations tsa ON tsa.subject_id = es.subject_id
    JOIN teachers t ON t.id = tsa.teacher_id
    WHERE t.profile_id = auth.uid()
  ))
  OR (status = 'approved' AND student_id = (SELECT id FROM students WHERE profile_id = auth.uid()))
  OR (status = 'approved' AND student_id IN (SELECT auth_parent_students()))
);

CREATE POLICY "marks_insert" ON student_marks FOR INSERT TO authenticated WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  OR (auth_has_role(institution_id, ARRAY['teacher'::user_role]) AND exam_subject_id IN (
    SELECT es.id FROM exam_subjects es 
    JOIN teacher_subject_allocations tsa ON tsa.subject_id = es.subject_id
    JOIN teachers t ON t.id = tsa.teacher_id
    WHERE t.profile_id = auth.uid()
  ))
);

CREATE POLICY "marks_update" ON student_marks FOR UPDATE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role]) 
    AND status IN ('draft', 'submitted')
    AND exam_subject_id IN (
      SELECT es.id FROM exam_subjects es 
      JOIN teacher_subject_allocations tsa ON tsa.subject_id = es.subject_id
      JOIN teachers t ON t.id = tsa.teacher_id
      WHERE t.profile_id = auth.uid()
    )
  )
);

CREATE POLICY "marks_delete" ON student_marks FOR DELETE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
);

-- 6. POLICIES: STUDENTS & GUARDIANS
CREATE POLICY "students_select" ON students FOR SELECT TO authenticated USING (
  (institution_id IN (SELECT auth_user_institutions()) AND is_deleted = false AND auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role, 'college_faculty'::user_role]))
  OR profile_id = auth.uid()
  OR id IN (SELECT auth_parent_students())
);

CREATE POLICY "students_insert" ON students FOR INSERT TO authenticated
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role]));

CREATE POLICY "students_update" ON students FOR UPDATE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role]));

CREATE POLICY "students_delete" ON students FOR DELETE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role]));

-- 7. POLICIES: AUDIT LOGS (Read-Only to Tenant Admins; Modifying Revoked)
CREATE POLICY "audit_select" ON audit_logs FOR SELECT TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
);

COMMIT;
