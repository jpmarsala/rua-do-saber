"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import type { TeacherClass } from "@/lib/professor/controle-aula-data";

interface Lesson {
  id: string;
  title: string;
  number_in_collection?: number | null;
}

interface Props {
  classes: TeacherClass[];
  lessons: Lesson[];
}

export function Selectors({ classes, lessons }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId") ?? "";
  const lessonId = searchParams.get("lessonId") ?? "";

  function updateClassId(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set("classId", value);
    else p.delete("classId");
    router.push("/professor/controle-aula?" + p.toString());
  }

  function updateLessonId(value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set("lessonId", value);
    else p.delete("lessonId");
    router.push("/professor/controle-aula?" + p.toString());
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Turma</label>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 min-w-[200px] bg-white"
          value={classId}
          onChange={(e) => updateClassId(e.target.value)}
        >
          <option value="">— Selecione —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.schoolName})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Aula</label>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 min-w-[240px] bg-white"
          value={lessonId}
          onChange={(e) => updateLessonId(e.target.value)}
        >
          <option value="">— Selecione —</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {formatLessonTitleForDisplay(l.title)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
