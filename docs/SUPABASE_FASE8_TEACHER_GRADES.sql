-- Fase 8: Anos (grades) do professor — acesso à biblioteca por ano
-- teacher_grades define quais anos (1º–5º) o professor acessa; a biblioteca de aulas
-- é filtrada por lesson.grade_id IN (teacher_grades do professor).
-- O convite do gestor envia grade_ids no metadata; este trigger preenche teacher_grades.
-- Executar após Fase 2 (grades) e Fase 7 (handle_new_user).

-- Tabela: quais anos cada professor tem acesso
CREATE TABLE IF NOT EXISTS public.teacher_grades (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, grade_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_grades_user_id ON public.teacher_grades(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_grades_grade_id ON public.teacher_grades(grade_id);

COMMENT ON TABLE public.teacher_grades IS 'Anos (séries) que o professor leciona; define acesso à biblioteca de aulas por grade.';

-- Atualizar trigger: ao criar perfil de professor, inserir teacher_grades a partir de grade_ids do convite
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta_role text := nullif(trim(new.raw_user_meta_data->>'role'), '');
  meta_tenant_id uuid := (new.raw_user_meta_data->>'tenant_id')::uuid;
  meta_grade_ids text := nullif(trim(new.raw_user_meta_data->>'grade_ids'), '');
  final_role public.app_role := 'student';
  final_tenant_id uuid := null;
  gid uuid;
BEGIN
  IF meta_role IN ('teacher', 'manager') AND meta_tenant_id IS NOT NULL THEN
    final_role := meta_role::public.app_role;
    final_tenant_id := meta_tenant_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, tenant_id)
  VALUES (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      split_part(new.email, '@', 1)
    ),
    final_role,
    final_tenant_id
  );

  -- Se for professor e tiver grade_ids no metadata (convite), preencher teacher_grades
  IF final_role = 'teacher' AND meta_grade_ids IS NOT NULL AND meta_grade_ids <> '' AND meta_grade_ids <> '[]' THEN
    FOR gid IN SELECT (jsonb_array_elements_text(meta_grade_ids::jsonb))::uuid
    LOOP
      INSERT INTO public.teacher_grades (user_id, grade_id)
      VALUES (new.id, gid)
      ON CONFLICT (user_id, grade_id) DO NOTHING;
    END LOOP;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: professor pode ler seus próprios teacher_grades (para filtrar biblioteca)
ALTER TABLE public.teacher_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own teacher_grades"
  ON public.teacher_grades FOR SELECT
  USING (auth.uid() = user_id);
