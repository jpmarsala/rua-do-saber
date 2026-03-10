"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resendTeacherInvite, removeTeacherByEmail, updateTeacherGradeIds } from "@/app/gestor/professores/actions";
import type { GestorTeacherWithSchoolAndClasses, GestorGrade } from "@/lib/gestor/dashboard-data";

interface ProfessoresCardsProps {
  teachers: GestorTeacherWithSchoolAndClasses[];
  grades: GestorGrade[];
  tenantId: string | null;
  qs: string;
}

export function ProfessoresCards({ teachers, grades, tenantId, qs }: ProfessoresCardsProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingGradeIds, setEditingGradeIds] = useState<string[]>([]);
  const [savingTeacherId, setSavingTeacherId] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<{ email: string; type: "ok" | "error"; text: string } | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  function toggleGrade(gradeId: string) {
    setEditingGradeIds((prev) =>
      prev.includes(gradeId) ? prev.filter((id) => id !== gradeId) : [...prev, gradeId]
    );
  }

  async function handleSaveGrades(teacherId: string, email: string | null) {
    if (!tenantId) return;
    setMessage(null);
    setSavingTeacherId(teacherId);
    const result = await updateTeacherGradeIds(teacherId, editingGradeIds.length ? editingGradeIds : null, tenantId);
    setSavingTeacherId(null);
    if (result.error) setMessage({ email: email ?? "", type: "error", text: result.error });
    else { setMessage({ email: email ?? "", type: "ok", text: "Anos atualizados." }); router.refresh(); }
  }

  async function handleResend(email: string) {
    if (!email) return;
    setMessage(null);
    setLoadingEmail(email);
    const result = await resendTeacherInvite(email, tenantId);
    setLoadingEmail(null);
    if (result.error) setMessage({ email, type: "error", text: result.error });
    else setMessage({ email, type: "ok", text: "Convite reenviado." });
    router.refresh();
  }

  async function handleRemove(email: string) {
    if (!email || !tenantId) return;
    setRemoveConfirm(null);
    setMessage(null);
    const result = await removeTeacherByEmail(email, tenantId);
    if (result.error) setMessage({ email, type: "error", text: result.error });
    else { setMessage({ email, type: "ok", text: "Professor removido. Você pode convidá-lo novamente em Escolas." }); router.refresh(); }
  }

  if (teachers.length === 0) {
    return <p className="text-slate-500">Nenhum professor cadastrado.</p>;
  }

  return (
    <div className="space-y-4">
      {teachers.map((t) => (
        <div key={t.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-800">{t.full_name ?? "—"}</span>
              {t.email && <span className="text-slate-500 text-sm block">{t.email}</span>}
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${t.status === "active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                {t.status === "active" ? "Ativo" : "Pendente"}
              </span>
              {message?.email === t.email && (
                <p className={`text-sm mt-1 ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setExpandedId(expandedId === t.id ? null : t.id); if (expandedId !== t.id) setEditingGradeIds(t.grade_ids ?? []); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {expandedId === t.id ? "Recolher" : "Expandir"}
              </button>
              {t.email && (
                <>
                <button
                  type="button"
                  onClick={() => handleResend(t.email!)}
                  disabled={loadingEmail === t.email}
                  className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loadingEmail === t.email ? "Enviando…" : "Reenviar convite"}
                </button>
                <button
                  type="button"
                  onClick={() => setRemoveConfirm(removeConfirm === t.email ? null : t.email!)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                >
                  Remover professor
                </button>
                </>
              )}
              {removeConfirm === t.email && (
                <span className="text-xs text-slate-600">
                  Confirmar? <button type="button" onClick={() => handleRemove(t.email!)} className="text-red-600 font-medium">Sim, remover</button>
                  {" "}
                  <button type="button" onClick={() => setRemoveConfirm(null)} className="text-slate-600">Não</button>
                </span>
              )}
            </div>
          </div>
          {expandedId === t.id && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-sm text-slate-600 space-y-2">
              <p><span className="font-medium text-slate-700">E-mail:</span> {t.email ?? "—"}</p>
              {t.schools.length > 0 && (
                <p>
                  <span className="font-medium text-slate-700">Escola(s):</span>{" "}
                  {t.schools.map((s) => (
                    <Link key={s.id} href={`/gestor/escolas/${s.id}${qs}`} className="text-primary hover:underline mr-1">
                      {s.name}
                    </Link>
                  ))}
                </p>
              )}
              {t.classes.length > 0 && (
                <p>
                  <span className="font-medium text-slate-700">Turmas:</span>{" "}
                  {t.classes.map((c) => (
                    <Link key={c.id} href={`/gestor/turmas/${c.id}${qs}`} className="text-primary hover:underline mr-1">
                      {c.name}
                    </Link>
                  ))}
                </p>
              )}
              <div>
                <span className="font-medium text-slate-700">Anos (coleções) que leciona:</span>
                {grades.length > 0 ? (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {grades.map((g) => (
                      <label key={g.id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingGradeIds.includes(g.id)}
                          onChange={() => toggleGrade(g.id)}
                          className="rounded border-slate-300 text-primary"
                        />
                        <span className="text-slate-700">{g.name}</span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleSaveGrades(t.id, t.email)}
                      disabled={savingTeacherId === t.id}
                      className="ml-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {savingTeacherId === t.id ? "Salvando…" : "Salvar anos"}
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs mt-1">Nenhum ano cadastrado na base editorial.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
