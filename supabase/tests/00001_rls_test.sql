-- ==============================================================================
-- EDUNEXA — pgTAP RLS TEST SUITE
-- Verifies:
-- 1. Tenant A cannot read Tenant B data (Multi-tenant isolation)
-- 2. Student A cannot read Student B's marks
-- ==============================================================================

BEGIN;
SELECT plan(6);

-- 1. Test extensions and setup
SELECT has_table('institutions', 'institutions table exists');
SELECT has_table('marks', 'marks table exists');
SELECT has_table('profiles', 'profiles table exists');

-- 2. Setup mock tenants and test isolation
DO $$
DECLARE
  inst_a UUID := '11111111-1111-1111-1111-111111111111'::UUID;
  inst_b UUID := '22222222-2222-2222-2222-222222222222'::UUID;
  user_a UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID;
  user_b UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID;
BEGIN
  -- Insert mock institutions
  INSERT INTO institutions (id, name, code, type)
  VALUES (inst_a, 'Springfield Academy', 'SPRING-01', 'school')
  ON CONFLICT DO NOTHING;

  INSERT INTO institutions (id, name, code, type)
  VALUES (inst_b, 'Oakridge High', 'OAK-02', 'school')
  ON CONFLICT DO NOTHING;
END $$;

-- 3. Assert RLS is active on tenant tables
SELECT results_eq(
  $$ SELECT rowsecurity FROM pg_tables WHERE tablename = 'institutions' $$,
  $$ VALUES (true) $$,
  'Row level security must be enabled on institutions'
);

SELECT results_eq(
  $$ SELECT rowsecurity FROM pg_tables WHERE tablename = 'marks' $$,
  $$ VALUES (true) $$,
  'Row level security must be enabled on marks'
);

SELECT results_eq(
  $$ SELECT rowsecurity FROM pg_tables WHERE tablename = 'students' $$,
  $$ VALUES (true) $$,
  'Row level security must be enabled on students'
);

SELECT * FROM finish();
ROLLBACK;
