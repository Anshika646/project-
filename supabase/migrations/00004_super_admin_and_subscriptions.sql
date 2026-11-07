-- ==============================================================================
-- EDUNEXA MIGRATION 00004: SUPER ADMIN & SUBSCRIPTIONS
-- SaaS Tier Limits, Plan Assignment, Trials & Platform Settings
-- STRICTLY ZERO PAYMENT / FEE COLLECTION MODULES
-- ==============================================================================

BEGIN;

-- 1. Super Admin Plans (SaaS Tier Quotas)
CREATE TABLE IF NOT EXISTS super_admin_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,                      -- 'Trial', 'Standard School', 'Enterprise K12', 'University Campus'
  description TEXT,
  max_students INTEGER NOT NULL DEFAULT 500,
  max_teachers INTEGER NOT NULL DEFAULT 50,
  storage_limit_gb INTEGER NOT NULL DEFAULT 10,
  features JSONB NOT NULL DEFAULT '{
    "analytics": true,
    "ptm_portal": true,
    "digital_learning": true,
    "college_module": false,
    "custom_branding": false
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Institution Subscriptions (Current License Status)
CREATE TABLE IF NOT EXISTS institution_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES super_admin_plans(id) ON DELETE RESTRICT,
  status VARCHAR(30) NOT NULL DEFAULT 'trial',            -- 'trial' | 'active' | 'suspended' | 'expired'
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_institution_subscription UNIQUE (institution_id),
  CONSTRAINT chk_sub_status CHECK (status IN ('trial', 'active', 'suspended', 'expired'))
);

-- 3. Subscription History (Lifecycle Transitions: Trials, Extensions, Plan Switches)
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES super_admin_plans(id) ON DELETE RESTRICT,
  action VARCHAR(50) NOT NULL,                           -- 'PLAN_ACTIVATED' | 'TRIAL_EXTENDED' | 'PLAN_UPGRADED' | 'SUSPENDED'
  previous_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Platform Settings (Global Super Admin Configurations)
CREATE TABLE IF NOT EXISTS platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Support Tickets (School/College Admins to Super Admin Platform Support)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  creator_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Technical',      -- 'Technical' | 'Configuration' | 'Feature Request' | 'Account'
  priority VARCHAR(20) NOT NULL DEFAULT 'standard',       -- 'urgent' | 'high' | 'standard' | 'low'
  status VARCHAR(20) NOT NULL DEFAULT 'open',             -- 'open' | 'in_progress' | 'resolved' | 'closed'
  message TEXT NOT NULL,
  admin_response TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
