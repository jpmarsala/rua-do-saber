-- Coleções (anos) ativas por escola: o gestor libera quais grades/coleções cada escola pode usar.
CREATE TABLE IF NOT EXISTS public.school_grades (
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  grade_id uuid NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  PRIMARY KEY (school_id, grade_id)
);

COMMENT ON TABLE public.school_grades IS 'Grades (coleções/anos) ativas por escola; gestor define por escola.';

CREATE INDEX IF NOT EXISTS school_grades_school_id_idx ON public.school_grades(school_id);
CREATE INDEX IF NOT EXISTS school_grades_grade_id_idx ON public.school_grades(grade_id);
