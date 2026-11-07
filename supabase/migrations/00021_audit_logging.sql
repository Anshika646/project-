-- ==============================================================================
-- EDUNEXA MIGRATION 00021: AUDIT LOGGING & TAMPER-PROOF TRIGGERS
-- Immutable Audit Trail for Sensitive Academic & Demographic Operations
-- ==============================================================================

BEGIN;

-- 1. Institutional Audit Logs (Append-Only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable to safely handle automated/server-side cron jobs
  entity_type VARCHAR(100) NOT NULL,                      -- 'student_marks', 'attendance_records', etc.
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,                            -- 'INSERT' | 'UPDATE' | 'DELETE'
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_inst_created ON audit_logs(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- 2. Platform Audit Logs (Super Admin Actions Across Tenants)
CREATE TABLE IF NOT EXISTS platform_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,                           -- 'INSTITUTION_APPROVED' | 'PLAN_MODIFIED' | 'TENANT_SUSPENDED'
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HARDEN IMMUTABILITY: Revoke all modification privileges from ordinary users
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM authenticated, anon;
REVOKE UPDATE, DELETE, TRUNCATE ON platform_audit_logs FROM authenticated, anon;

-- 4. Universal Hardened Trigger Function
CREATE OR REPLACE FUNCTION process_audit_logging()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp AS $$
DECLARE
  v_institution_id UUID;
  v_actor_id UUID;
BEGIN
  -- Safe extraction of auth.uid() without throwing when run in automated contexts
  BEGIN
    v_actor_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
  END;

  IF (TG_OP = 'INSERT') THEN
    v_institution_id := NEW.institution_id;
    INSERT INTO audit_logs (institution_id, actor_profile_id, entity_type, entity_id, action, new_data)
    VALUES (v_institution_id, v_actor_id, TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_institution_id := NEW.institution_id;
    INSERT INTO audit_logs (institution_id, actor_profile_id, entity_type, entity_id, action, old_data, new_data)
    VALUES (v_institution_id, v_actor_id, TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    v_institution_id := OLD.institution_id;
    INSERT INTO audit_logs (institution_id, actor_profile_id, entity_type, entity_id, action, old_data)
    VALUES (v_institution_id, v_actor_id, TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 5. Attach Triggers to Critical Academic, Grade, Attendance & Demographic Tables
DROP TRIGGER IF EXISTS trg_audit_marks ON student_marks;
CREATE TRIGGER trg_audit_marks
  AFTER INSERT OR UPDATE OR DELETE ON student_marks
  FOR EACH ROW EXECUTE FUNCTION process_audit_logging();

DROP TRIGGER IF EXISTS trg_audit_attendance ON attendance_records;
CREATE TRIGGER trg_audit_attendance
  AFTER INSERT OR UPDATE OR DELETE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION process_audit_logging();

DROP TRIGGER IF EXISTS trg_audit_promotions ON student_promotions;
CREATE TRIGGER trg_audit_promotions
  AFTER INSERT OR UPDATE OR DELETE ON student_promotions
  FOR EACH ROW EXECUTE FUNCTION process_audit_logging();

DROP TRIGGER IF EXISTS trg_audit_tc ON transfer_certificates;
CREATE TRIGGER trg_audit_tc
  AFTER INSERT OR UPDATE OR DELETE ON transfer_certificates
  FOR EACH ROW EXECUTE FUNCTION process_audit_logging();

DROP TRIGGER IF EXISTS trg_audit_students ON students;
CREATE TRIGGER trg_audit_students
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION process_audit_logging();

DROP TRIGGER IF EXISTS trg_audit_enrollments ON student_session_enrollments;
CREATE TRIGGER trg_audit_enrollments
  AFTER INSERT OR UPDATE OR DELETE ON student_session_enrollments
  FOR EACH ROW EXECUTE FUNCTION process_audit_logging();

COMMIT;
