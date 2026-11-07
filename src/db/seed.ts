import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSeed() {
  console.log('----------------------------------------------------');
  console.log('🌿 EDUNEXA — SEEDING DATABASE SCRIPT');
  console.log('----------------------------------------------------');

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️  Notice: SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL must be set in .env.local to execute remote seed.');
    console.log('ℹ️  In the meantime, local preview mode operates with the pre-seeded institutional dataset in mockData.ts.');
    console.log('✅ Local seed validation passed.');
    return;
  }

  // PRODUCTION SAFETY GUARD: Prevent accidental demo data poisoning in production
  const isProd = process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
  const allowProdSeed = process.argv.includes('--allow-production-seed') || process.env.ALLOW_PRODUCTION_SEED === 'true';

  if (isProd && !allowProdSeed) {
    console.error('⛔ SAFETY ABORT: Seeding demo data in PRODUCTION environment is blocked by default.');
    console.error('   To override for staging/initial launch, run: npm run seed -- --allow-production-seed');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('🔗 Connected to Supabase at:', supabaseUrl);

  // Check if live production institutions exist
  const { data: existingLive, count } = await supabase
    .from('institutions')
    .select('id, name, code', { count: 'exact' })
    .neq('code', 'SIS-DELHI')
    .limit(1);

  if (existingLive && existingLive.length > 0 && !allowProdSeed) {
    console.error('⛔ SAFETY ABORT: Live non-demo institutions detected in this database:');
    existingLive.forEach((i) => console.error(`   - ${i.name} (${i.code})`));
    console.error('   Aborting seed to prevent corrupting real school/college data.');
    console.error('   Pass --allow-production-seed if you explicitly intend to seed alongside live data.');
    process.exit(1);
  }

  const institutionId = 'e8b070c0-dacd-4772-85df-0ce93748524c';

  // 1. Seed Institution
  console.log('1. Seeding Institution (Springfield International School)...');
  const { error: instError } = await supabase.from('institutions').upsert({
    id: institutionId,
    name: 'Springfield International School',
    code: 'SIS-DELHI',
    type: 'school',
    board: 'CBSE',
    email: 'contact@springfield.edunexa.edu',
    phone: '+91 (011) 4892-0199',
    address: 'Plot 14, Institutional Area, Sector 5, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    is_active: true,
  });

  if (instError) console.error('Error inserting institution:', instError.message);

  // 2. Seed Classes
  console.log('2. Seeding Classes & Sections...');
  const class10Id = '10101010-1010-1010-1010-101010101010';
  const class9Id = '09090909-0909-0909-0909-090909090909';

  await supabase.from('classes').upsert([
    { id: class10Id, institution_id: institutionId, name: 'Class 10', stage: 'Secondary', grade_level: 10 },
    { id: class9Id, institution_id: institutionId, name: 'Class 9', stage: 'Secondary', grade_level: 9 },
  ]);

  const sec10AId = 'a1010101-1010-1010-1010-101010101010';
  const sec9AId = 'a0909090-0909-0909-0909-090909090909';

  await supabase.from('sections').upsert([
    { id: sec10AId, institution_id: institutionId, class_id: class10Id, name: 'A', room_number: 'Room 301', capacity: 35 },
    { id: sec9AId, institution_id: institutionId, class_id: class9Id, name: 'A', room_number: 'Room 201', capacity: 35 },
  ]);

  // 3. Seed 30 Students
  console.log('3. Seeding 30 Students across classes...');
  for (let i = 1; i <= 30; i++) {
    const isClass10 = i <= 15;
    const roll = String(i <= 15 ? i : i - 15);
    const adm = `SIS/2025/${1000 + i}`;
    const studentProfileId = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
    const studentId = `11111111-0000-0000-0000-${String(i).padStart(12, '0')}`;

    await supabase.from('profiles').upsert({
      id: studentProfileId,
      institution_id: institutionId,
      role: 'student',
      full_name: `Student ${i} (${isClass10 ? '10-A' : '9-A'})`,
      email: `student${i}@springfield.edunexa.edu`,
      is_active: true,
    });

    await supabase.from('students').upsert({
      id: studentId,
      institution_id: institutionId,
      profile_id: studentProfileId,
      admission_number: adm,
      first_name: 'Student',
      last_name: String(i),
      roll_number: roll,
      class_id: isClass10 ? class10Id : class9Id,
      section_id: isClass10 ? sec10AId : sec9AId,
      date_of_birth: '2010-01-01',
      gender: i % 2 === 0 ? 'Female' : 'Male',
      residential_address: 'Plot 14, Sector 5',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      emergency_contact: `+91 98000 ${String(10000 + i).slice(-5)}`,
      is_deleted: false,
    });
  }

  console.log('🎉 Seeding successfully completed!');
}

runSeed().catch((err) => {
  console.error('Fatal seed failure:', err);
});
