-- STORIES
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Story',
  prompt TEXT NOT NULL,
  genre TEXT,
  tone TEXT,
  length TEXT NOT NULL DEFAULT 'short',
  language TEXT NOT NULL DEFAULT 'en',
  characters TEXT,
  outline JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own stories" ON public.stories
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stories" ON public.stories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stories" ON public.stories
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own stories" ON public.stories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_stories_user_id ON public.stories(user_id, created_at DESC);

-- CHAPTERS
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(story_id, chapter_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chapters" ON public.chapters
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chapters" ON public.chapters
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own chapters" ON public.chapters
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own chapters" ON public.chapters
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_chapters_story_id ON public.chapters(story_id, chapter_number);