-- ==============================================================================
-- EDUNEXA MIGRATION 00025: COMPATIBILITY VIEWS & HELPER FUNCTIONS
-- Backward-Compatibility Layer for Existing Frontend Queries & Services
-- ==============================================================================

BEGIN;

-- 1. Compatibility View: parent_student_links (Maps directly to student_guardians)
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

-- 2. Compatibility View: student_directory_view (Joins students with active session enrollment)
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
  se.session_id,
  se.offering_id,
  se.section_id,
  se.roll_number,
  se.enrollment_status,
  c.name AS class_name,
  c.grade_level,
  sec.name AS section_name,
  s.created_at,
  s.updated_at
FROM students s
LEFT JOIN student_session_enrollments se ON se.student_id = s.id AND se.enrollment_status = 'active'
LEFT JOIN class_session_offerings cso ON cso.id = se.offering_id
LEFT JOIN classes c ON c.id = cso.class_id
LEFT JOIN sections sec ON sec.id = se.section_id;

-- 3. Compatibility View: exam_marks_ledger_view (Joins marks, students, and subjects for ExaminationsPage)
CREATE OR REPLACE VIEW exam_marks_ledger_view AS
SELECT 
  sm.id,
  sm.institution_id,
  sm.exam_subject_id,
  sm.enrollment_id,
  sm.student_id,
  s.admission_number,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  se.roll_number,
  se.section_id,
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
JOIN student_session_enrollments se ON se.id = sm.enrollment_id
JOIN exam_subjects es ON es.id = sm.exam_subject_id
JOIN subjects sub ON sub.id = es.subject_id;

COMMIT;
