-- ==============================================================================
-- EDUNEXA MIGRATION 00023: STORAGE BUCKETS & SECURITY POLICIES
-- Multi-Tenant Buckets with Database-Verified Path Scoping & Safe UUID Resolution
-- ==============================================================================

BEGIN;

-- 1. Helper function for safe UUID resolution from storage paths without syntax errors
CREATE OR REPLACE FUNCTION safe_cast_uuid(p_val text)
RETURNS uuid 
LANGUAGE plpgsql 
IMMUTABLE STRICT 
SET search_path = public, pg_temp AS $$
BEGIN
  IF p_val ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    RETURN p_val::uuid;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Register Storage Buckets (Private records + Public branding/avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('student-documents', 'student-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('report-cards', 'report-cards', false, 15728640, ARRAY['application/pdf']),
  ('study-notes', 'study-notes', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('homework-files', 'homework-files', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('homework-submissions', 'homework-submissions', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('institution-assets', 'institution-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. POLICIES: student-documents (Path: /{institution_id}/students/{student_id}/{file})
CREATE POLICY "std_docs_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'student-documents' AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = safe_cast_uuid((storage.foldername(name))[3])) = auth.uid()
    OR safe_cast_uuid((storage.foldername(name))[3]) IN (SELECT auth_parent_students())
  )
);

CREATE POLICY "std_docs_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'student-documents' AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'college_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = safe_cast_uuid((storage.foldername(name))[3])) = auth.uid()
  )
);

CREATE POLICY "std_docs_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'student-documents' AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  )
);

-- 4. POLICIES: report-cards (Path: /{institution_id}/reports/{session_id}/{student_id}.pdf)
CREATE POLICY "rc_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'report-cards' AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = safe_cast_uuid((storage.foldername(name))[4])) = auth.uid()
    OR safe_cast_uuid((storage.foldername(name))[4]) IN (SELECT auth_parent_students())
  )
);

CREATE POLICY "rc_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'report-cards' AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  )
);

-- 5. POLICIES: study-notes & homework-files
CREATE POLICY "notes_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id IN ('study-notes', 'homework-files') AND (
    safe_cast_uuid((storage.foldername(name))[1]) IN (SELECT auth_user_institutions())
  )
);

CREATE POLICY "notes_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id IN ('study-notes', 'homework-files') AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role, 'college_faculty'::user_role])
  )
);

CREATE POLICY "notes_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id IN ('study-notes', 'homework-files') AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  )
);

-- 6. POLICIES: homework-submissions (Path: /{institution_id}/homework/{homework_id}/{student_id}/{file})
CREATE POLICY "hw_sub_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'homework-submissions' AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = safe_cast_uuid((storage.foldername(name))[4])) = auth.uid()
    OR safe_cast_uuid((storage.foldername(name))[4]) IN (SELECT auth_parent_students())
  )
);

CREATE POLICY "hw_sub_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'homework-submissions' AND (
    (SELECT profile_id FROM students WHERE id = safe_cast_uuid((storage.foldername(name))[4])) = auth.uid()
  )
);

-- 7. POLICIES: Public Institution Assets & Avatars
CREATE POLICY "assets_public_select" ON storage.objects FOR SELECT TO public USING (
  bucket_id IN ('institution-assets', 'avatars')
);

CREATE POLICY "assets_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'institution-assets' AND (
    auth_has_role(safe_cast_uuid((storage.foldername(name))[1]), ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  )
);

CREATE POLICY "avatars_user_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars'
);

COMMIT;
