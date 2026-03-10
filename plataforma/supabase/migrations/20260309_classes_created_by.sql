-- Turma criada por qual professor: ao criar uma turma, o professor fica registrado como criador.
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.classes.created_by IS 'Professor que criou a turma (profiles.id com role=teacher).';

CREATE INDEX IF NOT EXISTS classes_created_by_idx ON public.classes(created_by);
