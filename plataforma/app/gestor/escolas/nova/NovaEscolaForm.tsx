"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSchool } from "../actions";

export function NovaEscolaForm({ tenantIdOverride }: { tenantIdOverride?: string | null }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qs = tenantIdOverride ? `?tenantId=${tenantIdOverride}` : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createSchool(name, active, tenantIdOverride ?? null);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/gestor/escolas${qs}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nome da escola *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
          placeholder="Ex.: EMEF Centro"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-slate-300"
        />
        <label htmlFor="active" className="text-sm text-slate-700">Escola ativa</label>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Cadastrar escola"}
        </button>
        <Link
          href={`/gestor/escolas${qs}`}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
