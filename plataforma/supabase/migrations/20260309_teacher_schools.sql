-- Vínculo professor-escola: permite mostrar o professor no card da escola mesmo sem turma ainda (ex.: convite).
CREATE TABLE IF NOT EXISTS public.teacher_schools (
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, school_id)
);

COMMENT ON TABLE public.teacher_schools IS 'Professor vinculado à escola (ex.: convidado para essa escola); usado no card da escola mesmo sem turma.';

CREATE INDEX IF NOT EXISTS teacher_schools_teacher_id_idx ON public.teacher_schools(teacher_id);
CREATE INDEX IF NOT EXISTS teacher_schools_school_id_idx ON public.teacher_schools(school_id);
