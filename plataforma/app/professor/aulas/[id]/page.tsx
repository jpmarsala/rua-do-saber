import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import { notFound } from "next/navigation";
import { MarkAppliedForm } from "./MarkAppliedForm";

function YouTubeEmbed({ url }: { url: string | null }) {
  if (!url) return <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">Vídeo não configurado</div>;
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
  if (!videoId) return <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">URL inválida</div>;
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title="Vídeo" allowFullScreen className="w-full h-full" />
    </div>
  );
}

export default async function ProfessorAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();
  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: lesson } = await supabase.from("lessons").select("id, title, summary, collection_id").eq("id", id).single();
  if (!lesson) notFound();
  const { data: version } = await supabase.from("lesson_versions").select("id").eq("lesson_id", id).is("tenant_id", null).single();
  if (!version) notFound();
  const [content, media] = await Promise.all([
    supabase.from("lesson_content").select("*").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_media").select("youtube_url").eq("lesson_version_id", version.id).maybeSingle(),
  ]);
  const c = content.data as { learning_objective?: string; teacher_introduction?: string; discussion_questions?: string[]; activity_description?: string; home_mission?: string } | null;
  const m = media.data as { youtube_url?: string } | null;
  const { data: applied } = await supabase.from("applied_lessons").select("id").eq("teacher_id", session.id).eq("lesson_id", id).maybeSingle();
  const alreadyApplied = !!applied;

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/professor/aulas" className="hover:text-slate-700">Aulas</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{formatLessonTitleForDisplay(lesson.title)}</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{formatLessonTitleForDisplay(lesson.title)}</h1>
      {lesson.summary && <p className="text-slate-600 mb-6">{lesson.summary}</p>}
      <section className="mb-6"><YouTubeEmbed url={m?.youtube_url ?? null} /></section>
      {c?.learning_objective && <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Objetivo</h2><p className="text-slate-600 whitespace-pre-line">{c.learning_objective}</p></section>}
      {c?.teacher_introduction && <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Introdução</h2><p className="text-slate-600 whitespace-pre-line">{c.teacher_introduction}</p></section>}
      {c?.discussion_questions?.length ? <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Perguntas para debate</h2><ul className="list-disc list-inside text-slate-600">{c.discussion_questions.map((q, i) => <li key={i}>{q}</li>)}</ul></section> : null}
      {c?.activity_description && <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Atividade</h2><p className="text-slate-600 whitespace-pre-line">{c.activity_description}</p></section>}
      {c?.home_mission && <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Missão para casa</h2><p className="text-slate-600 whitespace-pre-line">{c.home_mission}</p></section>}
      <section className="mt-8 p-4 bg-slate-50 rounded-lg">
        {alreadyApplied ? <p className="text-green-700 font-medium">✓ Aula marcada como aplicada</p> : <MarkAppliedForm lessonId={id} />}
      </section>
    </div>
  );
}
