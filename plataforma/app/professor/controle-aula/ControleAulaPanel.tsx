"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  markIntroCompleted,
  markActivityCompleted,
  validateMission,
} from "./actions";
import type { ClassLessonState, StudentProgressItem } from "@/lib/professor/controle-aula-data";

interface Props {
  classId: string;
  lessonId: string;
  lessonTitle: string;
  state: ClassLessonState | null;
  students: StudentProgressItem[];
}

export function ControleAulaPanel({
  classId,
  lessonId,
  lessonTitle,
  state,
  students,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const introDone = !!state?.intro_completed_at;
  const activityDone = !!state?.activity_completed_at;

  async function handleIntro() {
    setError(null);
    setLoading("intro");
    const r = await markIntroCompleted(classId, lessonId);
    setLoading(null);
    if (r.error) setError(r.error);
    else router.refresh();
  }

  async function handleActivity() {
    setError(null);
    setLoading("activity");
    const r = await markActivityCompleted(classId, lessonId);
    setLoading(null);
    if (r.error) setError(r.error);
    else router.refresh();
  }

  async function handleValidateMission(userId: string) {
    setError(null);
    setLoading(userId);
    const r = await validateMission(userId, lessonId);
    setLoading(null);
    if (r.error) setError(r.error);
    else router.refresh();
  }

  const countVideo = students.filter((s) => s.video_completed_at).length;
  const countGame = students.filter((s) => s.game_completed_at).length;
  const countMission = students.filter((s) => s.mission_validated_at).length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">{lessonTitle}</h2>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-medium text-slate-800 mb-3">Cadeia da aula</h3>
        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={handleIntro}
            disabled={introDone || loading !== null}
            className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {introDone ? "✓ Introdução concluída" : "Marcar Introdução concluída"}
          </button>
          <button
            type="button"
            onClick={handleActivity}
            disabled={!introDone || activityDone || loading !== null}
            className="px-4 py-2 rounded-lg font-medium bg-slate-700 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activityDone ? "✓ Atividade concluída" : "Marcar Atividade concluída"}
          </button>
        </div>
        <p className="text-slate-600 text-sm mt-2">
          Introdução concluída → libera a aula para os alunos. Atividade concluída → libera a Missão.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium text-slate-800 mb-2">Progresso da turma</h3>
        <div className="flex gap-6 text-sm">
          <span className="text-slate-600">Introdução: {students.length} alunos</span>
          <span className="text-slate-600">Vídeo: {countVideo}</span>
          <span className="text-slate-600">Game: {countGame}</span>
          <span className="text-slate-600">Missão: {countMission}</span>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium text-slate-800 mb-3">Alunos – validar missão</h3>
        <ul className="divide-y divide-slate-200">
          {students.map((s) => (
            <li key={s.user_id} className="py-2 flex items-center justify-between gap-4">
              <div>
                <span className="font-medium text-slate-800">
                  {s.full_name ?? "Sem nome"}
                </span>
                {s.call_number != null && (
                  <span className="text-slate-500 text-sm ml-2">Nº {s.call_number}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {s.video_completed_at && (
                  <span className="text-xs text-green-600">Vídeo ✓</span>
                )}
                {s.game_completed_at && (
                  <span className="text-xs text-green-600">Game ✓</span>
                )}
                {s.mission_validated_at ? (
                  <span className="text-sm text-green-700 font-medium">Missão validada</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleValidateMission(s.user_id)}
                    disabled={loading !== null}
                    className="px-3 py-1 text-sm rounded bg-primary text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {loading === s.user_id ? "..." : "Validar missão"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {students.length === 0 && (
          <p className="text-slate-500 text-sm">Nenhum aluno nesta turma.</p>
        )}
      </section>
    </div>
  );
}
