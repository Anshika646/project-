-- ==============================================================================
-- EDUNEXA MIGRATION 00010: TIMETABLE & SCHOOL CALENDAR
-- Scheduling, Conflict Prevention & Academic Working Days
-- ==============================================================================

BEGIN;

-- 1. School Calendar & Holidays
CREATE TABLE IF NOT EXISTS school_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  title VARCHAR(150) NOT NULL,
  event_type VARCHAR(50) NOT NULL,                         -- 'Holiday' | 'Exam' | 'Sports' | 'PTM' | 'Activity'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  is_holiday BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_calendar_dates CHECK (end_date >= start_date)
);

-- 2. Timetable Periods (Daily Period Structure e.g. Period 1..8, Assembly, Lunch)
CREATE TABLE IF NOT EXISTS timetable_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  period_number INTEGER NOT NULL,                         -- 1 to 8
  name VARCHAR(50) NOT NULL,                              -- "Period 1", "Recess", "Zero Period"
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_break BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_session_period_num UNIQUE (session_id, period_number),
  CONSTRAINT chk_period_times CHECK (end_time > start_time)
);

-- 3. Master Section Timetables (Active & Historical Versions)
CREATE TABLE IF NOT EXISTS timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL DEFAULT 'Standard Section Timetable',
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_active_section_timetable UNIQUE (section_id, is_active)
);

-- 4. Timetable Period Slots (With Database-Level Conflict Constraints)
CREATE TABLE IF NOT EXISTS timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  session_id UUID NOT NULL,
  timetable_id UUID NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
  day_of_week VARCHAR(15) NOT NULL,                       -- 'Monday', 'Tuesday', ... 'Saturday'
  period_number INTEGER NOT NULL,
  subject_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  room_number VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 1. A section can only have one subject in a given period on a day
  CONSTRAINT uq_section_period_slot UNIQUE (timetable_id, day_of_week, period_number),
  -- 2. CRITICAL CONFLICT PREVENTION: A teacher cannot be assigned to two classes simultaneously
  CONSTRAINT uq_teacher_time_conflict UNIQUE (session_id, day_of_week, period_number, teacher_id),
  -- 3. Composite Foreign Keys guaranteeing institutional integrity
  CONSTRAINT fk_slot_session FOREIGN KEY (institution_id, session_id) REFERENCES academic_sessions(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_slot_subject FOREIGN KEY (institution_id, subject_id) REFERENCES subjects(institution_id, id) ON DELETE CASCADE,
  CONSTRAINT fk_slot_teacher FOREIGN KEY (institution_id, teacher_id) REFERENCES teachers(institution_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_slots_teacher_schedule ON timetable_slots(teacher_id, day_of_week, period_number);

COMMIT;
