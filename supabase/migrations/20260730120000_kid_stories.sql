-- KID STORIES
CREATE TABLE IF NOT EXISTS public.kid_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tone TEXT,
  characters TEXT,
  pages JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kid_stories TO authenticated;
GRANT ALL ON public.kid_stories TO service_role;
ALTER TABLE public.kid_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own kid_stories" ON public.kid_stories;
DROP POLICY IF EXISTS "Users insert own kid_stories" ON public.kid_stories;
DROP POLICY IF EXISTS "Users update own kid_stories" ON public.kid_stories;
DROP POLICY IF EXISTS "Users delete own kid_stories" ON public.kid_stories;

CREATE POLICY "Users view own kid_stories" ON public.kid_stories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own kid_stories" ON public.kid_stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own kid_stories" ON public.kid_stories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own kid_stories" ON public.kid_stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_kid_stories_updated_at ON public.kid_stories;
CREATE TRIGGER update_kid_stories_updated_at BEFORE UPDATE ON public.kid_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_kid_stories_user_id ON public.kid_stories(user_id, created_at DESC);
