-- Anos/coleções aos quais o professor tem acesso (IDs das grades em JSON, ex.: ["uuid1","uuid2"]).
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS grade_ids text;

COMMENT ON COLUMN public.profiles.grade_ids IS 'IDs das grades (anos) aos quais o professor tem acesso; JSON array de UUIDs.';
