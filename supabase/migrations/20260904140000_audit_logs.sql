-- ─── Audit Logs & Content Snapshots Migration ───────────────────────────────
-- Tracks all admin actions with timestamps, user, and change summaries.
-- Stores content snapshots for rollback/undo of published content.

-- ─── 1. Types ────────────────────────────────────────────────────────────────

DROP TYPE IF EXISTS public.audit_action CASCADE;
CREATE TYPE public.audit_action AS ENUM (
  'login',
  'logout',
  'create',
  'update',
  'delete',
  'publish',
  'unpublish',
  'upload',
  'set_active',
  'rollback'
);

DROP TYPE IF EXISTS public.audit_entity CASCADE;
CREATE TYPE public.audit_entity AS ENUM (
  'hero_image',
  'brand',
  'magazine',
  'team_member',
  'auth'
);

-- ─── 2. Tables ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_email    TEXT NOT NULL DEFAULT '',
  action        public.audit_action NOT NULL,
  entity_type   public.audit_entity NOT NULL,
  entity_id     TEXT,
  entity_name   TEXT DEFAULT '',
  summary       TEXT NOT NULL DEFAULT '',
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.content_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   public.audit_entity NOT NULL,
  entity_id     TEXT NOT NULL,
  entity_name   TEXT DEFAULT '',
  snapshot_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by    UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_by_email TEXT NOT NULL DEFAULT '',
  audit_log_id  UUID REFERENCES public.audit_logs(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. Indexes ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_entity ON public.content_snapshots(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_created_at ON public.content_snapshots(created_at DESC);

-- ─── 4. Functions ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
$$;

-- ─── 5. Enable RLS ───────────────────────────────────────────────────────────

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_snapshots ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS Policies ─────────────────────────────────────────────────────────

-- audit_logs: admins can read all, insert their own
DROP POLICY IF EXISTS "admins_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admins_read_audit_logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "admins_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "admins_insert_audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

-- content_snapshots: admins can read and insert
DROP POLICY IF EXISTS "admins_read_content_snapshots" ON public.content_snapshots;
CREATE POLICY "admins_read_content_snapshots"
ON public.content_snapshots
FOR SELECT
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "admins_insert_content_snapshots" ON public.content_snapshots;
CREATE POLICY "admins_insert_content_snapshots"
ON public.content_snapshots
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());
