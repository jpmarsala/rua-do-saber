-- Renomeia aulas para o formato "Aula N - Ano M - Título"
-- Lógica: number_in_collection 1-24 = Ano 1, 25-48 = Ano 2, 49-72 = Ano 3, 73-96 = Ano 4, 97-120 = Ano 5
-- N = número da aula no ano (1 a 24), M = número do ano (1 a 5)

UPDATE lessons
SET
  title = (
    'Aula ' || (((number_in_collection - 1) % 24) + 1)
    || ' - Ano ' || (FLOOR((number_in_collection - 1)::numeric / 24) + 1)
    || ' - ' || COALESCE(
      NULLIF(TRIM(regexp_replace(title, '^Aula\s*\d+\s*-\s*', '')), ''),
      title
    )
  ),
  slug = (
    'aula-' || (((number_in_collection - 1) % 24) + 1)
    || '-ano-' || (FLOOR((number_in_collection - 1)::numeric / 24) + 1)
  ),
  updated_at = now()
WHERE number_in_collection IS NOT NULL
  AND number_in_collection >= 1;
