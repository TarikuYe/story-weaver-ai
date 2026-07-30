-- =========================================================================
-- CORE PLATFORM TABLES
-- =========================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. CHARACTERS
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occupation TEXT,
  genre TEXT,
  appearance TEXT,
  backstory TEXT,
  personality TEXT,
  strengths TEXT,
  weaknesses TEXT,
  skills TEXT,
  goals TEXT,
  relationships TEXT,
  clothing TEXT,
  voice_style TEXT,
  age TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.characters TO authenticated;
GRANT ALL ON public.characters TO service_role;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own characters" ON public.characters;
DROP POLICY IF EXISTS "Users insert own characters" ON public.characters;
DROP POLICY IF EXISTS "Users update own characters" ON public.characters;
DROP POLICY IF EXISTS "Users delete own characters" ON public.characters;

CREATE POLICY "Users view own characters" ON public.characters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own characters" ON public.characters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own characters" ON public.characters FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own characters" ON public.characters FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_characters_updated_at ON public.characters;
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id, created_at DESC);


-- 2. WORLDS
CREATE TABLE IF NOT EXISTS public.worlds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  overview TEXT,
  geography TEXT,
  history TEXT,
  politics TEXT,
  religion TEXT,
  magic_system TEXT,
  technology TEXT,
  economy TEXT,
  climate TEXT,
  population TEXT,
  notable_locations JSONB,
  factions JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.worlds TO authenticated;
GRANT ALL ON public.worlds TO service_role;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Users insert own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Users update own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Users delete own worlds" ON public.worlds;

CREATE POLICY "Users view own worlds" ON public.worlds FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own worlds" ON public.worlds FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own worlds" ON public.worlds FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own worlds" ON public.worlds FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_worlds_updated_at ON public.worlds;
CREATE TRIGGER update_worlds_updated_at BEFORE UPDATE ON public.worlds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_worlds_user_id ON public.worlds(user_id, created_at DESC);


-- 3. DIALOGUES
CREATE TABLE IF NOT EXISTS public.dialogues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  characters_involved TEXT,
  emotion TEXT,
  setting TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dialogues TO authenticated;
GRANT ALL ON public.dialogues TO service_role;
ALTER TABLE public.dialogues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own dialogues" ON public.dialogues;
DROP POLICY IF EXISTS "Users insert own dialogues" ON public.dialogues;
DROP POLICY IF EXISTS "Users update own dialogues" ON public.dialogues;
DROP POLICY IF EXISTS "Users delete own dialogues" ON public.dialogues;

CREATE POLICY "Users view own dialogues" ON public.dialogues FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own dialogues" ON public.dialogues FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own dialogues" ON public.dialogues FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own dialogues" ON public.dialogues FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_dialogues_updated_at ON public.dialogues;
CREATE TRIGGER update_dialogues_updated_at BEFORE UPDATE ON public.dialogues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dialogues_user_id ON public.dialogues(user_id, created_at DESC);


-- 4. COMIC PROJECTS
CREATE TABLE IF NOT EXISTS public.comic_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  art_style TEXT,
  panel_count INTEGER NOT NULL DEFAULT 0,
  panels JSONB,
  prompt TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comic_projects TO authenticated;
GRANT ALL ON public.comic_projects TO service_role;
ALTER TABLE public.comic_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own comic_projects" ON public.comic_projects;
DROP POLICY IF EXISTS "Users insert own comic_projects" ON public.comic_projects;
DROP POLICY IF EXISTS "Users update own comic_projects" ON public.comic_projects;
DROP POLICY IF EXISTS "Users delete own comic_projects" ON public.comic_projects;

CREATE POLICY "Users view own comic_projects" ON public.comic_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own comic_projects" ON public.comic_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comic_projects" ON public.comic_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comic_projects" ON public.comic_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_comic_projects_updated_at ON public.comic_projects;
CREATE TRIGGER update_comic_projects_updated_at BEFORE UPDATE ON public.comic_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_comic_projects_user_id ON public.comic_projects(user_id, created_at DESC);


-- 5. INTERACTIVE STORIES
CREATE TABLE IF NOT EXISTS public.interactive_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT,
  current_node TEXT,
  nodes JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interactive_stories TO authenticated;
GRANT ALL ON public.interactive_stories TO service_role;
ALTER TABLE public.interactive_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own interactive_stories" ON public.interactive_stories;
DROP POLICY IF EXISTS "Users insert own interactive_stories" ON public.interactive_stories;
DROP POLICY IF EXISTS "Users update own interactive_stories" ON public.interactive_stories;
DROP POLICY IF EXISTS "Users delete own interactive_stories" ON public.interactive_stories;

CREATE POLICY "Users view own interactive_stories" ON public.interactive_stories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own interactive_stories" ON public.interactive_stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own interactive_stories" ON public.interactive_stories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own interactive_stories" ON public.interactive_stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_interactive_stories_updated_at ON public.interactive_stories;
CREATE TRIGGER update_interactive_stories_updated_at BEFORE UPDATE ON public.interactive_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_interactive_stories_user_id ON public.interactive_stories(user_id, created_at DESC);


-- 6. AUDIOBOOKS
CREATE TABLE IF NOT EXISTS public.audiobooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  voice TEXT,
  duration TEXT,
  audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audiobooks TO authenticated;
GRANT ALL ON public.audiobooks TO service_role;
ALTER TABLE public.audiobooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own audiobooks" ON public.audiobooks;
DROP POLICY IF EXISTS "Users insert own audiobooks" ON public.audiobooks;
DROP POLICY IF EXISTS "Users update own audiobooks" ON public.audiobooks;
DROP POLICY IF EXISTS "Users delete own audiobooks" ON public.audiobooks;

CREATE POLICY "Users view own audiobooks" ON public.audiobooks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own audiobooks" ON public.audiobooks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own audiobooks" ON public.audiobooks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own audiobooks" ON public.audiobooks FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_audiobooks_updated_at ON public.audiobooks;
CREATE TRIGGER update_audiobooks_updated_at BEFORE UPDATE ON public.audiobooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_audiobooks_user_id ON public.audiobooks(user_id, created_at DESC);


-- 7. GENERATED IMAGES
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.generated_images TO authenticated;
GRANT ALL ON public.generated_images TO service_role;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own generated_images" ON public.generated_images;
DROP POLICY IF EXISTS "Users insert own generated_images" ON public.generated_images;
DROP POLICY IF EXISTS "Users delete own generated_images" ON public.generated_images;

CREATE POLICY "Users view own generated_images" ON public.generated_images FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own generated_images" ON public.generated_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own generated_images" ON public.generated_images FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON public.generated_images(user_id, created_at DESC);


-- 8. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users delete own favorites" ON public.favorites;

CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id, created_at DESC);
