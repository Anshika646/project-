import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://demo-edunexa.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo-placeholder';

function sanitizeSupabaseUrl(input?: string | null): string | null {
  if (!input || typeof input !== 'string') return null;
  let trimmed = input.trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed.includes('xyzcompany') ||
    trimmed.includes('your-project') ||
    trimmed === 'invalid-url'
  ) {
    return null;
  }

  // Prepend https:// if protocol was omitted (e.g. "myproject.supabase.co")
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}

const rawEnvUrl = import.meta.env.VITE_SUPABASE_URL;
const rawEnvKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const sanitizedUrl = sanitizeSupabaseUrl(rawEnvUrl);
const hasValidKey = Boolean(
  rawEnvKey &&
  typeof rawEnvKey === 'string' &&
  rawEnvKey.trim().length > 10 &&
  rawEnvKey !== 'undefined' &&
  !rawEnvKey.includes('demo-placeholder')
);

export const isSupabaseConfigured: boolean = Boolean(sanitizedUrl && hasValidKey);

const activeUrl = sanitizedUrl || FALLBACK_URL;
const activeKey = (hasValidKey && rawEnvKey?.trim()) || FALLBACK_KEY;

function initSupabase(): SupabaseClient {
  try {
    return createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.warn('[Edunexa] Supabase initialization fallback engaged:', error);
    return createClient(FALLBACK_URL, FALLBACK_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}

export const supabase = initSupabase();

