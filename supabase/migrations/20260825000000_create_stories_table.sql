-- Migration: Create stories table for 24-hour photo updates
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  headline TEXT NOT NULL,
  category TEXT DEFAULT 'Campus Story',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Stories are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Stories are viewable by authenticated users"
      ON public.stories FOR SELECT
      TO authenticated
      USING (expires_at > NOW());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Users can create their own stories'
  ) THEN
    CREATE POLICY "Users can create their own stories"
      ON public.stories FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Users can delete their own stories'
  ) THEN
    CREATE POLICY "Users can delete their own stories"
      ON public.stories FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
