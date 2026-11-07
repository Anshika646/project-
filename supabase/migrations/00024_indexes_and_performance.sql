-- ==============================================================================
-- EDUNEXA MIGRATION 00024: INDEXES & PERFORMANCE OPTIMIZATION
-- Composite Tenant B-Tree Indexing for High-Throughput 100+ Tenant Scale
-- ==============================================================================

BEGIN;

-- 1. Student Directory & Search Optimization
CREATE INDEX IF NOT EXISTS idx_students_perf_search 
  ON students(institution_id, is_deleted, admission_number);

CREATE INDEX IF NOT EXISTS idx_enrollment_perf_filter 
  ON student_session_enrollments(institution_id, session_id, section_id, enrollment_status);

-- 2. Daily Attendance High-Velocity Lookups
CREATE INDEX IF NOT EXISTS idx_att_perf_daily 
  ON attendance_records(institution_id, section_id, date, status);

CREATE INDEX IF NOT EXISTS idx_att_perf_student_trend 
  ON attendance_records(student_id, date DESC);

-- 3. Marks & Assessment Calculation Indexing
CREATE INDEX IF NOT EXISTS idx_marks_perf_exam_sub 
  ON student_marks(exam_subject_id, status);

CREATE INDEX IF NOT EXISTS idx_marks_perf_student_audit 
  ON student_marks(student_id, total_marks, grade);

-- 4. Workload & Access Matrix Seek Optimization
CREATE INDEX IF NOT EXISTS idx_alloc_perf_teacher_session 
  ON teacher_subject_allocations(teacher_id, session_id, section_id, subject_id);

-- 5. Timetable Period Lookups
CREATE INDEX IF NOT EXISTS idx_slots_perf_section_day 
  ON timetable_slots(timetable_id, day_of_week, period_number);

-- 6. Family & Guardian Linking
CREATE INDEX IF NOT EXISTS idx_guardians_perf_lookup 
  ON student_guardians(parent_id, student_id, is_primary);

-- 7. College Course & Semester Result Acceleration
CREATE INDEX IF NOT EXISTS idx_clg_enroll_perf_sem 
  ON college_student_enrollments(semester_id, course_id, status);

CREATE INDEX IF NOT EXISTS idx_clg_marks_perf_sub 
  ON college_subject_registrations(enrollment_id, subject_id, is_passed);

COMMIT;
