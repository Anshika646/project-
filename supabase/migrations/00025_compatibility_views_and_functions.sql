-- ==============================================================================
-- EDUNEXA MIGRATION 00025: UPDATABLE COMPATIBILITY VIEWS & INTEGRITY TRIGGERS
-- Replaces Duplicate Compatibility Tables with Zero-Duplicate Updatable Views
-- Eliminates Recursive Trigger Chains, Ensures Transactional Consistency & Protects Academic History
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Compatibility View: parent_student_links (Maps to student_guardians)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW parent_student_links AS
SELECT 
  sg.id,
  sg.institution_id,
  sg.parent_id,
  sg.student_id,
  sg.relationship,
  sg.is_primary,
  sg.created_at,
  sg.updated_at
FROM student_guardians sg;

-- ------------------------------------------------------------------------------
-- 2. Compatibility View: student_directory_view (Canonical Active Academic View)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW student_directory_view AS
SELECT 
  s.id,
  s.institution_id,
  s.profile_id,
  s.admission_number,
  s.first_name,
  s.last_name,
  CONCAT(s.first_name, ' ', s.last_name) AS full_name,
  s.gender,
  s.date_of_birth,
  s.blood_group,
  s.emergency_contact,
  s.residential_address AS address,
  s.is_deleted,
  COALESCE(se.section_id, s.section_id) AS section_id,
  COALESCE(s.class_id, cso.class_id) AS class_id,
  COALESCE(se.roll_number, s.roll_number) AS roll_number,
  se.session_id,
  se.offering_id,
  se.enrollment_status,
  c.name AS class_name,
  c.grade_level,
  sec.name AS section_name,
  s.created_at,
  s.updated_at
FROM students s
LEFT JOIN student_session_enrollments se ON se.student_id = s.id AND se.enrollment_status = 'active'
LEFT JOIN class_session_offerings cso ON cso.id = se.offering_id
LEFT JOIN classes c ON c.id = COALESCE(s.class_id, cso.class_id)
LEFT JOIN sections sec ON sec.id = COALESCE(se.section_id, s.section_id);

-- ------------------------------------------------------------------------------
-- 3. Compatibility View: exam_marks_ledger_view (Joins marks, students, and subjects)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW exam_marks_ledger_view AS
SELECT 
  sm.id,
  sm.institution_id,
  sm.exam_subject_id,
  sm.enrollment_id,
  sm.student_id,
  s.admission_number,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  COALESCE(sm.enrollment_id, s.id) AS student_ref,
  COALESCE(se.roll_number, s.roll_number) AS roll_number,
  COALESCE(se.section_id, s.section_id) AS section_id,
  es.examination_id,
  es.subject_id,
  sub.name AS subject_name,
  sm.theory_marks,
  sm.practical_marks,
  sm.internal_marks,
  sm.total_marks,
  sm.percentage,
  sm.grade,
  sm.is_absent,
  sm.status,
  sm.remarks,
  sm.created_at,
  sm.updated_at
FROM student_marks sm
JOIN students s ON s.id = sm.student_id
LEFT JOIN student_session_enrollments se ON se.id = sm.enrollment_id
JOIN exam_subjects es ON es.id = sm.exam_subject_id
JOIN subjects sub ON sub.id = es.subject_id;

-- ------------------------------------------------------------------------------
-- 4. Clean up any physical compatibility tables to avoid duplicate storage
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_sync_marks ON marks;
DROP TABLE IF EXISTS marks CASCADE;

DROP TRIGGER IF EXISTS trg_sync_attendance ON attendance;
DROP TABLE IF EXISTS attendance CASCADE;

DROP TRIGGER IF EXISTS trg_sync_notes ON notes;
DROP TABLE IF EXISTS notes CASCADE;

DROP TABLE IF EXISTS activity_logs CASCADE;

-- ------------------------------------------------------------------------------
-- 5. Updatable Compatibility View: marks (Routes to student_marks with Strict Integrity)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW marks AS
SELECT 
  sm.id,
  sm.institution_id,
  sm.exam_subject_id,
  sm.enrollment_id,
  sm.student_id,
  sm.theory_marks,
  sm.practical_marks,
  sm.internal_marks,
  sm.total_marks,
  sm.percentage,
  sm.grade,
  sm.is_absent,
  sm.remarks,
  sm.entered_by AS graded_by,
  sm.created_at,
  sm.updated_at
FROM student_marks sm;

-- INSTEAD OF INSERT ON marks: Enforces valid enrollment, session and institution relationship
CREATE OR REPLACE FUNCTION fn_instead_of_insert_marks()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_session_id UUID;
  v_inst_id UUID;
  v_enrollment_id UUID;
BEGIN
  -- 1. Resolve examination session and institution
  SELECT e.session_id, e.institution_id 
  INTO v_session_id, v_inst_id
  FROM exam_subjects es
  JOIN examinations e ON e.id = es.examination_id
  WHERE es.id = NEW.exam_subject_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot record mark: exam_subject_id % does not exist', NEW.exam_subject_id;
  END IF;

  -- 2. Verify student institution consistency
  IF NEW.institution_id IS NOT NULL AND NEW.institution_id <> v_inst_id THEN
    RAISE EXCEPTION 'Tenant isolation violation: Institution mismatch between mark and exam';
  END IF;
  NEW.institution_id := v_inst_id;

  -- 3. Resolve student enrollment for the examination session
  IF NEW.enrollment_id IS NOT NULL THEN
    SELECT id INTO v_enrollment_id
    FROM student_session_enrollments
    WHERE id = NEW.enrollment_id AND student_id = NEW.student_id AND session_id = v_session_id;
  ELSE
    SELECT id INTO v_enrollment_id
    FROM student_session_enrollments
    WHERE student_id = NEW.student_id AND session_id = v_session_id AND enrollment_status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- If student has no enrollment in this session, reject insertion
  IF v_enrollment_id IS NULL THEN
    RAISE EXCEPTION 'Academic Integrity Failure: Student % has no active enrollment in academic session % for this exam', NEW.student_id, v_session_id;
  END IF;

  NEW.enrollment_id := v_enrollment_id;

  -- 4. Insert or update student_marks atomically
  INSERT INTO student_marks (
    id, institution_id, exam_subject_id, enrollment_id, student_id,
    theory_marks, practical_marks, internal_marks, grade, is_absent, remarks, entered_by, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    NEW.exam_subject_id,
    NEW.enrollment_id,
    NEW.student_id,
    COALESCE(NEW.theory_marks, 0.00),
    COALESCE(NEW.practical_marks, 0.00),
    COALESCE(NEW.internal_marks, 0.00),
    COALESCE(NEW.grade, 'E'),
    COALESCE(NEW.is_absent, false),
    NEW.remarks,
    COALESCE(NEW.graded_by, auth.uid()),
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (exam_subject_id, student_id) DO UPDATE SET
    theory_marks = EXCLUDED.theory_marks,
    practical_marks = EXCLUDED.practical_marks,
    internal_marks = EXCLUDED.internal_marks,
    grade = EXCLUDED.grade,
    is_absent = EXCLUDED.is_absent,
    remarks = EXCLUDED.remarks,
    entered_by = COALESCE(EXCLUDED.entered_by, student_marks.entered_by),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_insert_marks ON marks;
CREATE TRIGGER trg_instead_of_insert_marks
  INSTEAD OF INSERT ON marks
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_insert_marks();

-- INSTEAD OF UPDATE ON marks
CREATE OR REPLACE FUNCTION fn_instead_of_update_marks()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE student_marks SET
    theory_marks = COALESCE(NEW.theory_marks, student_marks.theory_marks),
    practical_marks = COALESCE(NEW.practical_marks, student_marks.practical_marks),
    internal_marks = COALESCE(NEW.internal_marks, student_marks.internal_marks),
    grade = COALESCE(NEW.grade, student_marks.grade),
    is_absent = COALESCE(NEW.is_absent, student_marks.is_absent),
    remarks = COALESCE(NEW.remarks, student_marks.remarks),
    entered_by = COALESCE(NEW.graded_by, student_marks.entered_by),
    updated_at = NOW()
  WHERE id = OLD.id OR (exam_subject_id = OLD.exam_subject_id AND student_id = OLD.student_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_update_marks ON marks;
CREATE TRIGGER trg_instead_of_update_marks
  INSTEAD OF UPDATE ON marks
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_update_marks();

-- INSTEAD OF DELETE ON marks
CREATE OR REPLACE FUNCTION fn_instead_of_delete_marks()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
BEGIN
  DELETE FROM student_marks WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_delete_marks ON marks;
CREATE TRIGGER trg_instead_of_delete_marks
  INSTEAD OF DELETE ON marks
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_delete_marks();

-- ------------------------------------------------------------------------------
-- 6. Updatable Compatibility View: attendance (Routes to attendance_records)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW attendance AS
SELECT 
  ar.id,
  ar.institution_id,
  ar.student_id,
  ar.class_id,
  ar.section_id,
  ar.date,
  ar.status,
  ar.marked_by,
  ar.remarks,
  ar.created_at,
  ar.updated_at
FROM attendance_records ar;

-- INSTEAD OF INSERT ON attendance: Enforces Session Scoping and Valid Student
CREATE OR REPLACE FUNCTION fn_instead_of_insert_attendance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_session_id UUID;
  v_enrollment_id UUID;
BEGIN
  -- 1. Resolve institution active session
  SELECT id INTO v_session_id
  FROM academic_sessions
  WHERE institution_id = NEW.institution_id AND status = 'active'
  ORDER BY start_date DESC
  LIMIT 1;

  -- 2. Resolve student active enrollment
  SELECT id INTO v_enrollment_id
  FROM student_session_enrollments
  WHERE student_id = NEW.student_id AND institution_id = NEW.institution_id AND enrollment_status = 'active'
  LIMIT 1;

  -- 3. Upsert into canonical attendance_records
  INSERT INTO attendance_records (
    id, institution_id, session_id, class_id, section_id, student_id, enrollment_id,
    date, status, marked_by, remarks, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    v_session_id,
    NEW.class_id,
    NEW.section_id,
    NEW.student_id,
    v_enrollment_id,
    NEW.date,
    COALESCE(NEW.status, 'unmarked'),
    COALESCE(NEW.marked_by, auth.uid()),
    NEW.remarks,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.updated_at, NOW())
  )
  ON CONFLICT (institution_id, student_id, date) DO UPDATE SET
    status = EXCLUDED.status,
    remarks = EXCLUDED.remarks,
    marked_by = COALESCE(EXCLUDED.marked_by, attendance_records.marked_by),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_insert_attendance ON attendance;
CREATE TRIGGER trg_instead_of_insert_attendance
  INSTEAD OF INSERT ON attendance
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_insert_attendance();

-- INSTEAD OF UPDATE ON attendance
CREATE OR REPLACE FUNCTION fn_instead_of_update_attendance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE attendance_records SET
    status = COALESCE(NEW.status, attendance_records.status),
    remarks = COALESCE(NEW.remarks, attendance_records.remarks),
    marked_by = COALESCE(NEW.marked_by, attendance_records.marked_by),
    updated_at = NOW()
  WHERE id = OLD.id OR (student_id = OLD.student_id AND date = OLD.date);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_update_attendance ON attendance;
CREATE TRIGGER trg_instead_of_update_attendance
  INSTEAD OF UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_update_attendance();

-- ------------------------------------------------------------------------------
-- 7. Updatable Compatibility View: notes (Routes to study_notes)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW notes AS
SELECT 
  sn.id,
  sn.institution_id,
  sn.class_id,
  sn.subject_id,
  sn.chapter_id,
  sn.title,
  sn.content AS description,
  sn.content,
  sn.file_url,
  sn.note_type AS file_type,
  sn.is_published,
  sn.author_profile_id AS uploaded_by,
  sn.created_at,
  sn.updated_at
FROM study_notes sn;

CREATE OR REPLACE FUNCTION fn_instead_of_insert_notes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_session_id UUID;
BEGIN
  SELECT id INTO v_session_id
  FROM academic_sessions
  WHERE institution_id = NEW.institution_id AND status = 'active'
  LIMIT 1;

  INSERT INTO study_notes (
    id, institution_id, session_id, class_id, subject_id, chapter_id,
    author_profile_id, title, content, note_type, file_url, is_published, created_at, updated_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    v_session_id,
    NEW.class_id,
    NEW.subject_id,
    NEW.chapter_id,
    COALESCE(NEW.uploaded_by, auth.uid()),
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

DROP TRIGGER IF EXISTS trg_instead_of_insert_notes ON notes;
CREATE TRIGGER trg_instead_of_insert_notes
  INSTEAD OF INSERT ON notes
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_insert_notes();

CREATE OR REPLACE FUNCTION fn_instead_of_delete_notes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
BEGIN
  DELETE FROM study_notes WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_delete_notes ON notes;
CREATE TRIGGER trg_instead_of_delete_notes
  INSTEAD OF DELETE ON notes
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_delete_notes();

-- ------------------------------------------------------------------------------
-- 8. Updatable Compatibility View: activity_logs (Routes to audit_logs)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW activity_logs AS
SELECT 
  al.id,
  al.institution_id,
  al.actor_profile_id AS actor_id,
  p.full_name AS actor_name,
  al.action,
  al.entity_type,
  al.entity_id,
  al.new_data AS details,
  al.created_at,
  al.created_at AS updated_at
FROM audit_logs al
LEFT JOIN profiles p ON p.id = al.actor_profile_id;

CREATE OR REPLACE FUNCTION fn_instead_of_insert_activity_logs()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO audit_logs (
    id, institution_id, actor_profile_id, action, entity_type, entity_id, new_data, created_at
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.institution_id,
    COALESCE(NEW.actor_id, auth.uid()),
    NEW.action,
    NEW.entity_type,
    COALESCE(NEW.entity_id, gen_random_uuid()),
    NEW.details,
    COALESCE(NEW.created_at, NOW())
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_instead_of_insert_activity_logs ON activity_logs;
CREATE TRIGGER trg_instead_of_insert_activity_logs
  INSTEAD OF INSERT ON activity_logs
  FOR EACH ROW EXECUTE FUNCTION fn_instead_of_insert_activity_logs();

-- ------------------------------------------------------------------------------
-- 9. Canonical Academic History Sync Triggers (Point 2)
-- Keeps student_session_enrollments as canonical source of truth
-- ------------------------------------------------------------------------------

-- When student_session_enrollments changes, sync active class/section/roll to students
CREATE OR REPLACE FUNCTION fn_sync_enrollment_to_student()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_class_id UUID;
BEGIN
  IF NEW.enrollment_status = 'active' THEN
    -- Resolve class_id from offering if available
    SELECT class_id INTO v_class_id
    FROM class_session_offerings
    WHERE id = NEW.offering_id;

    UPDATE students SET
      class_id = COALESCE(v_class_id, students.class_id),
      section_id = NEW.section_id,
      roll_number = NEW.roll_number,
      updated_at = NOW()
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_enrollment_to_student ON student_session_enrollments;
CREATE TRIGGER trg_sync_enrollment_to_student
  AFTER INSERT OR UPDATE ON student_session_enrollments
  FOR EACH ROW EXECUTE FUNCTION fn_sync_enrollment_to_student();

-- When a new student is inserted with class_id and section_id, auto-create active enrollment
CREATE OR REPLACE FUNCTION fn_auto_create_student_enrollment()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_session_id UUID;
  v_offering_id UUID;
BEGIN
  IF NEW.class_id IS NOT NULL AND NEW.section_id IS NOT NULL THEN
    -- Find active session
    SELECT id INTO v_session_id
    FROM academic_sessions
    WHERE institution_id = NEW.institution_id AND status = 'active'
    LIMIT 1;

    IF v_session_id IS NOT NULL THEN
      -- Find or create offering
      SELECT id INTO v_offering_id
      FROM class_session_offerings
      WHERE institution_id = NEW.institution_id AND session_id = v_session_id AND class_id = NEW.class_id
      LIMIT 1;

      IF v_offering_id IS NULL THEN
        INSERT INTO class_session_offerings (institution_id, session_id, class_id)
        VALUES (NEW.institution_id, v_session_id, NEW.class_id)
        RETURNING id INTO v_offering_id;
      END IF;

      -- Create session enrollment if offering exists
      IF v_offering_id IS NOT NULL THEN
        INSERT INTO student_session_enrollments (
          institution_id, student_id, session_id, offering_id, section_id, roll_number, enrollment_status
        ) VALUES (
          NEW.institution_id, NEW.id, v_session_id, v_offering_id, NEW.section_id, COALESCE(NEW.roll_number, '1'), 'active'
        )
        ON CONFLICT (student_id, session_id) DO UPDATE SET
          offering_id = EXCLUDED.offering_id,
          section_id = EXCLUDED.section_id,
          roll_number = EXCLUDED.roll_number,
          enrollment_status = 'active',
          updated_at = NOW();
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_student_enrollment ON students;
CREATE TRIGGER trg_auto_create_student_enrollment
  AFTER INSERT ON students
  FOR EACH ROW EXECUTE FUNCTION fn_auto_create_student_enrollment();

COMMIT;
