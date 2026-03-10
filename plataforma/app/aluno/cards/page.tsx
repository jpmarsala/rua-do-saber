import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";

export default async function AlunoCardsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  const supabase = await createClient();
  if (!supabase) return <p className="text-streaming-muted">Erro ao carregar.</p>;
  const { data: completed } = await supabase.from("game_sessions").select("lesson_id").eq("user_id", session.id);
  const lessonIds = [...new Set((completed ?? []).map((r) => r.lesson_id))];
  if (lessonIds.length === 0) {
    return (
      <div className="min-h-screen bg-streaming-bg px-4 py-12">
        <h1 className="font-display text-3xl text-white mb-2">Cards conquistados</h1>
        <p className="text-streaming-muted mb-6">Conclua os jogos das aulas para desbloquear os cards.</p>
        <Link href="/aluno/aulas" className="text-primary font-medium hover:underline">Ver aulas</Link>
      </div>
    );
  }
  const { data: lessons } = await supabase.from("lessons").select("id, title").in("id", lessonIds);
  const { data: versions } = await supabase.from("lesson_versions").select("id, lesson_id").in("lesson_id", lessonIds).is("tenant_id", null);
  const versionByLesson = (versions ?? []).reduce((acc: Record<string, string>, v: { id: string; lesson_id: string }) => { acc[v.lesson_id] = v.id; return acc; }, {});
  const versionIds = Object.values(versionByLesson);
  const { data: cards } = versionIds.length ? await supabase.from("lesson_cards").select("lesson_version_id, name, description, image_url").in("lesson_version_id", versionIds) : { data: [] };
  const cardByVersion = (cards ?? []).reduce((acc: Record<string, { name?: string; description?: string; image_url?: string }>, c: { lesson_version_id: string; name?: string; description?: string; image_url?: string }) => { acc[c.lesson_version_id] = c; return acc; }, {});

  return (
    <div className="min-h-screen bg-streaming-bg px-4 py-12">
      <h1 className="font-display text-3xl text-white mb-2">Cards conquistados</h1>
      <p className="text-streaming-muted mb-8">Cards que você desbloqueou ao concluir os jogos.</p>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {(lessons ?? []).map((l: { id: string; title: string }) => {
          const vid = versionByLesson[l.id];
          const card = vid ? cardByVersion[vid] : null;
          return (
            <div key={l.id} className="rounded-xl border-2 border-primary/40 bg-streaming-bg-card p-5">
              <p className="font-semibold text-white">{card?.name ?? formatLessonTitleForDisplay(l.title)}</p>
              {card?.description && <p className="text-streaming-muted text-sm mt-1">{card.description}</p>}
              <p className="text-streaming-muted text-xs mt-2">Aula: {formatLessonTitleForDisplay(l.title)}</p>
            </div>
          );
        })}
      </div>
      <Link href="/aluno" className="inline-block mt-8 text-primary font-medium hover:underline">Voltar ao início</Link>
    </div>
  );
}
