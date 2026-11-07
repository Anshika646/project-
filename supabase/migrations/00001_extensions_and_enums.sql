-- ==============================================================================
-- EDUNEXA MIGRATION 00001: EXTENSIONS & ENUMS
-- Multi-Tenant SaaS ERP Architecture (Schools + Colleges)
-- STRICTLY ZERO FEES / PAYMENTS MODULES
-- ==============================================================================

BEGIN;

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Role Enum (All 8 Portals Supported)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'school_admin',
    'teacher',
    'student',
    'parent',
    'college_admin',
    'college_faculty',
    'college_student'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Attendance Status Enum (Default is 'unmarked')
DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM (
    'unmarked',
    'present',
    'absent',
    'late',
    'half_day',
    'leave'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Academic Session Lifecycle Enum
DO $$ BEGIN
  CREATE TYPE academic_session_status AS ENUM (
    'draft',
    'active',
    'closed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 5. Student Enrollment Lifecycle Status
DO $$ BEGIN
  CREATE TYPE student_enrollment_status AS ENUM (
    'active',
    'promoted',
    'retained',
    'transferred',
    'graduated'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 6. Universal Modtime Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMIT;
