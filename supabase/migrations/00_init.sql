-- ─────────────────────────────────────────────────────────────
-- GIKI Plus — Supabase SQL Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE (mirrors auth.users, adds roles)
-- ─────────────────────────────────────────────────────────────

CREATE TYPE public.role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'STAFF');

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  role        public.role NOT NULL DEFAULT 'STAFF',
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile row when a new Supabase Auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- Profiles: only the user themselves + admins can read/write
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('SUPER_ADMIN', 'ADMIN')
        AND p.is_active = true
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Users cannot change their own role
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_update_super_admin"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'SUPER_ADMIN'
        AND p.is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 3. STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────

-- Exam schedules bucket (PDF/images, admin-upload only, public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exam-schedules',
  'exam-schedules',
  true,
  10485760,  -- 10 MB max
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- Memory images bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memory-images',
  'memory-images',
  true,
  5242880,  -- 5 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Lost & found images bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lost-found-images',
  'lost-found-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Mess menu bucket (admin-upload only, public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mess-menus',
  'mess-menus',
  true,
  10485760,  -- 10 MB max
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- Storage RLS: exam-schedules — only authenticated admins can upload
CREATE POLICY "exam_schedules_upload_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exam-schedules'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('SUPER_ADMIN', 'ADMIN')
        AND p.is_active = true
    )
  );

CREATE POLICY "exam_schedules_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exam-schedules');

-- Storage RLS: memory/lost-found images — anyone can upload (rate-limited in app layer)
CREATE POLICY "memory_images_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memory-images');

CREATE POLICY "memory_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memory-images');

CREATE POLICY "lost_found_images_public_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lost-found-images');

CREATE POLICY "lost_found_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lost-found-images');

-- ─────────────────────────────────────────────────────────────
-- 4. HELPER FUNCTION — get current user role (used in app)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. SEED: Initial SUPER_ADMIN account
-- (Replace with your own email — this account must be created
--  in Supabase Auth first, then this updates the role)
-- ─────────────────────────────────────────────────────────────

-- After creating your account in Supabase Auth, run:
-- UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';
