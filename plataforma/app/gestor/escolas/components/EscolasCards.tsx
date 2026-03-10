"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { inviteTeacher, resendTeacherInvite, removeTeacherByEmail, updateTeacherGradeIds } from "@/app/gestor/professores/actions";
import { updateSchoolGrades, deleteSchool } from "@/app/gestor/escolas/actions";
import type { GestorSchool, GestorTeacherWithSchoolAndClasses } from "@/lib/gestor/dashboard-data";
import type { GestorGrade } from "@/lib/gestor/dashboard-data";

interface EscolasCardsProps {
  schools: GestorSchool[];
  grades: GestorGrade[];
  teachers: GestorTeacherWithSchoolAndClasses[];
  schoolGradeIds?: Record<string, string[]>;
  tenantId: string | null;
  qs: string;
}

export function EscolasCards({ schools, grades, teachers, schoolGradeIds = {}, tenantId, qs }: EscolasCardsProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inviteSchoolId, setInviteSchoolId] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "csv">("single");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [gradeIds, setGradeIds] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyRegisteredEmail, setAlreadyRegisteredEmail] = useState<string | null>(null);
  const [resendLoadingEmail, setResendLoadingEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [schoolGradesEdit, setSchoolGradesEdit] = useState<{ schoolId: string; gradeIds: string[] } | null>(null);
  const [schoolGradesSaving, setSchoolGradesSaving] = useState<string | null>(null);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editGradesTeacher, setEditGradesTeacher] = useState<{ id: string; full_name: string | null; email: string | null; grade_ids: string[] | null } | null>(null);
  const [editGradesIds, setEditGradesIds] = useState<string[]>([]);
  const [editGradesSaving, setEditGradesSaving] = useState(false);
  const [deleteSchoolConfirm, setDeleteSchoolConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteSchoolLoading, setDeleteSchoolLoading] = useState(false);

  function toggleGrade(id: string) {
    setGradeIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  async function handleResendInvite() {
    if (!alreadyRegisteredEmail || !tenantId) return;
    setError(null);
    setLoading(true);
    const result = await resendTeacherInvite(alreadyRegisteredEmail, tenantId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setAlreadyRegisteredEmail(null);
    router.refresh();
  }

  async function handleResendFromSchool(email: string) {
    if (!tenantId) return;
    setResendMessage(null);
    setResendLoadingEmail(email);
    const result = await resendTeacherInvite(email, tenantId);
    setResendLoadingEmail(null);
    if (result.error) setResendMessage({ type: "error", text: result.error });
    else setResendMessage({ type: "ok", text: "Convite reenviado." });
    router.refresh();
  }

  async function handleRemoveAndInviteAgain() {
    if (!alreadyRegisteredEmail || !tenantId) return;
    setError(null);
    setLoading(true);
    const removeResult = await removeTeacherByEmail(alreadyRegisteredEmail, tenantId);
    if (removeResult.error) {
      setLoading(false);
      setError(removeResult.error);
      return;
    }
    const inviteResult = await inviteTeacher(alreadyRegisteredEmail, fullName || alreadyRegisteredEmail.split("@")[0], tenantId, gradeIds.length ? gradeIds : null, inviteSchoolId ? [inviteSchoolId] : null);
    setLoading(false);
    if (inviteResult.error) {
      setError(inviteResult.error);
      return;
    }
    setSuccess(true);
    setAlreadyRegisteredEmail(null);
    setEmail("");
    setFullName("");
    setGradeIds([]);
    router.refresh();
  }

  async function handleSaveSchoolGrades() {
    if (!schoolGradesEdit || !tenantId) return;
    setSchoolGradesSaving(schoolGradesEdit.schoolId);
    const result = await updateSchoolGrades(schoolGradesEdit.schoolId, schoolGradesEdit.gradeIds, tenantId);
    setSchoolGradesSaving(null);
    setSchoolGradesEdit(null);
    if (result.error) setResendMessage({ type: "error", text: result.error });
    else setResendMessage({ type: "ok", text: "Coleções atualizadas." });
    router.refresh();
  }

  async function handleDeleteTeacher() {
    if (!deleteConfirmEmail || !tenantId) return;
    setDeleteLoading(true);
    const result = await removeTeacherByEmail(deleteConfirmEmail, tenantId);
    setDeleteLoading(false);
    setDeleteConfirmEmail(null);
    if (result.error) setResendMessage({ type: "error", text: result.error });
    else setResendMessage({ type: "ok", text: "Professor excluído." });
    router.refresh();
  }

  async function handleSaveTeacherGrades() {
    if (!editGradesTeacher || !tenantId) return;
    setEditGradesSaving(true);
    const result = await updateTeacherGradeIds(editGradesTeacher.id, editGradesIds.length ? editGradesIds : null, tenantId);
    setEditGradesSaving(false);
    setEditGradesTeacher(null);
    if (result.error) setResendMessage({ type: "error", text: result.error });
    else setResendMessage({ type: "ok", text: "Anos atualizados." });
    router.refresh();
  }

  async function handleDeleteSchool() {
    if (!deleteSchoolConfirm || !tenantId) return;
    setDeleteSchoolLoading(true);
    const result = await deleteSchool(deleteSchoolConfirm.id, tenantId);
    setDeleteSchoolLoading(false);
    setDeleteSchoolConfirm(null);
    if (result.error) setResendMessage({ type: "error", text: result.error });
    else setResendMessage({ type: "ok", text: "Escola excluída." });
    router.refresh();
  }

  function toggleSchoolGrade(gradeId: string) {
    if (!schoolGradesEdit) return;
    setSchoolGradesEdit({
      ...schoolGradesEdit,
      gradeIds: schoolGradesEdit.gradeIds.includes(gradeId)
        ? schoolGradesEdit.gradeIds.filter((g) => g !== gradeId)
        : [...schoolGradesEdit.gradeIds, gradeId],
    });
  }

  function toggleEditGrade(gradeId: string) {
    setEditGradesIds((prev) =>
      prev.includes(gradeId) ? prev.filter((g) => g !== gradeId) : [...prev, gradeId]
    );
  }

  async function handleSubmitSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setError(null);
    setLoading(true);
    const result = await inviteTeacher(email, fullName, tenantId, gradeIds.length ? gradeIds : null, inviteSchoolId ? [inviteSchoolId] : null);
    setLoading(false);
    if (result.error) {
      const msg = result.error.toLowerCase();
      if ((msg.includes("already") && msg.includes("registered")) || msg.includes("já existe um usuário com este e-mail")) {
        setAlreadyRegisteredEmail(email);
        setError("Este e-mail já está cadastrado. Reenvie o convite ou remova o cadastro para convidar novamente.");
      } else {
        setError(result.error);
      }
      return;
    }
    setAlreadyRegisteredEmail(null);
    setSuccess(true);
    setEmail("");
    setFullName("");
    setGradeIds([]);
    router.refresh();
  }

  async function handleSubmitCsv(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !csvFile) return;
    setError(null);
    setCsvError(null);
    setLoading(true);
    const text = await csvFile.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const header = lines[0]?.toLowerCase() ?? "";
    const emailIdx = header.includes("email") ? header.split(/[,\t;]/).findIndex((c) => c.trim().toLowerCase() === "email") : 0;
    const nameIdx = header.includes("nome") || header.includes("name") ? header.split(/[,\t;]/).findIndex((c) => {
      const t = c.trim().toLowerCase();
      return t === "nome" || t === "name" || t === "nome completo";
    }) : 1;
    const sep = header.includes(",") ? "," : header.includes(";") ? ";" : "\t";
    const rows = lines.slice(1);
    let done = 0;
    let lastError = "";
    for (const row of rows) {
      const cols = row.split(sep).map((c) => c.trim());
      const em = (emailIdx >= 0 ? cols[emailIdx] : cols[0]) ?? "";
      const name = (nameIdx >= 0 ? cols[nameIdx] : cols[1]) ?? em.split("@")[0] ?? "";
      if (!em) continue;
      const result = await inviteTeacher(em, name, tenantId, gradeIds.length ? gradeIds : null, inviteSchoolId ? [inviteSchoolId] : null);
      if (result.error) lastError = result.error;
      else done++;
    }
    setLoading(false);
    setCsvFile(null);
    if (done > 0) {
      setSuccess(true);
      router.refresh();
    }
    if (lastError) setError(rows.length > 1 ? `${done} convite(s) enviados. Último erro: ${lastError}` : lastError);
  }

  if (schools.length === 0) {
    return <p className="text-slate-500">Nenhuma escola cadastrada.</p>;
  }

  return (
    <div className="space-y-4">
      {schools.map((s) => (
        <div
          key={s.id}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
        >
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-800">{s.name}</span>
            <div className="flex items-center gap-2">
              {s.active ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Ativa</span>
              ) : (
                <span className="text-xs text-slate-500">Inativa</span>
              )}
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {expandedId === s.id ? "Recolher" : "Expandir"}
              </button>
              <button
                type="button"
                onClick={() => { setInviteSchoolId(s.id); setSuccess(false); setError(null); setMode("single"); }}
                className="text-sm px-3 py-1.5 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5"
              >
                Convidar professor
              </button>
              <button
                type="button"
                onClick={() => setDeleteSchoolConfirm({ id: s.id, name: s.name })}
                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-700 font-medium hover:bg-red-50"
              >
                Excluir escola
              </button>
            </div>
          </div>
          {expandedId === s.id && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-sm text-slate-600">
              <p><span className="font-medium text-slate-700">Nome:</span> {s.name}</p>
              {s.slug != null && s.slug !== "" && <p><span className="font-medium text-slate-700">Slug:</span> {s.slug}</p>}
              <p><span className="font-medium text-slate-700">Status:</span> {s.active ? "Ativa" : "Inativa"}</p>
              {s.created_at && <p><span className="font-medium text-slate-700">Cadastrada em:</span> {new Date(s.created_at).toLocaleDateString("pt-BR")}</p>}

              <div className="mt-3">
                <p className="font-medium text-slate-700 mb-2">Coleções (mostrar as coleções que estão ativas por escola)</p>
                <div className="flex flex-wrap gap-4 items-center">
                  {grades.map((g) => {
                    const currentIds = schoolGradesEdit?.schoolId === s.id ? schoolGradesEdit.gradeIds : (schoolGradeIds[s.id] ?? []);
                    const checked = currentIds.includes(g.id);
                    return (
                      <label key={g.id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (schoolGradesEdit?.schoolId === s.id) toggleSchoolGrade(g.id);
                            else setSchoolGradesEdit({ schoolId: s.id, gradeIds: checked ? currentIds.filter((id) => id !== g.id) : [...currentIds, g.id] });
                          }}
                          className="rounded border-slate-300 text-primary"
                        />
                        <span className="text-slate-700">{g.name}</span>
                      </label>
                    );
                  })}
                  {schoolGradesEdit?.schoolId === s.id && (
                    <button
                      type="button"
                      onClick={handleSaveSchoolGrades}
                      disabled={schoolGradesSaving === s.id}
                      className="text-sm px-3 py-1.5 rounded-lg bg-primary text-white font-medium disabled:opacity-50"
                    >
                      {schoolGradesSaving === s.id ? "Salvando…" : "Salvar"}
                    </button>
                  )}
                  {schoolGradesEdit?.schoolId === s.id && (
                    <button type="button" onClick={() => setSchoolGradesEdit(null)} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700">Cancelar</button>
                  )}
                </div>
              </div>

              {teachers.filter((t) => t.schools.some((sch) => sch.id === s.id)).length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-slate-700 mb-2">Professores desta escola</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-slate-200 rounded-lg">
                      <thead>
                        <tr className="bg-slate-50 text-left">
                          <th className="px-3 py-2 font-medium text-slate-700 border-b border-slate-200">Nome do professor convidado</th>
                          <th className="px-3 py-2 font-medium text-slate-700 border-b border-slate-200">Anos que leciona</th>
                          <th className="px-3 py-2 font-medium text-slate-700 border-b border-slate-200">Status</th>
                          <th className="px-3 py-2 font-medium text-slate-700 border-b border-slate-200">Reenviar o convite</th>
                          <th className="px-3 py-2 font-medium text-slate-700 border-b border-slate-200">Excluir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.filter((t) => t.schools.some((sch) => sch.id === s.id)).map((tp) => {
                          const teacherGradeNames = (tp.grade_ids ?? []).map((gid) => grades.find((g) => g.id === gid)?.name).filter(Boolean).join(", ") || "—";
                          return (
                            <tr key={tp.id} className="border-b border-slate-100 last:border-0">
                              <td className="px-3 py-2 text-slate-800">{tp.full_name ?? tp.email ?? "—"}</td>
                              <td className="px-3 py-2">
                                <span className="text-slate-600">{teacherGradeNames}</span>
                                <button
                                  type="button"
                                  onClick={() => { setEditGradesTeacher({ id: tp.id, full_name: tp.full_name, email: tp.email, grade_ids: tp.grade_ids ?? null }); setEditGradesIds(tp.grade_ids ?? []); }}
                                  className="ml-2 text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                                >
                                  Editar
                                </button>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`text-xs px-2 py-1 rounded ${tp.status === "active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                                  {tp.status === "active" ? "Ativo" : "Pendente"}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {tp.email && (
                                  <button
                                    type="button"
                                    onClick={() => handleResendFromSchool(tp.email!)}
                                    disabled={resendLoadingEmail === tp.email}
                                    className="text-xs px-2 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    {resendLoadingEmail === tp.email ? "Enviando…" : "Reenviar convite"}
                                  </button>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {tp.email && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmEmail(tp.email!)}
                                    className="text-xs px-2 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"
                                  >
                                    Excluir
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {resendMessage && <p className={`text-xs mt-1 ${resendMessage.type === "ok" ? "text-green-600" : "text-red-600"}`}>{resendMessage.text}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {deleteSchoolConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Excluir escola</h2>
            <p className="text-slate-600 mb-4">
              A ação irá remover definitivamente a escola <strong>{deleteSchoolConfirm.name}</strong> e todo o progresso será perdido. Os professores serão mantidos no banco e poderão continuar vinculados a outras escolas.
            </p>
            <p className="text-slate-600 mb-4">Deseja continuar?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteSchool}
                disabled={deleteSchoolLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteSchoolLoading ? "Excluindo…" : "Sim, excluir"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteSchoolConfirm(null)}
                disabled={deleteSchoolLoading}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Excluir professor</h2>
            <p className="text-slate-600 mb-4">Tem certeza que deseja excluir o professor <strong>{deleteConfirmEmail}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteTeacher}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Excluindo…" : "Excluir"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmEmail(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editGradesTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Anos que leciona</h2>
            <p className="text-slate-600 text-sm mb-4">{editGradesTeacher.full_name ?? editGradesTeacher.email ?? "—"}</p>
            <div className="flex flex-wrap gap-3 mb-4">
              {grades.map((g) => (
                <label key={g.id} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editGradesIds.includes(g.id)}
                    onChange={() => toggleEditGrade(g.id)}
                    className="rounded border-slate-300 text-primary"
                  />
                  <span className="text-slate-700">{g.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveTeacherGrades}
                disabled={editGradesSaving}
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50"
              >
                {editGradesSaving ? "Salvando…" : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setEditGradesTeacher(null)}
                disabled={editGradesSaving}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


      {inviteSchoolId && tenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Convidar professor(es)</h2>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === "single" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Um professor
              </button>
              <button
                type="button"
                onClick={() => setMode("csv")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${mode === "csv" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Planilha (CSV)
              </button>
            </div>

            {success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <p className="font-medium">Convite(s) enviado(s)!</p>
                <button type="button" onClick={() => { setSuccess(false); setInviteSchoolId(null); router.refresh(); }} className="mt-3 px-4 py-2 rounded-lg bg-primary text-white font-medium">Fechar</button>
              </div>
            ) : mode === "single" ? (
              <form onSubmit={handleSubmitSingle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white" placeholder="professor@escola.gov.br" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white" placeholder="Ex.: Maria Silva" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Anos (acesso à biblioteca)</label>
                  <div className="flex flex-wrap gap-3">
                    {grades.map((g) => (
                      <label key={g.id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={gradeIds.includes(g.id)} onChange={() => toggleGrade(g.id)} className="rounded border-slate-300 text-primary" />
                        <span className="text-slate-700">{g.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {alreadyRegisteredEmail && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                    <p className="font-medium mb-2">Este e-mail já está cadastrado.</p>
                    <p className="mb-3">Deseja reenviar o convite ou remover o cadastro e convidar novamente?</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={handleResendInvite} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50">Reenviar convite</button>
                      <button type="button" onClick={handleRemoveAndInviteAgain} disabled={loading} className="px-3 py-1.5 rounded-lg border border-amber-600 text-amber-800 text-sm font-medium hover:bg-amber-100 disabled:opacity-50">Remover e convidar de novo</button>
                    </div>
                  </div>
                )}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50">{loading ? "Enviando…" : "Enviar convite"}</button>
                  <button type="button" onClick={() => setInviteSchoolId(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700">Cancelar</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitCsv} className="space-y-4">
                <p className="text-sm text-slate-600">Envie um CSV com colunas <strong>email</strong> e <strong>nome</strong> (ou name). Separador: vírgula, ponto-e-vírgula ou tab.</p>
                <input type="file" accept=".csv,.txt" onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Anos (acesso à biblioteca) — aplicado a todos</label>
                  <div className="flex flex-wrap gap-3">
                    {grades.map((g) => (
                      <label key={g.id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={gradeIds.includes(g.id)} onChange={() => toggleGrade(g.id)} className="rounded border-slate-300 text-primary" />
                        <span className="text-slate-700">{g.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {alreadyRegisteredEmail && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                    <p className="font-medium mb-2">Este e-mail já está cadastrado.</p>
                    <p className="mb-3">Deseja reenviar o convite ou remover o cadastro e convidar novamente?</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={handleResendInvite} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50">Reenviar convite</button>
                      <button type="button" onClick={handleRemoveAndInviteAgain} disabled={loading} className="px-3 py-1.5 rounded-lg border border-amber-600 text-amber-800 text-sm font-medium hover:bg-amber-100 disabled:opacity-50">Remover e convidar de novo</button>
                    </div>
                  </div>
                )}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button type="submit" disabled={loading || !csvFile} className="px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50">{loading ? "Enviando…" : "Enviar planilha"}</button>
                  <button type="button" onClick={() => setInviteSchoolId(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
