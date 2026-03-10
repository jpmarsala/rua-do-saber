-- Registro explícito de "aula aplicada" pelo professor (opção B).
CREATE TABLE IF NOT EXISTS public.lesson_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.lesson_applications IS 'Registro de aulas aplicadas pelo professor (quando o professor registra que aplicou uma aula).';

CREATE INDEX IF NOT EXISTS lesson_applications_teacher_id_idx ON public.lesson_applications(teacher_id);
CREATE INDEX IF NOT EXISTS lesson_applications_lesson_id_idx ON public.lesson_applications(lesson_id);
CREATE INDEX IF NOT EXISTS lesson_applications_class_id_idx ON public.lesson_applications(class_id);
CREATE INDEX IF NOT EXISTS lesson_applications_applied_at_idx ON public.lesson_applications(applied_at);
