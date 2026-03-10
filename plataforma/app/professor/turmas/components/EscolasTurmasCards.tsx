"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ProfessorSchool } from "@/lib/professor/escolas-turmas-data";
import type { GestorGrade } from "@/lib/gestor/dashboard-data";
import {
  createClass,
  updateClass,
  inviteStudentToClass,
  removeStudentFromClass,
  getClassStudentsAction,
  getClassStudentsWithProgressAction,
  importStudentsFromCsvAction,
  deleteClass,
} from "../actions";

interface EscolasTurmasCardsProps {
  schools: ProfessorSchool[];
  grades: { id: string; name: string }[];
}

type StudentItem = { id: string; full_name: string | null; email: string | null; status?: string };
type StudentWithProgress = StudentItem & {
  lessons_with_progress: number;
  lessons_completed: number;
};

function parseCsvFile(file: File): Promise<{ email: string; full_name?: string | null }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length < 2) {
          resolve([]);
          return;
        }
        const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
        const emailIdx = header.findIndex((h) => h === "email");
        const nameIdx = header.findIndex((h) => h === "name" || h === "full_name" || h === "nome");
        if (emailIdx === -1) {
          resolve([]);
          return;
        }
        const rows: { email: string; full_name?: string | null }[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
          const email = (values[emailIdx] ?? "").trim();
          if (!email) continue;
          const full_name = nameIdx >= 0 && values[nameIdx] ? values[nameIdx].trim() || undefined : undefined;
          rows.push({ email, full_name: full_name ?? null });
        }
        resolve(rows);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
}

export function EscolasTurmasCards({ schools, grades }: EscolasTurmasCardsProps) {
  const router = useRouter();
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [classStudents, setClassStudents] = useState<StudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [inviteClassId, setInviteClassId] = useState<string | null>(null);
  const [newTurmaSchoolId, setNewTurmaSchoolId] = useState<string | null>(null);
  const [newTurmaName, setNewTurmaName] = useState("");
  const [newTurmaGradeId, setNewTurmaGradeId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [addStudentsClassId, setAddStudentsClassId] = useState<string | null>(null);
  const [viewStudentsClassId, setViewStudentsClassId] = useState<string | null>(null);
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [editClassStudents, setEditClassStudents] = useState<StudentWithProgress[]>([]);
  const [editClassStudentsClassId, setEditClassStudentsClassId] = useState<string | null>(null);
  const [classStudentsWithProgress, setClassStudentsWithProgress] = useState<StudentWithProgress[]>([]);
  const [loadingStudentsProgress, setLoadingStudentsProgress] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [csvResult, setCsvResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResultClassId, setCsvResultClassId] = useState<string | null>(null);
  const [removeLoadingId, setRemoveLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewProgressClassId, setViewProgressClassId] = useState<string | null>(null);
  const [studentsWithProgress, setStudentsWithProgress] = useState<StudentWithProgress[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const [editPanelClassId, setEditPanelClassId] = useState<string | null>(null);
  const [deleteClassLoading, setDeleteClassLoading] = useState<string | null>(null);

  const loadStudentsWithProgress = useCallback(async (classId: string) => {
    setLoadingStudentsProgress(true);
    const res = await getClassStudentsWithProgressAction(classId);
    setLoadingStudentsProgress(false);
    if (res.data) setClassStudentsWithProgress(res.data);
    setViewStudentsClassId(classId);
  }, []);

  const closeViewStudents = useCallback(() => {
    setViewStudentsClassId(null);
    setClassStudentsWithProgress([]);
  }, []);

  async function loadStudents(classId: string) {
    setLoadingStudents(true);
    const res = await getClassStudentsAction(classId);
    setLoadingStudents(false);
    if (res.data) setClassStudents(res.data);
    setExpandedClassId(classId);
  }
  function closeClassExpand() {
    setExpandedClassId(null);
    setClassStudents([]);
  }
  async function handleCreateClass(schoolId: string) {
    if (!newTurmaName.trim()) return;
    setCreateError(null);
    setCreateLoading(true);
    const gradeId = newTurmaGradeId.trim() || null;
    const res = await createClass(schoolId, newTurmaName.trim(), gradeId);
    setCreateLoading(false);
    if (res.error) {
      setCreateError(res.error);
      return;
    }
    setNewTurmaSchoolId(null);
    setNewTurmaName("");
    setNewTurmaGradeId("");
    router.refresh();
  }

  async function handleUpdateClass(classId: string) {
    setEditLoading(true);
    const res = await updateClass(classId, editName.trim());
    setEditLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setEditClassId(null);
    setEditName("");
    setEditPanelClassId(null);
    setExpandedClassId(null);
    router.refresh();
  }

  async function handleInviteStudent(classId: string) {
    if (!inviteEmail.trim()) return;
    setInviteError(null);
    setInviteLoading(true);
    const res = await inviteStudentToClass(classId, inviteEmail.trim(), inviteName.trim() || undefined);
    setInviteLoading(false);
    if (res.error) {
      setInviteError(res.error);
      return;
    }
    setInviteEmail("");
    setInviteName("");
    setAddStudentsClassId(null);
    if (viewStudentsClassId === classId) loadStudentsWithProgress(classId);
    router.refresh();
  }

  async function handleRemoveStudent(classId: string, studentId: string) {
    setRemoveLoadingId(studentId);
    const res = await removeStudentFromClass(studentId, classId);
    setRemoveLoadingId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setClassStudentsWithProgress((prev) => prev.filter((s) => s.id !== studentId));
    setEditClassStudents((prev) => prev.filter((s) => s.id !== studentId));
    router.refresh();
  }

  async function handleDeleteClass(classId: string) {
    if (!confirm("Excluir esta turma? Os alunos continuarão cadastrados na instituição, mas serão desvinculados da turma.")) return;
    setDeleteClassLoading(classId);
    const res = await deleteClass(classId);
    setDeleteClassLoading(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setExpandedClassId(null);
    setAddStudentsClassId(null);
    setViewStudentsClassId(null);
    setEditPanelClassId(null);
    setEditClassId(null);
    router.refresh();
  }

  async function handleCsvImport(classId: string, file: File) {
    setCsvLoading(true);
    setCsvResult(null);
    setCsvResultClassId(classId);
    try {
      const rows = await parseCsvFile(file);
      if (rows.length === 0) {
        setCsvResult({ added: 0, skipped: 0, errors: ["Nenhuma linha válida (é necessário coluna 'email')."] });
        setCsvLoading(false);
        return;
      }
      const res = await importStudentsFromCsvAction(classId, rows);
      setCsvLoading(false);
      if (res.error) {
        setCsvResult({ added: 0, skipped: 0, errors: [res.error] });
        return;
      }
      setCsvResult(res.data ?? { added: 0, skipped: 0, errors: [] });
      if (viewStudentsClassId === classId) loadStudentsWithProgress(classId);
      router.refresh();
    } catch (e) {
      setCsvLoading(false);
      setCsvResult({ added: 0, skipped: 0, errors: [e instanceof Error ? e.message : "Erro ao ler o arquivo."] });
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
      {schools.map((school) => (
        <div key={school.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-800">{school.name}</span>
            <button
              type="button"
              onClick={() => setExpandedSchoolId(expandedSchoolId === school.id ? null : school.id)}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {expandedSchoolId === school.id ? "Recolher" : "Expandir"}
            </button>
          </div>
          {expandedSchoolId === school.id && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <div>
                <h3 className="font-medium text-slate-700 mb-2">Turmas</h3>
                {newTurmaSchoolId === school.id ? (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newTurmaName}
                      onChange={(e) => setNewTurmaName(e.target.value)}
                      placeholder="Nome da turma"
                      className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                    />
                    <select
                      value={newTurmaGradeId}
                      onChange={(e) => setNewTurmaGradeId(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                    >
                      <option value="">Ano</option>
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleCreateClass(school.id)}
                      disabled={createLoading || !newTurmaName.trim()}
                      className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
                    >
                      {createLoading ? "Criando…" : "Criar turma"}
                    </button>
                    <button type="button" onClick={() => { setNewTurmaSchoolId(null); setNewTurmaName(""); setNewTurmaGradeId(""); setCreateError(null); }} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
                      Cancelar
                    </button>
                    {createError && <span className="text-red-600 text-sm">{createError}</span>}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setNewTurmaSchoolId(school.id)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5 mb-3"
                  >
                    + Nova turma
                  </button>
                )}

                <ul className="space-y-2">
                  {school.classes.map((c) => (
                    <li key={c.id} className="border border-slate-200 rounded-lg bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {editClassId === c.id ? (
                          <div className="flex flex-wrap items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 rounded border border-slate-300 bg-white text-sm flex-1 min-w-[120px]"
                            />
                            <button type="button" onClick={() => handleUpdateClass(c.id)} disabled={editLoading} className="px-2 py-1 rounded bg-primary text-white text-sm">Salvar</button>
                            <button type="button" onClick={() => { setEditClassId(null); setEditName(""); setEditPanelClassId(null); setExpandedClassId(null); }} className="px-2 py-1 rounded border text-sm">Cancelar</button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-slate-800">{c.name}</span>
                            <span className="text-slate-500 text-sm">{c.studentsCount} aluno(s)</span>
                          </>
                        )}
                        {editClassId !== c.id && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button type="button" onClick={() => { setAddStudentsClassId(addStudentsClassId === c.id ? null : c.id); setImportResult(null); setViewProgressClassId(null); setEditPanelClassId(null); setExpandedClassId(addStudentsClassId === c.id ? null : c.id); if (addStudentsClassId !== c.id) loadStudents(c.id); }} className="text-xs px-2 py-1 rounded border border-primary text-primary hover:bg-primary/5">Adicionar alunos</button>
                            <button type="button" onClick={async () => { const isOpen = viewProgressClassId === c.id; setViewProgressClassId(isOpen ? null : c.id); setAddStudentsClassId(null); setEditPanelClassId(null); setExpandedClassId(isOpen ? null : c.id); if (!isOpen) { setLoadingStudents(true); const r = await getClassStudentsWithProgressAction(c.id); setLoadingStudents(false); if (r.data) setStudentsWithProgress(r.data); } }} className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">Ver alunos</button>
                            <button type="button" onClick={() => { setEditPanelClassId(editPanelClassId === c.id ? null : c.id); setEditClassId(c.id); setEditName(c.name); setAddStudentsClassId(null); setViewProgressClassId(null); setExpandedClassId(editPanelClassId === c.id ? null : c.id); if (editPanelClassId !== c.id) loadStudents(c.id); }} className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">Editar</button>
                            <Link href={`/professor/controle-aula?classId=${c.id}`} className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">Controle da aula</Link>
                            <button type="button" onClick={() => handleDeleteClass(c.id)} disabled={deleteClassLoading === c.id} className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50">{deleteClassLoading === c.id ? "Excluindo…" : "Excluir turma"}</button>
                          </div>
                        )}
                      </div>

                      {expandedClassId === c.id && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          {addStudentsClassId === c.id && (
                            <>
                              <p className="font-medium text-slate-700 text-sm mb-2">Adicionar alunos</p>
                              {inviteClassId === c.id ? (
                                <div className="mb-3 p-2 rounded bg-slate-50 space-y-2">
                                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="E-mail do aluno" className="w-full px-2 py-1 rounded border text-sm" />
                                  <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Nome (opcional)" className="w-full px-2 py-1 rounded border text-sm" />
                                  {inviteError && <p className="text-red-600 text-xs">{inviteError}</p>}
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => handleInviteStudent(c.id)} disabled={inviteLoading || !inviteEmail.trim()} className="px-2 py-1 rounded bg-primary text-white text-sm">Convidar</button>
                                    <button type="button" onClick={() => { setInviteClassId(null); setInviteEmail(""); setInviteName(""); setInviteError(null); }} className="px-2 py-1 rounded border text-sm">Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <button type="button" onClick={() => setInviteClassId(c.id)} className="text-xs px-2 py-1 rounded border border-primary text-primary hover:bg-primary/5 mb-2">+ Adicionar individual</button>
                              )}
                              <div className="mb-2"><label className="block text-xs text-slate-600 mb-1">Importar planilha ou CSV (colunas: email, nome)</label><input type="file" accept=".csv" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const text = await file.text(); const lines = text.split(/\r?\n/).filter(Boolean); if (lines.length < 2) return; const head = lines[0].toLowerCase().split(/[,\t;]/).map((h) => h.trim()); const emailIdx = head.findIndex((h) => h === "email" || h === "e-mail"); const nameIdx = head.findIndex((h) => h === "nome" || h === "name" || h === "full_name"); const rows = lines.slice(1).map((line) => { const cells = line.split(/[,\t;]/).map((x) => x.trim()); return { email: emailIdx >= 0 ? cells[emailIdx] || "" : cells[0] || "", full_name: nameIdx >= 0 ? cells[nameIdx] : undefined }; }).filter((r) => r.email); const res = await importStudentsFromCsvAction(c.id, rows); if (res.data) { setImportResult(res.data); loadStudents(c.id); router.refresh(); } e.target.value = ""; }} className="text-sm" />{importResult && addStudentsClassId === c.id && <p className="text-sm mt-1 text-slate-600">Adicionados: {importResult.added}. Já na turma: {importResult.skipped}. {importResult.errors.length > 0 && <span className="text-amber-600"> Erros: {importResult.errors.slice(0, 3).join("; ")}{importResult.errors.length > 3 ? "…" : ""}</span>}</p>}</div>
                              <ul className="space-y-1 text-sm mt-2">{loadingStudents ? <li className="text-slate-500">Carregando…</li> : classStudents.length === 0 ? <li className="text-slate-500">Nenhum aluno na turma.</li> : classStudents.map((s) => (<li key={s.id} className="flex flex-wrap items-center gap-2 py-1"><span>{s.full_name || s.email}</span><span className="text-slate-500 text-xs">{s.email}</span><span className={"text-xs px-1.5 py-0.5 rounded " + ((s.status === "active") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>{(s.status === "active") ? "Ativo" : "Pendente"}</span></li>))}</ul>
                            </>
                          )}
                          {viewProgressClassId === c.id && (
                            <>
                              <p className="font-medium text-slate-700 text-sm mb-2">Alunos e progresso</p>
                              {loadingStudents ? <p className="text-slate-500 text-sm">Carregando…</p> : studentsWithProgress.length === 0 ? <p className="text-slate-500 text-sm">Nenhum aluno na turma.</p> : <ul className="space-y-2 text-sm">{studentsWithProgress.map((s) => (<li key={s.id} className="flex justify-between items-center gap-2 py-1 border-b border-slate-100 flex-wrap"><div><span className="font-medium text-slate-800">{s.full_name || s.email || "—"}</span><span className="text-slate-500 text-xs ml-2">{s.email}</span><span className={"text-xs px-1.5 py-0.5 rounded ml-2 " + ((s.status === "active") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>{(s.status === "active") ? "Ativo" : "Pendente"}</span></div><span className="text-slate-500 text-xs">Progresso: {s.lessons_with_progress} aula(s) com atividade · {s.lessons_completed} concluída(s)</span></li>))}</ul>}
                            </>
                          )}
                          {editPanelClassId === c.id && (
                            <>
                              <p className="font-medium text-slate-700 text-sm mb-2">Editar turma</p>
                              <div className="mb-2"><label className="block text-xs text-slate-600 mb-1">Importar nova lista (CSV: email, nome)</label><input type="file" accept=".csv" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const text = await file.text(); const lines = text.split(/\r?\n/).filter(Boolean); if (lines.length < 2) return; const head = lines[0].toLowerCase().split(/[,\t;]/).map((h) => h.trim()); const emailIdx = head.findIndex((h) => h === "email" || h === "e-mail"); const nameIdx = head.findIndex((h) => h === "nome" || h === "name" || h === "full_name"); const rows = lines.slice(1).map((line) => { const cells = line.split(/[,\t;]/).map((x) => x.trim()); return { email: emailIdx >= 0 ? cells[emailIdx] || "" : cells[0] || "", full_name: nameIdx >= 0 ? cells[nameIdx] : undefined }; }).filter((r) => r.email); await importStudentsFromCsvAction(c.id, rows); loadStudents(c.id); router.refresh(); e.target.value = ""; }} className="text-sm" /></div>
                              <ul className="space-y-1 text-sm">{loadingStudents ? <li className="text-slate-500">Carregando…</li> : classStudents.length === 0 ? <li className="text-slate-500">Nenhum aluno.</li> : classStudents.map((s) => (<li key={s.id} className="flex justify-between gap-2 py-1 items-center flex-wrap"><div className="flex items-center gap-2 flex-wrap"><span>{s.full_name || s.email}</span><span className="text-slate-500 text-xs">{s.email}</span><span className={"text-xs px-1.5 py-0.5 rounded " + ((s.status === "active") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>{(s.status === "active") ? "Ativo" : "Pendente"}</span></div><button type="button" onClick={() => confirm("Remover este aluno da turma e da instituição?") && handleRemoveStudent(c.id, s.id)} disabled={removeLoadingId === s.id} className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50">{removeLoadingId === s.id ? "Removendo…" : "Remover"}</button></li>))}</ul>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {school.classes.length === 0 && newTurmaSchoolId !== school.id && <p className="text-slate-500 text-sm">Nenhuma turma. Clique em Nova turma para criar.</p>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
