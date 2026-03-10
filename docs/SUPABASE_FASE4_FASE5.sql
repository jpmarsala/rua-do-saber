-- Fase 4: Distribuição por cliente
-- Fase 5: Professor, Aluno (tabelas de uso)
-- Executar no Supabase SQL Editor após Fase 2 e 3.

-- ========== FASE 4 ==========
-- Coleções liberadas por tenant (qual cliente vê qual coleção)
CREATE TABLE IF NOT EXISTS public.tenant_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, collection_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_collections_tenant ON public.tenant_collections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_collections_collection ON public.tenant_collections(collection_id);
ALTER TABLE public.tenant_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_collections_select" ON public.tenant_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "tenant_collections_insert_editor" ON public.tenant_collections FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "tenant_collections_delete_editor" ON public.tenant_collections FOR DELETE TO authenticated USING (public.is_editor());

-- ========== FASE 5 ==========
-- Turmas do professor (quais turmas o professor leciona)
CREATE TABLE IF NOT EXISTS public.teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, class_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher ON public.teacher_classes(teacher_id);

-- Aula aplicada pelo professor
CREATE TABLE IF NOT EXISTS public.applied_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  notes text
);
CREATE INDEX IF NOT EXISTS idx_applied_lessons_teacher ON public.applied_lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_applied_lessons_lesson ON public.applied_lessons(lesson_id);

-- Aluno vinculado à turma
CREATE TABLE IF NOT EXISTS public.student_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);
CREATE INDEX IF NOT EXISTS idx_student_classes_student ON public.student_classes(student_id);

-- Progresso do aluno (aula vista, jogo concluído, etc.)
CREATE TABLE IF NOT EXISTS public.lesson_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lesson_views_user ON public.lesson_views(user_id);

CREATE TABLE IF NOT EXISTS public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON public.game_sessions(user_id);

-- RLS Fase 5
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applied_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teacher_classes_select_own" ON public.teacher_classes FOR SELECT TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "teacher_classes_insert_editor" ON public.teacher_classes FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "applied_lessons_select_own" ON public.applied_lessons FOR SELECT TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "applied_lessons_insert_teacher" ON public.applied_lessons FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "student_classes_select_own" ON public.student_classes FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "student_classes_insert_editor" ON public.student_classes FOR INSERT TO authenticated WITH CHECK (public.is_editor());
CREATE POLICY "lesson_views_select_own" ON public.lesson_views FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "lesson_views_insert_own" ON public.lesson_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "game_sessions_select_own" ON public.game_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "game_sessions_insert_own" ON public.game_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
