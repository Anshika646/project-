-- ==============================================================================
-- EDUNEXA MIGRATION 00023: STORAGE BUCKETS & SECURITY POLICIES
-- 5 Private Buckets with Database-Verified Path Scoping & MIME/Size Limits
-- ==============================================================================

BEGIN;

-- 1. Register 5 Private Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('student-documents', 'student-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('report-cards', 'report-cards', false, 15728640, ARRAY['application/pdf']),
  ('study-notes', 'study-notes', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('homework-files', 'homework-files', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('homework-submissions', 'homework-submissions', false, 26214400, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. POLICIES: student-documents (Path: /{institution_id}/students/{student_id}/{file})
CREATE POLICY "std_docs_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'student-documents' AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = (storage.foldername(name))[3]::uuid) = auth.uid()
    OR (storage.foldername(name))[3]::uuid IN (SELECT auth_parent_students())
  )
);

CREATE POLICY "std_docs_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'student-documents' AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'college_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = (storage.foldername(name))[3]::uuid) = auth.uid()
  )
);

CREATE POLICY "std_docs_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'student-documents' AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
  )
);

-- 3. POLICIES: report-cards (Path: /{institution_id}/reports/{session_id}/{student_id}.pdf)
CREATE POLICY "rc_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'report-cards' AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role, 'super_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = (storage.foldername(name))[4]::uuid) = auth.uid()
    OR (storage.foldername(name))[4]::uuid IN (SELECT auth_parent_students())
  )
);

CREATE POLICY "rc_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'report-cards' AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  )
);

CREATE POLICY "rc_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'report-cards' AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'super_admin'::user_role])
  )
);

-- 4. POLICIES: study-notes & homework-files
CREATE POLICY "notes_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id IN ('study-notes', 'homework-files') AND (
    (storage.foldername(name))[1]::uuid IN (SELECT auth_user_institutions())
  )
);

CREATE POLICY "notes_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id IN ('study-notes', 'homework-files') AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role, 'college_faculty'::user_role])
  )
);

CREATE POLICY "notes_delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id IN ('study-notes', 'homework-files') AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'college_admin'::user_role])
  )
);

-- 5. POLICIES: homework-submissions (Path: /{institution_id}/homework/{homework_id}/{student_id}/{file})
CREATE POLICY "hw_sub_select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'homework-submissions' AND (
    auth_has_role((storage.foldername(name))[1]::uuid, ARRAY['school_admin'::user_role, 'teacher'::user_role, 'college_admin'::user_role])
    OR (SELECT profile_id FROM students WHERE id = (storage.foldername(name))[4]::uuid) = auth.uid()
    OR (storage.foldername(name))[4]::uuid IN (SELECT auth_parent_students())
  )
);

CREATE POLICY "hw_sub_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'homework-submissions' AND (
    (SELECT profile_id FROM students WHERE id = (storage.foldername(name))[4]::uuid) = auth.uid()
  )
);

COMMIT;
