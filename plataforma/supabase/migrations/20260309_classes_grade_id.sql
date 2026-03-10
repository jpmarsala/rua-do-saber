-- Turma associada a um ano/coleção (1º ao 5º ano).
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS grade_id uuid REFERENCES public.grades(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.classes.grade_id IS 'Ano/coleção da turma (1º a 5º ano).';
CREATE INDEX IF NOT EXISTS classes_grade_id_idx ON public.classes(grade_id);
