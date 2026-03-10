import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import { notFound } from "next/navigation";
import { AlunoAulaContent } from "./AlunoAulaContent";

export default async function AlunoAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: lesson } = await supabase.from("lessons").select("id, title, summary, collection_id").eq("id", id).single();
  if (!lesson) notFound();
  const { data: version } = await supabase.from("lesson_versions").select("id").eq("lesson_id", id).is("tenant_id", null).single();
  if (!version) notFound();
  const [content, media, card] = await Promise.all([
    supabase.from("lesson_content").select("*").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_media").select("youtube_url").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_cards").select("name, description, image_url").eq("lesson_version_id", version.id).maybeSingle(),
  ]);
  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/aluno/aulas" className="hover:text-slate-700">Aulas</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{formatLessonTitleForDisplay(lesson.title)}</span>
      </nav>
      <AlunoAulaContent
        lessonId={id}
        lesson={{ title: formatLessonTitleForDisplay(lesson.title), summary: lesson.summary ?? undefined }}
        content={content.data as object}
        media={media.data as { youtube_url?: string } | null}
        card={card.data as { name?: string; description?: string; image_url?: string } | null}
      />
    </div>
  );
}
