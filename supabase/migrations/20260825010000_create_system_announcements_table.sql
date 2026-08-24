-- Migration: Create system_announcements table for campus-wide broadcasts
CREATE TABLE IF NOT EXISTS public.system_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  banner_type TEXT DEFAULT 'info', -- 'info' | 'warning' | 'success' | 'urgent'
  target_audience TEXT DEFAULT 'all', -- 'all' | 'students' | 'alumni'
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.system_announcements(is_active, created_at DESC);

ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_announcements' AND policyname = 'Announcements are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Announcements are viewable by authenticated users"
      ON public.system_announcements FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_announcements' AND policyname = 'Admins can manage announcements'
  ) THEN
    CREATE POLICY "Admins can manage announcements"
      ON public.system_announcements FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
