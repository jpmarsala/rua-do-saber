"use client";

import { useState } from "react";
import Link from "next/link";
import type { GestorClassWithStudents } from "@/lib/gestor/dashboard-data";
import { removeStudent } from "../actions";

interface TurmasCardsProps {
  classes: GestorClassWithStudents[];
  qs: string;
  tenantId?: string;
}

export function TurmasCards({ classes, qs, tenantId }: TurmasCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRemoveStudent(studentId: string, fullName: string | null) {
    if (!confirm(`Remover o aluno "${fullName ?? "—"}"? O usuário será excluído da instituição e o e-mail liberado.`)) return;
    setError(null);
    setRemovingId(studentId);
    const result = await removeStudent(studentId, tenantId);
    setRemovingId(null);
    if (result.error) setError(result.error);
  }

  if (classes.length === 0) {
    return <p className="text-slate-500">Nenhuma turma cadastrada.</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      {classes.map((c) => (
        <div key={c.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-800">{c.name}</span>
            <span className="text-slate-500 text-sm">— {c.schoolName}</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {expandedId === c.id ? "Recolher" : "Expandir"}
              </button>
              <Link href={`/gestor/turmas/${c.id}${qs}`} className="text-sm px-3 py-1.5 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5 inline-block">
                Editar turma
              </Link>
            </div>
          </div>
          {expandedId === c.id && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-sm">
              <p className="font-medium text-slate-700 mb-2">Alunos ({c.students.length})</p>
              {c.students.length === 0 ? (
                <p className="text-slate-500">Nenhum aluno na turma.</p>
              ) : (
                <ul className="space-y-1">
                  {c.students.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-800">{s.full_name ?? "—"}</span>
                      <span className="text-slate-500 text-xs">
                        Progresso: {s.lessons_with_progress} aula(s) com atividade · {s.lessons_completed} concluída(s)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(s.id, s.full_name)}
                        disabled={removingId === s.id}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {removingId === s.id ? "Removendo…" : "Remover"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
