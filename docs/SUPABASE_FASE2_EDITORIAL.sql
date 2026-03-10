-- Fase 2: Núcleo editorial — grades, pillars, skills, collections, lessons
-- Rua do Saber. Executar no Supabase SQL Editor após a Fase 1.

-- Status da aula (Guia)
CREATE TYPE lesson_status AS ENUM ('draft', 'review', 'published', 'archived');

-- Grades (anos escolares)
CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pillars (eixos / pilares pedagógicos)
CREATE TABLE IF NOT EXISTS public.pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Skills (habilidades, vinculadas a um pilar)
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id uuid REFERENCES public.pillars(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Collections (coleções nacionais — programa anual, etc.)
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  year int,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lessons (aula nacional — núcleo editorial)
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text,
  summary text,
  grade_id uuid REFERENCES public.grades(id) ON DELETE SET NULL,
  pillar_id uuid REFERENCES public.pillars(id) ON DELETE SET NULL,
  skill_id uuid REFERENCES public.skills(id) ON DELETE SET NULL,
  number_in_collection int,
  status lesson_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lesson versions (versão nacional = tenant_id NULL; depois versões por cliente)
CREATE TABLE IF NOT EXISTS public.lesson_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  version_number int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, tenant_id)
);

-- Conteúdo pedagógico da versão
CREATE TABLE IF NOT EXISTS public.lesson_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_version_id uuid NOT NULL REFERENCES public.lesson_versions(id) ON DELETE CASCADE,
  learning_objective text,
  teacher_introduction text,
  discussion_questions jsonb DEFAULT '[]',
  activity_description text,
  home_mission text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_version_id)
);

-- Mídia da versão (vídeo, thumbnail)
CREATE TABLE IF NOT EXISTS public.lesson_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_version_id uuid NOT NULL REFERENCES public.lesson_versions(id) ON DELETE CASCADE,
  youtube_url text,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_version_id)
);

-- Card de recompensa da versão
CREATE TABLE IF NOT EXISTS public.lesson_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_version_id uuid NOT NULL REFERENCES public.lesson_versions(id) ON DELETE CASCADE,
  name text,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_version_id)
);

-- Jogo da versão
CREATE TABLE IF NOT EXISTS public.lesson_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_version_id uuid NOT NULL REFERENCES public.lesson_versions(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  config_json jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lesson_version_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lessons_collection ON public.lessons(collection_id);
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON public.lessons(grade_id);
CREATE INDEX IF NOT EXISTS idx_lessons_pillar ON public.lessons(pillar_id);
CREATE INDEX IF NOT EXISTS idx_lessons_skill ON public.lessons(skill_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);
CREATE INDEX IF NOT EXISTS idx_lesson_versions_lesson ON public.lesson_versions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_versions_tenant ON public.lesson_versions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skills_pillar ON public.skills(pillar_id);

-- RLS (leitura para usuários autenticados; escrita restrita na Fase 3)
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grades_select_all" ON public.grades FOR SELECT TO authenticated USING (true);
CREATE POLICY "pillars_select_all" ON public.pillars FOR SELECT TO authenticated USING (true);
CREATE POLICY "skills_select_all" ON public.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "collections_select_all" ON public.collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesson_versions_select_all" ON public.lesson_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesson_content_select_all" ON public.lesson_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesson_media_select_all" ON public.lesson_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesson_cards_select_all" ON public.lesson_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "lesson_games_select_all" ON public.lesson_games FOR SELECT TO authenticated USING (true);
