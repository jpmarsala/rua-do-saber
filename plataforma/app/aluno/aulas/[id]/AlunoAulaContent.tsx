"use client";
import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerLessonView, registerGameComplete } from "./actions";

function YouTubeEmbed({ url }: { url: string | null }) {
  if (!url) return <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">Vídeo não configurado</div>;
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
  if (!videoId) return null;
  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title="Vídeo" allowFullScreen className="w-full h-full" />
    </div>
  );
}

export function AlunoAulaContent({
  lessonId,
  lesson,
  content,
  media,
  card,
}: {
  lessonId: string;
  lesson: { title: string; summary?: string };
  content: { learning_objective?: string; teacher_introduction?: string; discussion_questions?: string[]; activity_description?: string; home_mission?: string };
  media: { youtube_url?: string } | null;
  card: { name?: string; description?: string; image_url?: string } | null;
}) {
  const router = useRouter();
  const [gameDone, setGameDone] = useState(false);
  useEffect(() => { registerLessonView(lessonId); }, [lessonId]);
  async function handleGameComplete() {
    const r = await registerGameComplete(lessonId);
    if (!r?.error) setGameDone(true);
    router.refresh();
  }
  const c = content || {};
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{formatLessonTitleForDisplay(lesson.title)}</h1>
      {lesson.summary && <p className="text-slate-600 mb-6">{lesson.summary}</p>}
      <section className="mb-6"><YouTubeEmbed url={media?.youtube_url ?? null} /></section>
      {c.learning_objective && <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Objetivo</h2><p className="text-slate-600 whitespace-pre-line">{c.learning_objective}</p></section>}
      {c.discussion_questions?.length ? <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Perguntas para debate</h2><ul className="list-disc list-inside text-slate-600">{c.discussion_questions.map((q, i) => <li key={i}>{q}</li>)}</ul></section> : null}
      {c.activity_description && <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Atividade</h2><p className="text-slate-600 whitespace-pre-line">{c.activity_description}</p></section>}
      {c.home_mission && <section className="mb-6"><h2 className="font-semibold text-slate-800 mb-2">Missão para casa</h2><p className="text-slate-600 whitespace-pre-line">{c.home_mission}</p></section>}
      {card?.name && <section className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"><h2 className="font-semibold text-slate-800 mb-2">Card</h2><p className="font-medium">{card.name}</p>{card.description && <p className="text-slate-600 text-sm mt-1">{card.description}</p>}</section>}
      <div className="flex gap-3 mt-6">
        <Link href={`/aluno/jogos/${lessonId}`} className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90">Jogar</Link>
        <button type="button" onClick={handleGameComplete} className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50">{gameDone ? "✓ Jogo registrado" : "Concluí o jogo"}</button>
      </div>
    </>
  );
}
