-- ==============================================================================
-- EDUNEXA MIGRATION 00017: NOTICES & NOTIFICATIONS
-- Institutional Circulars, Read Receipts & Targeted In-App Notifications
-- ==============================================================================

BEGIN;

-- 1. Institutional Notices & Circulars
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  author_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'standard',       -- 'urgent' | 'important' | 'standard'
  category VARCHAR(50) NOT NULL DEFAULT 'Circular',       -- 'Academic' | 'Holiday' | 'Sports' | 'Exam' | 'Administrative'
  target_roles user_role[] NOT NULL DEFAULT '{student,teacher,parent}'::user_role[],
  attachment_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_notice_priority CHECK (priority IN ('urgent', 'important', 'standard'))
);

CREATE INDEX IF NOT EXISTS idx_notices_pub ON notices(institution_id, published_at DESC);

-- 2. Notice Read Receipts (Tracking acknowledgment per user)
CREATE TABLE IF NOT EXISTS notice_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_notice_user_read UNIQUE (notice_id, profile_id)
);

-- 3. Targeted In-App Notifications
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  recipient_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  category VARCHAR(50) NOT NULL,                          -- 'Attendance' | 'Exam' | 'Homework' | 'PTM' | 'System'
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON in_app_notifications(recipient_profile_id, is_read, created_at DESC);

-- 4. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  attendance_alerts BOOLEAN NOT NULL DEFAULT true,
  homework_alerts BOOLEAN NOT NULL DEFAULT true,
  exam_result_alerts BOOLEAN NOT NULL DEFAULT true,
  circular_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_notif_pref UNIQUE (profile_id, institution_id)
);

COMMIT;
