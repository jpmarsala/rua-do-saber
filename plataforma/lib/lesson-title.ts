/**
 * Remove a numeração global (1 a 120) do título da aula na exibição.
 * O banco pode guardar "Aula 21 - Ano 1 - Aula 21 — Título"; exibimos "Aula 21 - Ano 1 - Título".
 */
export function formatLessonTitleForDisplay(
  title: string | null | undefined
): string {
  if (title == null || title === "") return "";
  return title
    .replace(/\s*-\s*Aula\s*\d{1,3}\s*[—\-]?\s*/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
