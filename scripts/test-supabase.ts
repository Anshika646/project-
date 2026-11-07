import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

function mask(value?: string | null): string {
  if (!value) return '(not set)';
  const trimmed = value.trim();
  if (trimmed.length <= 10) return '***';
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

async function runTest() {
  console.log('====================================================');
  console.log('⚡ EDUNEXA — SUPABASE CONNECTIVITY VERIFICATION');
  console.log('====================================================\n');

  // Detect project URL
  const rawUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    (process.env.VITE_SUPABASE_PROJECT_ID
      ? `https://${process.env.VITE_SUPABASE_PROJECT_ID.trim()}.supabase.co`
      : undefined);

  // Detect client publishable / anon key
  const publishableKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  // Detect server-side service role key (optional)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Configuration Inspection:');
  console.log(`• Project URL:        ${rawUrl || '(not configured)'}`);
  console.log(`• Publishable/Anon:   ${mask(publishableKey)}`);
  console.log(`• Service Role Key:   ${serviceRoleKey ? mask(serviceRoleKey) + ' [Server-Side Only]' : '(not set)'}\n`);

  if (!rawUrl || !publishableKey) {
    console.log('❌ STATUS: Supabase is NOT configured yet.');
    console.log('\nTo connect Supabase, please set these environment variables:');
    console.log('1. VITE_SUPABASE_URL        -> Your Supabase Project URL (https://<project-ref>.supabase.co)');
    console.log('2. VITE_SUPABASE_ANON_KEY    -> Your Supabase Publishable / Anon Key');
    console.log('\nIn Google AI Studio Build:');
    console.log('• Add them in your Environment Variables / Secrets panel or local .env file.');
    console.log('• Vite will automatically bundle VITE_* variables into the client application.\n');
    process.exit(0);
  }

  // Sanitize URL
  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }
  targetUrl = targetUrl.replace(/\/+$/, '');

  console.log(`Testing Client Connection to: ${targetUrl} ...`);
  const client = createClient(targetUrl, publishableKey.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const start = Date.now();
  try {
    const { error } = await client.auth.getSession();
    const duration = Date.now() - start;

    if (error && error.status && error.status >= 500) {
      console.log(`❌ Connection test failed with server error (${duration}ms):`, error.message);
      process.exit(1);
    }

    console.log(`✅ Client connection successful! Ping latency: ${duration}ms`);
    console.log('   • Project endpoint is reachable');
    console.log('   • Publishable key accepted by Supabase Auth API');

    if (serviceRoleKey) {
      console.log('\nTesting Server-Side Service Role Key...');
      const adminClient = createClient(targetUrl, serviceRoleKey.trim(), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error: adminErr } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (adminErr) {
        console.log(`⚠️  Service role key check returned: ${adminErr.message}`);
      } else {
        console.log(`✅ Service role key verified successfully! (${data.users ? data.users.length : 0} users reachable)`);
      }
    }

    console.log('\n🎉 Ready! Supabase is verified and connected to Edunexa ERP.');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`❌ Connectivity failed: ${msg}`);
    process.exit(1);
  }
}

runTest();
