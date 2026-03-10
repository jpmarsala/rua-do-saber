import { createClient } from "@/lib/supabase/server";
import { getSession } from "./get-session";
import { getCollectionsAndLessonsForCurrentTenant } from "./lessons-for-tenant";

/** Aulas que o aluno já assistiu (tem lesson_view) */
export async function getViewedLessonIds(): Promise<Set<string>> {
  const session = await getSession();
  if (!session) return new Set();
  const supabase = await createClient();
  if (!supabase) return new Set();
  const { data } = await supabase.from("lesson_views").select("lesson_id").eq("user_id", session.id);
  return new Set((data ?? []).map((r) => r.lesson_id));
}

/** Aulas em que o aluno concluiu o jogo (card desbloqueado) */
export async function getCompletedLessonIds(): Promise<Set<string>> {
  const session = await getSession();
  if (!session) return new Set();
  const supabase = await createClient();
  if (!supabase) return new Set();
  const { data } = await supabase.from("game_sessions").select("lesson_id").eq("user_id", session.id);
  return new Set((data ?? []).map((r) => r.lesson_id));
}

/** Lições do tenant + ids vistos e concluídos para o aluno atual */
export async function getAlunoHomeData() {
  const { lessons, session } = await getCollectionsAndLessonsForCurrentTenant();
  const [viewedIds, completedIds] = await Promise.all([getViewedLessonIds(), getCompletedLessonIds()]);
  const orderedLessons = [...(lessons ?? [])].sort(
    (a: { number_in_collection?: number }, b: { number_in_collection?: number }) =>
      (a.number_in_collection ?? 0) - (b.number_in_collection ?? 0)
  );
  const carouselLessons = orderedLessons.slice(0, 6);
  const aulaDeHoje = orderedLessons.find((l: { id: string }) => !viewedIds.has(l.id)) ?? orderedLessons[0];
  return {
    session,
    lessons: orderedLessons,
    carouselLessons: carouselLessons.length ? carouselLessons : orderedLessons.slice(0, 6),
    aulaDeHoje,
    viewedIds,
    completedIds,
  };
}
