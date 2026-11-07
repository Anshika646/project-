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
      AND (institution_id = inst_id OR inst_id IS NULL)
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
    AND (p_session_id IS NULL OR tsa.session_id = p_session_id)
  UNION
  SELECT DISTINCT sec.id
  FROM sections sec
  WHERE sec.class_teacher_id = auth.uid();
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
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE admission_application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_status_history ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE study_note_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
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

-- 3. POLICIES: INSTITUTIONS & SETTINGS
CREATE POLICY "inst_select" ON institutions FOR SELECT TO authenticated
  USING (id IN (SELECT auth_user_institutions()) OR auth_has_role(id, ARRAY['super_admin'::user_role]));

CREATE POLICY "inst_insert" ON institutions FOR INSERT TO authenticated
  WITH CHECK (auth_has_role(NULL, ARRAY['super_admin'::user_role]));

CREATE POLICY "inst_update" ON institutions FOR UPDATE TO authenticated
  USING (auth_has_role(id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "inst_delete" ON institutions FOR DELETE TO authenticated
  USING (auth_has_role(id, ARRAY['super_admin'::user_role]));

CREATE POLICY "inst_settings_select" ON institution_settings FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()) OR auth_has_role(institution_id, ARRAY['super_admin'::user_role]));

CREATE POLICY "inst_settings_all" ON institution_settings FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 4. POLICIES: PROFILES & MEMBERSHIPS
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid() 
    OR is_super_admin = true 
    OR institution_id IN (SELECT auth_user_institutions())
    OR EXISTS (
      SELECT 1 FROM institution_memberships im1
      JOIN institution_memberships im2 ON im1.institution_id = im2.institution_id
      WHERE im1.profile_id = auth.uid() AND im2.profile_id = profiles.id
    )
  );

CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid() 
    OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  );

CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (
    id = auth.uid() 
    OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  );

CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "memberships_select" ON institution_memberships FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "memberships_insert" ON institution_memberships FOR INSERT TO authenticated
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "memberships_update" ON institution_memberships FOR UPDATE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "memberships_delete" ON institution_memberships FOR DELETE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 5. POLICIES: SAAS PLATFORM (Plans, Subscriptions, Platform Settings, Support Tickets)
CREATE POLICY "plans_select" ON super_admin_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_admin" ON super_admin_plans FOR ALL TO authenticated USING (auth_has_role(NULL, ARRAY['super_admin'::user_role]));

CREATE POLICY "subs_select" ON institution_subscriptions FOR SELECT TO authenticated 
  USING (institution_id IN (SELECT auth_user_institutions()) OR auth_has_role(institution_id, ARRAY['super_admin'::user_role]));
CREATE POLICY "subs_admin" ON institution_subscriptions FOR ALL TO authenticated 
  USING (auth_has_role(institution_id, ARRAY['super_admin'::user_role]));

CREATE POLICY "sub_hist_select" ON subscription_history FOR SELECT TO authenticated 
  USING (institution_id IN (SELECT auth_user_institutions()) OR auth_has_role(institution_id, ARRAY['super_admin'::user_role]));
CREATE POLICY "sub_hist_admin" ON subscription_history FOR ALL TO authenticated 
  USING (auth_has_role(institution_id, ARRAY['super_admin'::user_role]));

CREATE POLICY "plat_settings_select" ON platform_settings FOR SELECT TO authenticated USING (auth_has_role(NULL, ARRAY['super_admin'::user_role]));
CREATE POLICY "plat_settings_admin" ON platform_settings FOR ALL TO authenticated USING (auth_has_role(NULL, ARRAY['super_admin'::user_role]));

CREATE POLICY "tickets_select" ON support_tickets FOR SELECT TO authenticated
  USING (creator_profile_id = auth.uid() OR institution_id IN (SELECT auth_user_institutions()) OR auth_has_role(NULL, ARRAY['super_admin'::user_role]));
CREATE POLICY "tickets_insert" ON support_tickets FOR INSERT TO authenticated
  WITH CHECK (institution_id IN (SELECT auth_user_institutions()) OR creator_profile_id = auth.uid());
CREATE POLICY "tickets_update" ON support_tickets FOR UPDATE TO authenticated
  USING (creator_profile_id = auth.uid() OR auth_has_role(NULL, ARRAY['super_admin'::user_role]));

-- 6. POLICIES: ACADEMIC CORE (Sessions, Classes, Offerings, Sections, Subjects, Chapters)
CREATE POLICY "sessions_select" ON academic_sessions FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "sessions_all" ON academic_sessions FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "classes_select" ON classes FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "classes_all" ON classes FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "offerings_select" ON class_session_offerings FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "offerings_all" ON class_session_offerings FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "sections_select" ON sections FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "sections_all" ON sections FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "subjects_select" ON subjects FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "subjects_all" ON subjects FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "session_subjects_select" ON session_class_subjects FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "session_subjects_all" ON session_class_subjects FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "chapters_select" ON chapters FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "chapters_all" ON chapters FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role, 'college_faculty'::user_role, 'super_admin'::user_role]));

-- 7. POLICIES: FACULTY & WORKLOAD
CREATE POLICY "staff_dept_select" ON staff_departments FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "staff_dept_all" ON staff_departments FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "teachers_select" ON teachers FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()) AND is_deleted = false);
CREATE POLICY "teachers_all" ON teachers FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "alloc_select" ON teacher_subject_allocations FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "alloc_all" ON teacher_subject_allocations FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 8. POLICIES: STUDENTS & GUARDIANS
CREATE POLICY "students_select" ON students FOR SELECT TO authenticated USING (
  (institution_id IN (SELECT auth_user_institutions()) AND is_deleted = false)
  OR profile_id = auth.uid()
  OR id IN (SELECT auth_parent_students())
);
CREATE POLICY "students_insert" ON students FOR INSERT TO authenticated
  WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));
CREATE POLICY "students_update" ON students FOR UPDATE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));
CREATE POLICY "students_delete" ON students FOR DELETE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "enrollments_select" ON student_session_enrollments FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()) OR student_id = (SELECT id FROM students WHERE profile_id = auth.uid()) OR student_id IN (SELECT auth_parent_students()));
CREATE POLICY "enrollments_all" ON student_session_enrollments FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "parents_select" ON parents FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()) OR profile_id = auth.uid());
CREATE POLICY "parents_all" ON parents FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "guardians_select" ON student_guardians FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()) OR parent_id = (SELECT id FROM parents WHERE profile_id = auth.uid()) OR student_id = (SELECT id FROM students WHERE profile_id = auth.uid()));
CREATE POLICY "guardians_all" ON student_guardians FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 9. POLICIES: ADMISSIONS
CREATE POLICY "enquiries_select" ON admission_enquiries FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "enquiries_all" ON admission_enquiries FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "adm_apps_select" ON admission_applications FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()) OR reviewed_by = auth.uid());
CREATE POLICY "adm_apps_all" ON admission_applications FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "adm_docs_all" ON admission_application_documents FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "adm_hist_all" ON admission_status_history FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 10. POLICIES: TIMETABLE & CALENDAR
CREATE POLICY "calendar_select" ON school_calendars FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "calendar_all" ON school_calendars FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "tt_periods_select" ON timetable_periods FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "tt_periods_all" ON timetable_periods FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "timetables_select" ON timetables FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "timetables_all" ON timetables FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "tt_slots_select" ON timetable_slots FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "tt_slots_all" ON timetable_slots FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 11. POLICIES: ATTENDANCE
CREATE POLICY "att_select" ON attendance_records FOR SELECT TO authenticated USING (
  institution_id IN (SELECT auth_user_institutions())
  OR student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  OR student_id IN (SELECT auth_parent_students())
);

CREATE POLICY "att_insert" ON attendance_records FOR INSERT TO authenticated WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'teacher'::user_role, 'college_faculty'::user_role, 'super_admin'::user_role])
);

CREATE POLICY "att_update" ON attendance_records FOR UPDATE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role])
    AND date = CURRENT_DATE
    AND NOT EXISTS (SELECT 1 FROM attendance_locks al WHERE al.section_id = attendance_records.section_id AND al.date = attendance_records.date AND al.is_locked = true)
  )
);

CREATE POLICY "att_delete" ON attendance_records FOR DELETE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
);

CREATE POLICY "att_locks_all" ON attendance_locks FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "att_req_select" ON attendance_correction_requests FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "att_req_insert" ON attendance_correction_requests FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid() OR auth_has_role(institution_id, ARRAY['teacher'::user_role, 'school_admin'::user_role]));
CREATE POLICY "att_req_update" ON attendance_correction_requests FOR UPDATE TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'super_admin'::user_role]));

-- 12. POLICIES: EXAMS & MARKS
CREATE POLICY "exams_select" ON examinations FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "exams_all" ON examinations FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "exam_sub_select" ON exam_subjects FOR SELECT TO authenticated
  USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "exam_sub_all" ON exam_subjects FOR ALL TO authenticated
  USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "marks_select" ON student_marks FOR SELECT TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role, 'teacher'::user_role, 'college_faculty'::user_role])
  OR (student_id = (SELECT id FROM students WHERE profile_id = auth.uid()))
  OR (student_id IN (SELECT auth_parent_students()))
);

CREATE POLICY "marks_insert" ON student_marks FOR INSERT TO authenticated WITH CHECK (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'teacher'::user_role, 'college_faculty'::user_role, 'super_admin'::user_role])
);

CREATE POLICY "marks_update" ON student_marks FOR UPDATE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  OR (
    auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role]) 
    AND status IN ('draft', 'submitted')
  )
);

CREATE POLICY "marks_delete" ON student_marks FOR DELETE TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
);

CREATE POLICY "grading_select" ON grading_systems FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "grading_all" ON grading_systems FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "boundaries_select" ON grade_boundaries FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "boundaries_all" ON grade_boundaries FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "rc_select" ON student_report_cards FOR SELECT TO authenticated USING (
  institution_id IN (SELECT auth_user_institutions())
  OR (is_published = true AND (student_id = (SELECT id FROM students WHERE profile_id = auth.uid()) OR student_id IN (SELECT auth_parent_students())))
);
CREATE POLICY "rc_all" ON student_report_cards FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "rc_pub_all" ON report_card_publications FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 13. POLICIES: DIGITAL LEARNING (Notes, Homework, Quizzes)
CREATE POLICY "notes_select" ON study_notes FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "notes_insert" ON study_notes FOR INSERT TO authenticated WITH CHECK (auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role, 'school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));
CREATE POLICY "notes_update" ON study_notes FOR UPDATE TO authenticated USING (author_profile_id = auth.uid() OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));
CREATE POLICY "notes_delete" ON study_notes FOR DELETE TO authenticated USING (author_profile_id = auth.uid() OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "note_att_select" ON study_note_attachments FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "note_att_all" ON study_note_attachments FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role, 'school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "note_logs_select" ON note_download_logs FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "note_logs_insert" ON note_download_logs FOR INSERT TO authenticated WITH CHECK (student_profile_id = auth.uid());

CREATE POLICY "hw_select" ON homework FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "hw_insert" ON homework FOR INSERT TO authenticated WITH CHECK (auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role, 'school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));
CREATE POLICY "hw_update" ON homework FOR UPDATE TO authenticated USING (teacher_profile_id = auth.uid() OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));
CREATE POLICY "hw_delete" ON homework FOR DELETE TO authenticated USING (teacher_profile_id = auth.uid() OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "hw_att_all" ON homework_attachments FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role, 'school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "hw_sub_select" ON homework_submissions FOR SELECT TO authenticated USING (
  institution_id IN (SELECT auth_user_institutions())
  OR student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  OR student_id IN (SELECT auth_parent_students())
);
CREATE POLICY "hw_sub_insert" ON homework_submissions FOR INSERT TO authenticated WITH CHECK (
  student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  OR auth_has_role(institution_id, ARRAY['teacher'::user_role, 'school_admin'::user_role])
);
CREATE POLICY "hw_sub_update" ON homework_submissions FOR UPDATE TO authenticated USING (
  student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  OR auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role, 'school_admin'::user_role, 'college_admin'::user_role])
);

CREATE POLICY "quizzes_select" ON quizzes FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "quizzes_all" ON quizzes FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role, 'school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "quiz_q_select" ON quiz_questions FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "quiz_q_all" ON quiz_questions FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['teacher'::user_role, 'college_faculty'::user_role, 'school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "quiz_att_select" ON quiz_attempts FOR SELECT TO authenticated USING (
  institution_id IN (SELECT auth_user_institutions())
  OR student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "quiz_att_insert" ON quiz_attempts FOR INSERT TO authenticated WITH CHECK (
  student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  OR auth_has_role(institution_id, ARRAY['teacher'::user_role, 'school_admin'::user_role])
);
CREATE POLICY "quiz_att_update" ON quiz_attempts FOR UPDATE TO authenticated USING (
  student_id = (SELECT id FROM students WHERE profile_id = auth.uid())
  OR auth_has_role(institution_id, ARRAY['teacher'::user_role, 'school_admin'::user_role])
);

CREATE POLICY "quiz_answers_all" ON quiz_attempt_answers FOR ALL TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));

-- 14. POLICIES: NOTICES, NOTIFICATIONS & PTM
CREATE POLICY "notices_select" ON notices FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "notices_all" ON notices FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "notice_read_all" ON notice_read_receipts FOR ALL TO authenticated USING (profile_id = auth.uid() OR auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role]));

CREATE POLICY "notif_select" ON in_app_notifications FOR SELECT TO authenticated USING (recipient_profile_id = auth.uid());
CREATE POLICY "notif_update" ON in_app_notifications FOR UPDATE TO authenticated USING (recipient_profile_id = auth.uid());
CREATE POLICY "notif_insert" ON in_app_notifications FOR INSERT TO authenticated WITH CHECK (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "notif_pref_all" ON notification_preferences FOR ALL TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "ptm_ses_select" ON ptm_sessions FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "ptm_ses_all" ON ptm_sessions FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "ptm_book_select" ON ptm_bookings FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "ptm_book_insert" ON ptm_bookings FOR INSERT TO authenticated WITH CHECK (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "ptm_book_update" ON ptm_bookings FOR UPDATE TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "ptm_book_delete" ON ptm_bookings FOR DELETE TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 15. POLICIES: PROMOTIONS & TRANSFERS
CREATE POLICY "promotions_select" ON student_promotions FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "promotions_all" ON student_promotions FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "tc_select" ON transfer_certificates FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "tc_all" ON transfer_certificates FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role]));

-- 16. POLICIES: HIGHER ED & COLLEGE ERP
CREATE POLICY "clg_dept_select" ON college_departments FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "clg_dept_all" ON college_departments FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "clg_course_select" ON college_courses FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "clg_course_all" ON college_courses FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "clg_sem_select" ON college_semesters FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "clg_sem_all" ON college_semesters FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "clg_sub_select" ON college_semester_subjects FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "clg_sub_all" ON college_semester_subjects FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "clg_enroll_select" ON college_student_enrollments FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "clg_enroll_all" ON college_student_enrollments FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['college_admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "clg_reg_select" ON college_subject_registrations FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "clg_reg_all" ON college_subject_registrations FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['college_admin'::user_role, 'college_faculty'::user_role, 'super_admin'::user_role]));

CREATE POLICY "clg_backlog_select" ON college_backlogs FOR SELECT TO authenticated USING (institution_id IN (SELECT auth_user_institutions()));
CREATE POLICY "clg_backlog_all" ON college_backlogs FOR ALL TO authenticated USING (auth_has_role(institution_id, ARRAY['college_admin'::user_role, 'super_admin'::user_role]));

-- 17. POLICIES: AUDIT LOGS (Read-Only to Tenant Admins; Modifying Revoked)
CREATE POLICY "audit_select" ON audit_logs FOR SELECT TO authenticated USING (
  auth_has_role(institution_id, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
);

COMMIT;
