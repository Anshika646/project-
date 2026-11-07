-- ==============================================================================
-- EDUNEXA MIGRATION 00018: PARENT PORTAL & PTM MANAGEMENT
-- Parent-Teacher Meeting Schedules, Double-Booking Prevention & Consultations
-- ==============================================================================

BEGIN;

-- 1. PTM Sessions (Event Schedule container per Session)
CREATE TABLE IF NOT EXISTS ptm_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  title VARCHAR(150) NOT NULL,                             -- "Term 1 Parent Teacher Consultation Day"
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_ptm_times CHECK (end_time > start_time)
);

-- 2. PTM Bookings (Guarantees No Double-Booking for Teachers or Parents)
CREATE TABLE IF NOT EXISTS ptm_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  ptm_session_id UUID NOT NULL REFERENCES ptm_sessions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  time_slot VARCHAR(50) NOT NULL,                         -- e.g. "10:15 AM - 10:30 AM"
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',        -- 'confirmed' | 'completed' | 'cancelled'
  agenda_notes TEXT,
  teacher_remarks TEXT,
  parent_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- CRITICAL CONFLICT PREVENTION: Teacher cannot have two bookings in the same time slot
  CONSTRAINT uq_ptm_teacher_slot UNIQUE (ptm_session_id, teacher_id, time_slot),
  -- Parent cannot book two meetings simultaneously
  CONSTRAINT uq_ptm_parent_slot UNIQUE (ptm_session_id, parent_id, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_ptm_parent ON ptm_bookings(parent_id);
CREATE INDEX IF NOT EXISTS idx_ptm_teacher ON ptm_bookings(teacher_id);

COMMIT;
