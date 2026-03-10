"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { inviteTeacher, resendTeacherInvite, removeTeacherByEmail } from "../actions";
import type { GestorGrade, GestorSchool } from "@/lib/gestor/dashboard-data";

export function ConvidarProfessorForm({
  tenantIdOverride,
  grades,
  schools,
}: {
  tenantIdOverride?: string | null;
  grades: GestorGrade[];
  schools: GestorSchool[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [gradeIds, setGradeIds] = useState<string[]>([]);
  const [schoolIds, setSchoolIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyRegisteredEmail, setAlreadyRegisteredEmail] = useState<string | null>(null);

  const qs = tenantIdOverride ? `?tenantId=${tenantIdOverride}` : "";

  function toggleGrade(id: string) {
    setGradeIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function toggleSchool(id: string) {
    setSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (schoolIds.length === 0) {
      setError("Selecione pelo menos uma escola.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await inviteTeacher(
      email,
      fullName,
      tenantIdOverride ?? null,
      gradeIds.length ? gradeIds : null,
      schoolIds
    );
    setLoading(false);
    if (result.error) {
      const msg = result.error.toLowerCase();
      if (msg.includes("já existe") || msg.includes("already") && msg.includes("e-mail")) {
        setAlreadyRegisteredEmail(email);
        setError("Este e-mail já está cadastrado. Reenvie o convite ou remova o cadastro para convidar novamente.");
      } else {
        setError(result.error);
      }
      return;
    }
    setSuccess(true);
    setEmail("");
    setFullName("");
    setGradeIds([]);
    setSchoolIds([]);
    setAlreadyRegisteredEmail(null);
    router.refresh();
  }

  async function handleResendInvite() {
    if (!alreadyRegisteredEmail || !tenantIdOverride) return;
    setError(null);
    setLoading(true);
    const result = await resendTeacherInvite(alreadyRegisteredEmail, tenantIdOverride);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setSuccess(true);
    setAlreadyRegisteredEmail(null);
    setEmail("");
    setFullName("");
    setGradeIds([]);
    setSchoolIds([]);
    router.refresh();
  }

  async function handleRemoveAndInviteAgain() {
    if (!alreadyRegisteredEmail || !tenantIdOverride) return;
    setError(null);
    setLoading(true);
    const removeResult = await removeTeacherByEmail(alreadyRegisteredEmail, tenantIdOverride);
    if (removeResult.error) { setLoading(false); setError(removeResult.error); return; }
    const inviteResult = await inviteTeacher(alreadyRegisteredEmail, fullName || alreadyRegisteredEmail.split("@")[0], tenantIdOverride, gradeIds.length ? gradeIds : null, schoolIds);
    setLoading(false);
    if (inviteResult.error) { setError(inviteResult.error); return; }
    setSuccess(true);
    setAlreadyRegisteredEmail(null);
    setEmail("");
    setFullName("");
    setGradeIds([]);
    setSchoolIds([]);
    router.refresh();
  }

  if (schools.length === 0) {
    return (
      <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <p className="font-medium">Nenhuma escola cadastrada</p>
        <p className="text-sm mt-1">Cadastre pelo menos uma escola em Gestor → Escolas para poder convidar professores.</p>
        <Link
          href={"/gestor/escolas" + qs}
          className="mt-3 inline-block px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
        >
          Ir para Escolas
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
        <p className="font-medium">Convite enviado!</p>
        <p className="text-sm mt-1">O professor receberá um e-mail para ativar a conta. Os anos selecionados definem o acesso à biblioteca de aulas.</p>
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
          >
            Convidar outro
          </button>
          <Link
            href={`/gestor/professores${qs}`}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            Ver lista de professores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
          placeholder="professor@escola.gov.br"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
          placeholder="Ex.: Maria Silva"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Escola(s) *</label>
        <p className="text-xs text-slate-500 mb-2">Selecione uma ou mais escolas às quais o professor ficará vinculado.</p>
        <div className="flex flex-wrap gap-3">
          {schools.map((s) => (
            <label key={s.id} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={schoolIds.includes(s.id)}
                onChange={() => toggleSchool(s.id)}
                className="rounded border-slate-300 text-primary"
              />
              <span className="text-slate-700">{s.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Anos (acesso à biblioteca)</label>
        <div className="flex flex-wrap gap-3">
          {grades.map((g) => (
            <label key={g.id} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={gradeIds.includes(g.id)}
                onChange={() => toggleGrade(g.id)}
                className="rounded border-slate-300 text-primary"
              />
              <span className="text-slate-700">{g.name}</span>
            </label>
          ))}
        </div>
        {grades.length === 0 && (
          <p className="text-sm text-amber-600">Cadastre os anos (1º–5º) na base editorial.</p>
        )}
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
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enviando convite..." : "Enviar convite"}
        </button>
        <Link
          href={`/gestor/professores${qs}`}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
