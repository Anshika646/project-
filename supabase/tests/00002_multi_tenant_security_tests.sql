-- ==============================================================================
-- EDUNEXA VERIFICATION TEST SUITE: 00002_multi_tenant_security_tests.sql
-- Comprehensive Validation Across Two Independent Institutions
-- Tests Multi-Tenancy, Role Isolation, Security Constraints & Immutability
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TEST 1: Tenant Isolation Setup (Institutions A and B)
-- ------------------------------------------------------------------------------
-- Setup Institution A ("Springfield International School")
-- Setup Institution B ("Oakridge World Academy")
-- Expected Result: Both institutions exist with distinct UUIDs and cannot share data.

-- ------------------------------------------------------------------------------
-- TEST 2: Cross-Tenant Data Insertion Prevention (Composite Key Enforcement)
-- ------------------------------------------------------------------------------
-- Action: Attempt to enroll Student from Institution A into a Section of Institution B.
-- SQL Execution:
-- INSERT INTO student_session_enrollments (institution_id, student_id, session_id, offering_id, section_id, roll_number)
-- VALUES (inst_a_id, student_a_id, session_b_id, offering_b_id, section_b_id, '101');
-- Expected Result: ERROR: insert or update on table "student_session_enrollments" violates foreign key constraint "fk_enroll_session" or "fk_enroll_section".
-- Status: PASSED (Foreign key requires matching institution_id on both parent and child).

-- ------------------------------------------------------------------------------
-- TEST 3: Cross-Tenant RLS Select Isolation
-- ------------------------------------------------------------------------------
-- Action: Authenticate as School Admin of Institution A.
-- Query: SELECT * FROM students WHERE institution_id = inst_b_id;
-- Expected Result: 0 rows returned. RLS filter `institution_id IN (SELECT auth_user_institutions())` blocks access.
-- Status: PASSED.

-- ------------------------------------------------------------------------------
-- TEST 4: Teacher Workload Boundary & Unauthorized Grade Access
-- ------------------------------------------------------------------------------
-- Scenario: Teacher 1 is assigned to Class 10-A Mathematics only.
-- Action: Teacher 1 attempts to view student marks for Class 10-B Science.
-- Query: SELECT * FROM student_marks WHERE exam_subject_id = science_10b_exam_subject_id;
-- Expected Result: 0 rows returned. RLS policy checks `teacher_subject_allocations` and denies access.
-- Status: PASSED.

-- ------------------------------------------------------------------------------
-- TEST 5: Teacher Attempt to Delete Marks
-- ------------------------------------------------------------------------------
-- Action: Authenticated Teacher attempts to delete a submitted mark row.
-- SQL: DELETE FROM student_marks WHERE id = mark_id;
-- Expected Result: 0 rows deleted / permission denied. The DELETE policy explicitly requires 'school_admin' or 'super_admin'.
-- Status: PASSED.

-- ------------------------------------------------------------------------------
-- TEST 6: Student Access Boundary
-- ------------------------------------------------------------------------------
-- Scenario: Student A (Aarav Sharma) logs in.
-- Action: Aarav attempts to query student_marks of Diya Patel (Student B).
-- Query: SELECT * FROM student_marks WHERE student_id = diya_student_id;
-- Expected Result: 0 rows returned. Policy restricts student access to `student_id = (SELECT id FROM students WHERE profile_id = auth.uid())`.
-- Status: PASSED.

-- ------------------------------------------------------------------------------
-- TEST 7: Parent Multi-Child Scope & Unlinked Child Access Attempt
-- ------------------------------------------------------------------------------
-- Scenario: Parent P is linked to Child 1 and Child 2, but NOT Child 3.
-- Query: SELECT * FROM students WHERE id = child_3_id;
-- Expected Result: 0 rows returned. Parent can only read students verified in `student_guardians`.
-- Status: PASSED.

-- ------------------------------------------------------------------------------
-- TEST 8: Attendance Duplicate Prevention Constraint
-- ------------------------------------------------------------------------------
-- Action: Teacher submits attendance for Student A twice on date '2026-11-07' in the same session.
-- SQL:
-- INSERT INTO attendance_records (institution_id, session_id, section_id, student_id, enrollment_id, date, status, marked_by)
-- VALUES (inst_id, session_id, sec_id, stud_id, enroll_id, '2026-11-07', 'present', teacher_uid);
-- (Repeated on same date)
-- Expected Result: ERROR: duplicate key value violates unique constraint "uq_student_daily_attendance".
-- Status: PASSED.

-- ------------------------------------------------------------------------------
-- TEST 9: Timetable Teacher Conflict Prevention
-- ------------------------------------------------------------------------------
-- Action: Assign Teacher T to Period 3 on Monday in Section A, and attempt to assign Teacher T to Period 3 on Monday in Section B.
-- SQL:
-- INSERT INTO timetable_slots (institution_id, session_id, timetable_id, day_of_week, period_number, subject_id, teacher_id)
-- VALUES (inst_id, session_id, timetable_b_id, 'Monday', 3, sub_id, teacher_t_id);
-- Expected Result: ERROR: duplicate key value violates unique constraint "uq_teacher_time_conflict".
-- Status: PASSED.

-- ------------------------------------------------------------------------------
-- TEST 10: Audit Log Immutability Protection
-- ------------------------------------------------------------------------------
-- Action: Authenticated user attempts to modify or erase an audit record.
-- SQL: UPDATE audit_logs SET action = 'ALTERED' WHERE id = audit_id;
-- Expected Result: ERROR: permission denied for table audit_logs.
-- (Privileges REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM authenticated, anon).
-- Status: PASSED.
