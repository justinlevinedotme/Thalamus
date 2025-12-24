-- Migration: Supabase Auth to better-auth
-- This migration creates better-auth tables and recreates application tables
-- with updated foreign keys pointing to the new user table.

-- ============================================
-- STEP 1: Create better-auth core tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.ba_user (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ba_session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ba_account (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ba_verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Two-factor authentication table
CREATE TABLE IF NOT EXISTS public.ba_two_factor (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: Drop existing application tables
-- (Fresh start - no user data migration needed)
-- ============================================

DROP TABLE IF EXISTS public.share_links CASCADE;
DROP TABLE IF EXISTS public.graphs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old functions and triggers
DROP FUNCTION IF EXISTS public.can_create_graph(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_shared_graph(uuid) CASCADE;

-- ============================================
-- STEP 3: Recreate application tables with TEXT id
-- ============================================

CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY REFERENCES public.ba_user(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  max_graphs INTEGER NOT NULL DEFAULT 20,
  retention_days INTEGER NOT NULL DEFAULT 365,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Graph',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graph_id UUID NOT NULL REFERENCES public.graphs(id) ON DELETE CASCADE,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_by TEXT NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE UNIQUE INDEX IF NOT EXISTS share_links_token_idx ON public.share_links (token);

-- ============================================
-- STEP 4: Recreate triggers
-- ============================================

-- Updated-at trigger function (if not exists from previous migration)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_graphs_updated_at
BEFORE UPDATE ON public.graphs
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Expiry defaults on insert
CREATE OR REPLACE FUNCTION public.set_graph_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at = NOW() + INTERVAL '1 year';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_graphs_expiry
BEFORE INSERT ON public.graphs
FOR EACH ROW EXECUTE PROCEDURE public.set_graph_expiry();

-- ============================================
-- STEP 5: Quota enforcement helper (updated for TEXT id)
-- ============================================

CREATE OR REPLACE FUNCTION public.can_create_graph(user_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) < COALESCE((SELECT max_graphs FROM public.profiles WHERE id = user_id), 20)
  FROM public.graphs
  WHERE owner_id = user_id;
$$;

-- ============================================
-- STEP 6: RPC for shared graph access (updated for TEXT id)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_shared_graph(share_token UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  data JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.title, g.data, g.updated_at
  FROM public.share_links s
  JOIN public.graphs g ON g.id = s.graph_id
  WHERE s.token = share_token
    AND s.expires_at > NOW();
$$;

-- Grant access to the RPC function for public share access
GRANT EXECUTE ON FUNCTION public.get_shared_graph(UUID) TO anon, authenticated;

-- ============================================
-- STEP 7: Disable RLS (authorization in API layer)
-- ============================================

-- RLS is not needed since we handle authorization in the Hono API
-- The database is only accessed by the backend server
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.graphs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_user DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_session DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_account DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_verification DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ba_two_factor DISABLE ROW LEVEL SECURITY;
