"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateClass, setClassTeachers } from "@/app/gestor/turmas/actions";

type Teacher = { id: string; full_name: string | null; email: string | null };

export function EditarTurmaForm({
  classId,
  initialName,
  initialTeacherIds,
  teachers,
  tenantIdOverride,
  qs,
}: {
  classId: string;
  initialName: string;
  initialTeacherIds: string[];
  teachers: Teacher[];
  tenantIdOverride?: string | null;
  qs: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherIds, setTeacherIds] = useState<string[]>(initialTeacherIds);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateClass(classId, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleSaveTeachers(e: React.FormEvent) {
    e.preventDefault();
    setTeachersError(null);
    setTeachersLoading(true);
    const result = await setClassTeachers(classId, teacherIds, tenantIdOverride ?? undefined);
    setTeachersLoading(false);
    if (result.error) {
      setTeachersError(result.error);
      return;
    }
    router.refresh();
  }

  function toggleTeacher(id: string) {
    setTeacherIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="max-w-md space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da turma</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50">{loading ? "Salvando…" : "Salvar"}</button>
      </form>

      <form onSubmit={handleSaveTeachers} className="max-w-md space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Professores desta turma</label>
          <p className="text-slate-600 text-sm mb-2">Marque os professores que lecionam nesta turma. Eles verão a turma no Controle da aula.</p>
          {teachers.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum professor cadastrado. Convide professores em Gestor → Professores.</p>
          ) : (
            <ul className="space-y-2">
              {teachers.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`teacher-${t.id}`}
                    checked={teacherIds.includes(t.id)}
                    onChange={() => toggleTeacher(t.id)}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor={`teacher-${t.id}`} className="text-slate-800">
                    {t.full_name || t.email || t.id}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        {teachersError && <p className="text-red-600 text-sm">{teachersError}</p>}
        <button type="submit" disabled={teachersLoading || teachers.length === 0} className="px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50">
          {teachersLoading ? "Salvando…" : "Salvar professores"}
        </button>
      </form>
    </div>
  );
}
