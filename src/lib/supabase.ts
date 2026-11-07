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

  // Remove trailing slashes
  trimmed = trimmed.replace(/\/+$/, '');

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

// 1. Resolve URL from VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_ID
const rawEnvUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env.VITE_SUPABASE_PROJECT_ID
    ? `https://${String(import.meta.env.VITE_SUPABASE_PROJECT_ID).trim()}.supabase.co`
    : null);

// 2. Resolve Publishable Key (Supports standard anon key or new publishable key format)
const rawEnvKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_KEY;

const sanitizedUrl = sanitizeSupabaseUrl(rawEnvUrl);
const hasValidKey = Boolean(
  rawEnvKey &&
    typeof rawEnvKey === 'string' &&
    rawEnvKey.trim().length > 10 &&
    rawEnvKey !== 'undefined' &&
    rawEnvKey !== 'null' &&
    !rawEnvKey.includes('demo-placeholder') &&
    !rawEnvKey.includes('your-supabase')
);

export const isSupabaseConfigured: boolean = Boolean(sanitizedUrl && hasValidKey);

export const activeSupabaseUrl: string = sanitizedUrl || FALLBACK_URL;
export const activeSupabaseKey: string = (hasValidKey && rawEnvKey?.trim()) || FALLBACK_KEY;

function initSupabase(): SupabaseClient {
  try {
    return createClient(activeSupabaseUrl, activeSupabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
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

export const supabase: SupabaseClient = initSupabase();

export interface SupabaseConnectionResult {
  configured: boolean;
  connected: boolean;
  url?: string;
  projectRef?: string;
  maskedKey?: string;
  latencyMs?: number;
  message: string;
  error?: string;
}

function extractProjectRef(urlStr: string): string | undefined {
  try {
    const url = new URL(urlStr);
    const hostParts = url.hostname.split('.');
    if (hostParts.length >= 3 && hostParts[1] === 'supabase') {
      return hostParts[0];
    }
  } catch {
    // Ignore URL parse error
  }
  return undefined;
}

function maskKey(key: string): string {
  if (key.length <= 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

/**
 * Diagnostic helper to verify connectivity with Supabase.
 * Checks reachability and authentication endpoint without requiring table access.
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionResult> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      connected: false,
      message:
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) in your environment variables.',
    };
  }

  const startTime = performance.now();
  try {
    // Ping Supabase Auth endpoint (session check tests reachability and headers without requiring tables)
    const { error: authError } = await supabase.auth.getSession();
    const latencyMs = Math.round(performance.now() - startTime);

    if (authError && authError.status && authError.status >= 500) {
      return {
        configured: true,
        connected: false,
        url: activeSupabaseUrl,
        projectRef: extractProjectRef(activeSupabaseUrl),
        maskedKey: maskKey(activeSupabaseKey),
        latencyMs,
        message: `Supabase server responded with error: ${authError.message}`,
        error: authError.message,
      };
    }

    return {
      configured: true,
      connected: true,
      url: activeSupabaseUrl,
      projectRef: extractProjectRef(activeSupabaseUrl),
      maskedKey: maskKey(activeSupabaseKey),
      latencyMs,
      message: `Successfully connected to Supabase (${activeSupabaseUrl}) in ${latencyMs}ms.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      url: activeSupabaseUrl,
      projectRef: extractProjectRef(activeSupabaseUrl),
      maskedKey: maskKey(activeSupabaseKey),
      message: `Supabase connection attempt failed: ${message}`,
      error: message,
    };
  }
}

/**
 * Returns true if the Supabase error indicates that the queried table/relation
 * does not exist in the schema cache or has not been migrated yet.
 */
export function isTableMissingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { message?: string; code?: string; status?: number };
  const msg = String(err.message || '').toLowerCase();
  const code = String(err.code || '');

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('not find the table') ||
    msg.includes('relation') ||
    err.status === 404
  );
}

