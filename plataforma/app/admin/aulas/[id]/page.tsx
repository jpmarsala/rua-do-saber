import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditarAulaFormWrapper } from "./EditarAulaFormWrapper";
import { updateLesson } from "../actions";
import type { LessonFormValues } from "@/lib/validators/lesson";

export default async function AdminAulasEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();
  if (!lesson) notFound();

  const { data: version } = await supabase
    .from("lesson_versions")
    .select("id")
    .eq("lesson_id", id)
    .is("tenant_id", null)
    .single();
  if (!version) notFound();

  const [content, media, card, game] = await Promise.all([
    supabase.from("lesson_content").select("*").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_media").select("*").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_cards").select("*").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_games").select("*").eq("lesson_version_id", version.id).maybeSingle(),
  ]);

  const [collections, grades, pillars, skills] = await Promise.all([
    supabase.from("collections").select("id, title").order("year", { ascending: false }).then((r) => r.data ?? []),
    supabase.from("grades").select("id, name").order("sort_order").then((r) => r.data ?? []),
    supabase.from("pillars").select("id, name").order("sort_order").then((r) => r.data ?? []),
    supabase.from("skills").select("id, name").order("sort_order").then((r) => r.data ?? []),
  ]);

  const defaultValues = {
    collection_id: lesson.collection_id ?? null,
    title: lesson.title,
    slug: lesson.slug ?? "",
    summary: lesson.summary ?? "",
    grade_id: lesson.grade_id ?? null,
    pillar_id: lesson.pillar_id ?? null,
    skill_id: lesson.skill_id ?? null,
    number_in_collection: lesson.number_in_collection ?? null,
    status: lesson.status as "draft" | "review" | "published" | "archived",
    learning_objective: (content.data as { learning_objective?: string } | null)?.learning_objective ?? "",
    teacher_introduction: (content.data as { teacher_introduction?: string } | null)?.teacher_introduction ?? "",
    discussion_questions: ((content.data as { discussion_questions?: string[] } | null)?.discussion_questions ?? []) as string[],
    activity_description: (content.data as { activity_description?: string } | null)?.activity_description ?? "",
    home_mission: (content.data as { home_mission?: string } | null)?.home_mission ?? "",
    youtube_url: (media.data as { youtube_url?: string } | null)?.youtube_url ?? "",
    thumbnail_url: (media.data as { thumbnail_url?: string } | null)?.thumbnail_url ?? "",
    card_name: (card.data as { name?: string } | null)?.name ?? "",
    card_description: (card.data as { description?: string } | null)?.description ?? "",
    card_image_url: (card.data as { image_url?: string } | null)?.image_url ?? "",
    game_type: (game.data as { game_type?: string } | null)?.game_type ?? "quiz",
    game_config_json: ((game.data as { config_json?: Record<string, unknown> } | null)?.config_json ?? {}) as Record<string, unknown>,
  } as Partial<LessonFormValues>;

  const collectionsOpt = (collections as { id: string; title: string }[]).map((c) => ({ id: c.id, name: c.title }));
  const gradesOpt = (grades as { id: string; name: string }[]).map((g) => ({ id: g.id, name: g.name }));
  const pillarsOpt = (pillars as { id: string; name: string }[]).map((p) => ({ id: p.id, name: p.name }));
  const skillsOpt = (skills as { id: string; name: string }[]).map((s) => ({ id: s.id, name: s.name }));

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
        <Link href="/admin/aulas" className="text-primary hover:underline">Aulas</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Editar</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Editar aula</h1>
      <EditarAulaFormWrapper
        lessonId={id}
        defaultValues={defaultValues}
        collections={collectionsOpt}
        grades={gradesOpt}
        pillars={pillarsOpt}
        skills={skillsOpt}
        updateLesson={updateLesson}
      />
    </div>
  );
}
