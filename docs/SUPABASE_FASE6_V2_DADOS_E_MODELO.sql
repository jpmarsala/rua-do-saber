-- Fase 6 (v2 – Fase 1): Dados e modelo para cadeia de eventos, primeiro acesso e gamificação
-- Rua do Saber. Executar no Supabase SQL Editor APÓS Fase 1 a 5.
-- Referência: Rua_do_Saber_Fluxo_e_Gamificacao_v2.md e PLANO_IMPLANTACAO_V2.md

-- ========== 1. AVATARES (opções para o aluno escolher no primeiro acesso) ==========
CREATE TABLE IF NOT EXISTS public.avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avatars_sort ON public.avatars(sort_order);

COMMENT ON TABLE public.avatars IS 'Opções de avatar para alunos (primeiro acesso e perfil).';

-- Seed inicial de avatares (ajustar image_url conforme assets)
INSERT INTO public.avatars (slug, name, sort_order) VALUES
  ('avatar-1', 'Avatar 1', 1),
  ('avatar-2', 'Avatar 2', 2),
  ('avatar-3', 'Avatar 3', 3),
  ('avatar-4', 'Avatar 4', 4),
  ('avatar-5', 'Avatar 5', 5)
ON CONFLICT (slug) DO NOTHING;

-- ========== 2. PROFILES – username, avatar, XP e nível ==========
-- Username: primeira_letra.ultimo_sobrenome; duplicidade = k.lima2, k.lima3 (aplicado na aplicação ao importar)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_id uuid REFERENCES public.avatars(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS total_xp int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level int NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_avatar ON public.profiles(avatar_id);

COMMENT ON COLUMN public.profiles.username IS 'Login do aluno: primeira_letra.ultimo_sobrenome (ex: k.lima). Gerado na importação; único.';
COMMENT ON COLUMN public.profiles.avatar_id IS 'Avatar escolhido pelo aluno no primeiro acesso.';
COMMENT ON COLUMN public.profiles.total_xp IS 'XP total do aluno (gamificação leve).';
COMMENT ON COLUMN public.profiles.level IS 'Nível do aluno (função do total_xp).';

-- ========== 3. STUDENT_CLASSES – número da chamada ==========
-- Permite Lista de acessos: Nº da chamada | Nome | Usuário para login
ALTER TABLE public.student_classes
  ADD COLUMN IF NOT EXISTS call_number int NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_classes_class_call
  ON public.student_classes(class_id, call_number)
  WHERE call_number IS NOT NULL;

COMMENT ON COLUMN public.student_classes.call_number IS 'Número da chamada na turma (1, 2, …). Usado na Lista de acessos para primeiro acesso.';

-- ========== 4. CLASS_LESSON_STATE – controle do professor (cadeia de eventos) ==========
-- Para cada turma + aula: professor marca "Introdução concluída" e "Atividade concluída"
-- Isso libera, respectivamente, a aula (vídeo + game) e a Missão para os alunos.
CREATE TABLE IF NOT EXISTS public.class_lesson_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  intro_completed_at timestamptz NULL,
  activity_completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_class_lesson_state_class ON public.class_lesson_state(class_id);
CREATE INDEX IF NOT EXISTS idx_class_lesson_state_lesson ON public.class_lesson_state(lesson_id);

COMMENT ON TABLE public.class_lesson_state IS 'Estado da aula por turma: introdução e atividade concluídas pelo professor liberam conteúdo para os alunos.';
COMMENT ON COLUMN public.class_lesson_state.intro_completed_at IS 'Quando preenchido, alunos da turma veem a aula (mascote + vídeo + game).';
COMMENT ON COLUMN public.class_lesson_state.activity_completed_at IS 'Quando preenchido, alunos da turma veem a Missão da aula.';

-- ========== 5. STUDENT_LESSON_PROGRESS – progresso por aluno por aula ==========
-- Vídeo assistido, game concluído, missão validada (pelo professor)
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  video_completed_at timestamptz NULL,
  game_completed_at timestamptz NULL,
  mission_validated_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_user ON public.student_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_lesson ON public.student_lesson_progress(lesson_id);

COMMENT ON TABLE public.student_lesson_progress IS 'Progresso do aluno por aula: vídeo, game e missão (validada pelo professor).';
COMMENT ON COLUMN public.student_lesson_progress.mission_validated_at IS 'Preenchido quando o professor marca "Missão validada"; dispara card adicional + XP.';

-- ========== 6. STUDENT_CARDS – cards desbloqueados (game + missão) ==========
-- Um card por conclusão do game; um card adicional por missão validada (doc v2 §12)
CREATE TABLE IF NOT EXISTS public.student_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('game', 'mission')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id, source)
);

CREATE INDEX IF NOT EXISTS idx_student_cards_user ON public.student_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_lesson ON public.student_cards(lesson_id);

COMMENT ON TABLE public.student_cards IS 'Cards conquistados: source=game ao concluir o jogo; source=mission ao professor validar a missão.';

-- ========== 7. RLS – novas tabelas ==========
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_lesson_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cards ENABLE ROW LEVEL SECURITY;

-- Avatares: leitura para todos autenticados (aluno precisa ver opções no primeiro acesso)
CREATE POLICY "avatars_select_authenticated"
  ON public.avatars FOR SELECT TO authenticated USING (true);

-- class_lesson_state: professor da turma pode atualizar; alunos podem ler (saber se aula/missão está liberada)
CREATE POLICY "class_lesson_state_select"
  ON public.class_lesson_state FOR SELECT TO authenticated USING (true);

CREATE POLICY "class_lesson_state_update_teacher"
  ON public.class_lesson_state FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_classes tc
      WHERE tc.class_id = class_lesson_state.class_id AND tc.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_classes tc
      WHERE tc.class_id = class_lesson_state.class_id AND tc.teacher_id = auth.uid()
    )
  );

CREATE POLICY "class_lesson_state_insert_teacher"
  ON public.class_lesson_state FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_classes tc
      WHERE tc.class_id = class_id AND tc.teacher_id = auth.uid()
    )
  );

-- student_lesson_progress: aluno lê/insere/atualiza próprio progresso (vídeo, game); mission_validated_at só via service/backend
CREATE POLICY "student_lesson_progress_select_own"
  ON public.student_lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "student_lesson_progress_insert_own"
  ON public.student_lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_lesson_progress_update_own"
  ON public.student_lesson_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- student_cards: aluno só lê os próprios; inserção ao concluir game ou ao validar missão (via service role ou trigger)
CREATE POLICY "student_cards_select_own"
  ON public.student_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Inserção em student_cards e atualização de mission_validated_at em student_lesson_progress
-- devem ser feitas pela aplicação com service role (quando professor valida missão ou quando game é concluído).

-- ========== 8. TRIGGER updated_at para class_lesson_state e student_lesson_progress ==========
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS class_lesson_state_updated_at ON public.class_lesson_state;
CREATE TRIGGER class_lesson_state_updated_at
  BEFORE UPDATE ON public.class_lesson_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS student_lesson_progress_updated_at ON public.student_lesson_progress;
CREATE TRIGGER student_lesson_progress_updated_at
  BEFORE UPDATE ON public.student_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
