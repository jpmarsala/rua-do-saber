import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LessonEditorForm } from "@/components/forms/LessonEditorForm";
import { createLesson } from "../actions";
import { NovaAulaFormWrapper } from "./NovaAulaFormWrapper";

export default async function AdminAulasNovaPage() {
  const supabase = await createClient();
  const [collections, grades, pillars, skills] = supabase
    ? await Promise.all([
        supabase.from("collections").select("id, title").order("year", { ascending: false }).then((r) => r.data ?? []),
        supabase.from("grades").select("id, name").order("sort_order").then((r) => r.data ?? []),
        supabase.from("pillars").select("id, name").order("sort_order").then((r) => r.data ?? []),
        supabase.from("skills").select("id, name").order("sort_order").then((r) => r.data ?? []),
      ])
    : [[], [], [], []];

  const collectionsOpt = (collections as { id: string; title: string }[]).map((c) => ({ id: c.id, name: c.title }));
  const gradesOpt = (grades as { id: string; name: string }[]).map((g) => ({ id: g.id, name: g.name }));
  const pillarsOpt = (pillars as { id: string; name: string }[]).map((p) => ({ id: p.id, name: p.name }));
  const skillsOpt = (skills as { id: string; name: string }[]).map((s) => ({ id: s.id, name: s.name }));

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
        <Link href="/admin/aulas" className="text-primary hover:underline">Aulas</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Nova aula</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nova aula</h1>
      <NovaAulaFormWrapper
        collections={collectionsOpt}
        grades={gradesOpt}
        pillars={pillarsOpt}
        skills={skillsOpt}
        createLesson={createLesson}
      />
    </div>
  );
}
