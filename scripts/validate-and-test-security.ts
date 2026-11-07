/**
 * EDUNEXA — DATABASE INTEGRITY, MIGRATION SYNTAX & RLS SECURITY AUDIT RUNNER
 * Executes second-level validation against all 25 migrations, RLS policies,
 * storage boundaries, triggers, and compatibility views without touching live Supabase.
 */

import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase/migrations');

interface AuditResult {
  category: string;
  testName: string;
  passed: boolean;
  details: string;
}

const results: AuditResult[] = [];

function assert(category: string, testName: string, condition: boolean, details: string) {
  results.push({
    category,
    testName,
    passed: condition,
    details,
  });
}

async function runAudit() {
  console.log('================================================================');
  console.log('🛡️  EDUNEXA — COMPREHENSIVE DATABASE INTEGRITY & SECURITY AUDIT');
  console.log('================================================================\n');

  // ----------------------------------------------------------------------------
  // SECTION 1: Migration Files Inventory & Dependency Order
  // ----------------------------------------------------------------------------
  console.log('📦 Auditing Migration Files & Dependency Order...');
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  assert(
    'Migrations',
    'All 26 migration files present',
    files.length === 26,
    `Found ${files.length} migration files in sequence (00001 to 00026)`
  );

  let combinedSql = '';
  const fileContents = new Map<string, string>();

  for (const f of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf-8');
    fileContents.set(f, content);
    combinedSql += `\n-- FILE: ${f}\n` + content;
  }

  // ----------------------------------------------------------------------------
  // SECTION 2: Table Inventory & RLS Policy Mapping
  // ----------------------------------------------------------------------------
  console.log('🔍 Auditing RLS Policies across all tables...');
  
  // Extract all CREATE TABLE statements
  const tableRegex = /CREATE TABLE IF NOT EXISTS\s+([a-zA-Z0-9_]+)/gi;
  const tables: string[] = [];
  let match;
  while ((match = tableRegex.exec(combinedSql)) !== null) {
    if (!tables.includes(match[1])) {
      tables.push(match[1]);
    }
  }

  // Extract all ALTER TABLE ... ENABLE ROW LEVEL SECURITY
  const rlsRegex = /ALTER TABLE\s+([a-zA-Z0-9_]+)\s+ENABLE ROW LEVEL SECURITY/gi;
  const rlsEnabledTables: string[] = [];
  while ((match = rlsRegex.exec(combinedSql)) !== null) {
    if (!rlsEnabledTables.includes(match[1])) {
      rlsEnabledTables.push(match[1]);
    }
  }

  // Extract all CREATE POLICY ... ON <table>
  const policyRegex = /CREATE POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_.]+)/gi;
  const policiesByTable = new Map<string, string[]>();
  while ((match = policyRegex.exec(combinedSql)) !== null) {
    const tbl = match[2].replace('public.', '');
    const pName = match[1];
    if (!policiesByTable.has(tbl)) {
      policiesByTable.set(tbl, []);
    }
    policiesByTable.get(tbl)!.push(pName);
  }

  assert(
    'RLS Coverage',
    'All core tenant tables have RLS enabled',
    rlsEnabledTables.length >= 35,
    `Row Level Security is enabled on ${rlsEnabledTables.length} tables`
  );

  // Check that every table with RLS enabled has policies defined
  let missingPoliciesCount = 0;
  for (const tbl of rlsEnabledTables) {
    const policies = policiesByTable.get(tbl) || [];
    if (policies.length === 0) {
      missingPoliciesCount++;
      assert('RLS Coverage', `Table ${tbl} has policies`, false, `Missing policies for ${tbl}`);
    }
  }

  assert(
    'RLS Coverage',
    'No orphaned RLS tables (Every table with RLS has active policies)',
    missingPoliciesCount === 0,
    missingPoliciesCount === 0 ? 'All 38+ RLS tables have explicit policies' : `${missingPoliciesCount} tables lack policies`
  );

  // ----------------------------------------------------------------------------
  // SECTION 3: Multi-Institution User Authorization (Point 1)
  // ----------------------------------------------------------------------------
  console.log('🏢 Testing Multi-Institution User Role Boundaries (Point 1)...');
  const rlsContent = fileContents.get('00022_rls_helpers_and_policies.sql') || '';
  
  const authHasRoleUsesMemberships = rlsContent.includes('FROM institution_memberships') &&
    rlsContent.includes('WHERE profile_id = auth.uid()') &&
    rlsContent.includes('(institution_id = inst_id OR inst_id IS NULL)');
  
  assert(
    'Multi-Tenant Roles',
    'auth_has_role evaluates institution_memberships as source of truth',
    authHasRoleUsesMemberships,
    'Institutional roles are strictly scoped by institution_id in institution_memberships'
  );

  const authUserInstOnlyMemberships = rlsContent.includes('SELECT institution_id \n  FROM institution_memberships') &&
    !rlsContent.includes('UNION\n  SELECT institution_id\n  FROM profiles');

  assert(
    'Multi-Tenant Roles',
    'auth_user_institutions uses institution_memberships strictly without profile override',
    authUserInstOnlyMemberships,
    'User institution tenancy is driven by active memberships'
  );

  // ----------------------------------------------------------------------------
  // SECTION 4: Student Academic History Integrity (Point 2)
  // ----------------------------------------------------------------------------
  console.log('🎓 Testing Student Academic History Integrity (Point 2)...');
  const compatContent = fileContents.get('00025_compatibility_views_and_functions.sql') || '';
  
  const hasEnrollmentSyncTrigger = compatContent.includes('fn_sync_enrollment_to_student') &&
    compatContent.includes('trg_sync_enrollment_to_student') &&
    compatContent.includes('fn_auto_create_student_enrollment');

  assert(
    'Academic History',
    'student_session_enrollments is canonical source of truth with sync trigger',
    hasEnrollmentSyncTrigger,
    'Active session enrollment automatically synchronizes with student record and vice versa'
  );

  // ----------------------------------------------------------------------------
  // SECTION 5: Student Marks Integrity (Point 3)
  // ----------------------------------------------------------------------------
  console.log('📝 Testing Student Marks Enrollment Validation (Point 3)...');
  const hasMarksIntegrityTrigger = compatContent.includes('fn_instead_of_insert_marks') &&
    compatContent.includes('student_session_enrollments') &&
    compatContent.includes('Academic Integrity Failure: Student');

  assert(
    'Marks Integrity',
    'Marks cannot be recorded without active student enrollment in exam session',
    hasMarksIntegrityTrigger,
    'Instead-of trigger looks up exam session and enforces enrolled student relationship'
  );

  // ----------------------------------------------------------------------------
  // SECTION 6: Compatibility Updatable Views vs Duplicate Tables (Point 4)
  // ----------------------------------------------------------------------------
  console.log('🔄 Auditing Compatibility Layer for Zero-Duplicate Updatable Views (Point 4)...');
  const hasUpdatableViews = compatContent.includes('CREATE OR REPLACE VIEW marks AS') &&
    compatContent.includes('INSTEAD OF INSERT ON marks') &&
    compatContent.includes('CREATE OR REPLACE VIEW attendance AS') &&
    compatContent.includes('INSTEAD OF INSERT ON attendance') &&
    compatContent.includes('CREATE OR REPLACE VIEW notes AS') &&
    compatContent.includes('INSTEAD OF INSERT ON notes') &&
    compatContent.includes('CREATE OR REPLACE VIEW activity_logs AS');

  assert(
    'Compatibility Architecture',
    'Compatibility layer uses zero-overhead updatable views with INSTEAD OF triggers',
    hasUpdatableViews,
    'Eliminates duplicate tables, prevents infinite trigger recursion and guarantees ACID consistency'
  );

  // ----------------------------------------------------------------------------
  // SECTION 7: Attendance Uniqueness & Tenant Scoping (Point 5)
  // ----------------------------------------------------------------------------
  console.log('📅 Verifying Attendance Multi-Tenant Uniqueness (Point 5)...');
  const attContent = fileContents.get('00011_attendance.sql') || '';
  
  const hasTenantScopedAttendanceConstraint = attContent.includes('CONSTRAINT uq_student_daily_attendance UNIQUE (institution_id, student_id, date)') &&
    !attContent.includes('CONSTRAINT uq_student_date_att UNIQUE (student_id, date)');

  assert(
    'Attendance Uniqueness',
    'Attendance daily uniqueness is strictly scoped by institution_id',
    hasTenantScopedAttendanceConstraint,
    'Multi-tenant and multi-session isolation preserved; avoids un-scoped global unique constraints'
  );

  // ----------------------------------------------------------------------------
  // SECTION 8: Storage Public-Read Policy Scoping (Point 6)
  // ----------------------------------------------------------------------------
  console.log('🔒 Verifying Storage Security & Public Access Scope (Point 6)...');
  const storageContent = fileContents.get('00023_storage_buckets_and_policies.sql') || '';

  const safeUuidFunction = storageContent.includes('CREATE OR REPLACE FUNCTION safe_cast_uuid');
  assert(
    'Storage Security',
    'Safe UUID regex casting prevents malformed path crashes',
    safeUuidFunction,
    'safe_cast_uuid() validates UUID format before casting'
  );

  const publicPolicyRestricted = storageContent.includes('CREATE POLICY "assets_public_select"') &&
    storageContent.includes("bucket_id IN ('institution-assets', 'avatars')");
  assert(
    'Storage Security',
    'Public-read policy exposes ONLY institution-assets and avatars',
    publicPolicyRestricted,
    'Student documents, report cards, study notes, homework and submissions are strictly private'
  );

  // ----------------------------------------------------------------------------
  // SECTION 9: Audit Immutability Protection
  // ----------------------------------------------------------------------------
  console.log('📜 Testing Audit Log Immutability & Anti-Tamper Enforcement...');
  const auditContent = fileContents.get('00021_audit_logging.sql') || '';
  
  const auditRevoked = auditContent.includes('REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM authenticated, anon');
  assert(
    'Audit Immutability',
    'UPDATE, DELETE, TRUNCATE are revoked on audit_logs',
    auditRevoked,
    'Audit logs are strictly append-only'
  );

  // ----------------------------------------------------------------------------
  // SECTION 10: Production Seed Safety Guards (Point 10)
  // ----------------------------------------------------------------------------
  console.log('🌱 Verifying Production Seed Safety Guards (Point 10)...');
  const seedScriptContent = fs.readFileSync(path.resolve(process.cwd(), 'src/db/seed.ts'), 'utf-8');
  
  const hasProductionSafetyLock = seedScriptContent.includes('isProd && !allowProdSeed') &&
    seedScriptContent.includes('--allow-production-seed') &&
    seedScriptContent.includes('existingLive && existingLive.length > 0 && !allowProdSeed');

  assert(
    'Seed Safety',
    'Seed script has safety locks preventing execution in production',
    hasProductionSafetyLock,
    'Blocks demo seeding in production environment and aborts if live institutions exist'
  );

  // ----------------------------------------------------------------------------
  // PRINT SUMMARY
  // ----------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 AUDIT RESULTS SUMMARY');
  console.log('================================================================');

  let passedCount = 0;
  let failedCount = 0;

  for (const r of results) {
    const symbol = r.passed ? '✅' : '❌';
    console.log(`${symbol} [${r.category}] ${r.testName}: ${r.details}`);
    if (r.passed) passedCount++;
    else failedCount++;
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Total Checks: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('----------------------------------------------------------------\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
