"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteTeacher } from "@/app/gestor/professores/actions";
import type { GestorSchool } from "@/lib/gestor/dashboard-data";
import type { GestorGrade } from "@/lib/gestor/dashboard-data";

export function EscolasListWithInvite({
  schools,
  grades,
  tenantId,
  qs,
}: {
  schools: GestorSchool[];
  grades: GestorGrade[];
  tenantId: string | null;
  qs: string;
}) {
  const router = useRouter();
  const [openInvite, setOpenInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [gradeIds, setGradeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleGrade(id: string) {
    setGradeIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setError(null);
    setLoading(true);
    const result = await inviteTeacher(email, fullName, tenantId, gradeIds.length ? gradeIds : null);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setEmail("");
    setFullName("");
    setGradeIds([]);
    router.refresh();
  }

  if (schools.length === 0) {
    return <p className="text-slate-500">Nenhuma escola cadastrada.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {schools.map((s) => (
          <li key={s.id} className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <span className="font-medium text-slate-800">{s.name}</span>
            <div className="flex items-center gap-2">
              {s.active ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Ativa</span>
              ) : (
                <span className="text-xs text-slate-500">Inativa</span>
              )}
              <button
                type="button"
                onClick={() => setOpenInvite((v) => !v)}
                className="text-sm px-3 py-1.5 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5"
              >
                Convidar professor
              </button>
            </div>
          </li>
        ))}
      </ul>

      {openInvite && tenantId && (
        <section className="mt-6 p-4 rounded-lg border border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Convidar professor</h2>
          <p className="text-sm text-slate-600 mb-4">
            Os anos selecionados definem a quais bibliotecas de aulas o professor terá acesso.
          </p>
          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              <p className="font-medium">Convite enviado!</p>
              <p className="text-sm mt-1">O professor receberá um e-mail para ativar a conta.</p>
              <button
                type="button"
                onClick={() => { setSuccess(false); setOpenInvite(false); }}
                className="mt-3 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
              >
                Fechar
              </button>
            </div>
          ) : (
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                  placeholder="Ex.: Maria Silva"
                />
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
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Enviando convite..." : "Enviar convite"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenInvite(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </>
  );
}
