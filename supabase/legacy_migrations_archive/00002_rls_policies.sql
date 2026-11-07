-- ==============================================================================
-- EDUNEXA — ROW LEVEL SECURITY POLICIES (RLS)
-- Enforces multi-tenancy (institution_id) & strict role-based access
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptm_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- INSTITUTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Super Admins can view all institutions"
  ON institutions FOR SELECT
  TO authenticated
  USING (auth_role() = 'super_admin');

CREATE POLICY "Super Admins can mutate institutions"
  ON institutions FOR ALL
  TO authenticated
  USING (auth_role() = 'super_admin');

CREATE POLICY "Users can view their own institution"
  ON institutions FOR SELECT
  TO authenticated
  USING (id = auth_institution_id());

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view profiles in their institution"
  ON profiles FOR SELECT
  TO authenticated
  USING (institution_id = auth_institution_id() OR auth_role() = 'super_admin');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their institution"
  ON profiles FOR ALL
  TO authenticated
  USING (
    auth_role() = 'super_admin' OR 
    (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin'))
  );

-- ------------------------------------------------------------------------------
-- STUDENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Institution members can view non-deleted students"
  ON students FOR SELECT
  TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    (is_deleted = false OR auth_role() IN ('school_admin', 'college_admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage students in their institution"
  ON students FOR ALL
  TO authenticated
  USING (
    auth_role() = 'super_admin' OR 
    (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin'))
  );

-- ------------------------------------------------------------------------------
-- TEACHERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Institution members can view non-deleted teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    (is_deleted = false OR auth_role() IN ('school_admin', 'college_admin', 'super_admin'))
  );

CREATE POLICY "Admins can manage teachers in their institution"
  ON teachers FOR ALL
  TO authenticated
  USING (
    auth_role() = 'super_admin' OR 
    (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin'))
  );

-- ------------------------------------------------------------------------------
-- CLASSES, SECTIONS, SUBJECTS, CHAPTERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Tenant members can view classes"
  ON classes FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id() OR auth_role() = 'super_admin');

CREATE POLICY "Admins can manage classes"
  ON classes FOR ALL TO authenticated
  USING (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin'));

CREATE POLICY "Tenant members can view sections"
  ON sections FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id() OR auth_role() = 'super_admin');

CREATE POLICY "Admins can manage sections"
  ON sections FOR ALL TO authenticated
  USING (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin'));

CREATE POLICY "Tenant members can view subjects"
  ON subjects FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id() OR auth_role() = 'super_admin');

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL TO authenticated
  USING (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin'));

CREATE POLICY "Tenant members can view chapters"
  ON chapters FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id() OR auth_role() = 'super_admin');

CREATE POLICY "Staff can manage chapters"
  ON chapters FOR ALL TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

-- ------------------------------------------------------------------------------
-- ATTENDANCE POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins and teachers can view all attendance in institution"
  ON attendance FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

CREATE POLICY "Students can only view their own attendance"
  ON attendance FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can only view their linked children's attendance"
  ON attendance FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND
    student_id IN (
      SELECT psl.student_id 
      FROM parent_student_links psl
      JOIN parents p ON p.id = psl.parent_id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers and admins can mark/edit attendance"
  ON attendance FOR ALL TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

-- ------------------------------------------------------------------------------
-- EXAMS, EXAM SUBJECTS, MARKS & REPORT CARDS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Tenant members can view published exams"
  ON exams FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    (is_published = true OR auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty'))
  );

CREATE POLICY "Staff can manage exams"
  ON exams FOR ALL TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

CREATE POLICY "Tenant members can view exam subjects"
  ON exam_subjects FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id() OR auth_role() = 'super_admin');

CREATE POLICY "Staff can manage exam subjects"
  ON exam_subjects FOR ALL TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

-- MARKS POLICIES: Student can only view own marks!
CREATE POLICY "Admins and teachers can view all marks in institution"
  ON marks FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

CREATE POLICY "Students can only view their own marks"
  ON marks FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can only view their children's marks"
  ON marks FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND
    student_id IN (
      SELECT psl.student_id 
      FROM parent_student_links psl
      JOIN parents p ON p.id = psl.parent_id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Staff can enter and edit marks"
  ON marks FOR ALL TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

-- REPORT CARDS POLICIES
CREATE POLICY "Admins and teachers can view all report cards"
  ON report_cards FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

CREATE POLICY "Students can view only their own report cards"
  ON report_cards FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can view only their children's report cards"
  ON report_cards FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND
    student_id IN (
      SELECT psl.student_id 
      FROM parent_student_links psl
      JOIN parents p ON p.id = psl.parent_id
      WHERE p.profile_id = auth.uid()
    )
  );

CREATE POLICY "Staff can generate and edit report cards"
  ON report_cards FOR ALL TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

-- ------------------------------------------------------------------------------
-- NOTES & STUDY MATERIAL POLICIES
-- Students can download all published notes for their class
-- ------------------------------------------------------------------------------
CREATE POLICY "Students can view notes for their class"
  ON notes FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    is_published = true AND
    (
      auth_role() NOT IN ('student') OR 
      class_id IN (SELECT class_id FROM students WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage notes"
  ON notes FOR ALL TO authenticated
  USING (
    institution_id = auth_institution_id() AND 
    auth_role() IN ('school_admin', 'college_admin', 'teacher', 'college_faculty')
  );

-- ------------------------------------------------------------------------------
-- QUIZZES, ATTEMPTS & HOMEWORK
-- ------------------------------------------------------------------------------
CREATE POLICY "Tenant members can view published quizzes"
  ON quizzes FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id() AND (is_published = true OR auth_role() IN ('teacher', 'school_admin')));

CREATE POLICY "Teachers can manage quizzes"
  ON quizzes FOR ALL TO authenticated
  USING (institution_id = auth_institution_id() AND auth_role() IN ('teacher', 'school_admin'));

CREATE POLICY "Students can view quiz questions when taking quiz"
  ON quiz_questions FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id());

CREATE POLICY "Students can submit quiz attempts"
  ON quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (
    institution_id = auth_institution_id() AND
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Students view own quiz attempts"
  ON quiz_attempts FOR SELECT TO authenticated
  USING (
    institution_id = auth_institution_id() AND
    (
      student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()) OR
      auth_role() IN ('teacher', 'school_admin', 'college_admin')
    )
  );

-- ------------------------------------------------------------------------------
-- NOTICES & ACTIVITY LOGS
-- ------------------------------------------------------------------------------
CREATE POLICY "Tenant members can view published notices"
  ON notices FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id());

CREATE POLICY "Admins and teachers can publish notices"
  ON notices FOR ALL TO authenticated
  USING (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin', 'teacher'));

CREATE POLICY "Tenant members can view their institution activity logs"
  ON activity_logs FOR SELECT TO authenticated
  USING (institution_id = auth_institution_id() AND auth_role() IN ('school_admin', 'college_admin', 'super_admin'));

CREATE POLICY "System can record activity logs"
  ON activity_logs FOR INSERT TO authenticated
  WITH CHECK (institution_id = auth_institution_id());
