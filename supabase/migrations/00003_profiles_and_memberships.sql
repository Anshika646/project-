-- ==============================================================================
-- EDUNEXA MIGRATION 00003: PROFILES & MEMBERSHIPS
-- Multi-Tenant Identity, RBAC & Context Bridge
-- ==============================================================================

BEGIN;

-- 1. Profiles (Global user entity linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Institution Memberships (Multi-Tenant Authorization & Roles)
CREATE TABLE IF NOT EXISTS institution_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invitation_status VARCHAR(30) NOT NULL DEFAULT 'active', -- 'pending' | 'active' | 'suspended'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_membership_tenant UNIQUE (institution_id, id),
  CONSTRAINT uq_user_institution_role UNIQUE (institution_id, profile_id, role)
);

CREATE INDEX IF NOT EXISTS idx_memberships_lookup ON institution_memberships(profile_id, institution_id, is_active);
CREATE INDEX IF NOT EXISTS idx_memberships_inst ON institution_memberships(institution_id, role);

CREATE TRIGGER trg_institution_memberships_updated_at
  BEFORE UPDATE ON institution_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
