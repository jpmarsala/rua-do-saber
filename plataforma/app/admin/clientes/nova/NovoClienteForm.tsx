"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTenant } from "../actions";

export function NovoClienteForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await createTenant(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.data?.id) {
      const q = result.data.inviteWarning ? "?inviteWarning=1" : "";
      router.push(`/admin/clientes/${result.data.id}${q}`);
      router.refresh();
    } else {
      router.push("/admin/clientes");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-streaming-muted mb-1">
          Nome *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ex: Escola Municipal Demo"
          className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-streaming-muted mb-1">
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder="Ex: demo (deixe em branco para gerar do nome)"
          className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-streaming-muted">Só letras minúsculas, números e hífens. Usado em /t/slug</p>
      </div>
      <div>
        <label htmlFor="client_type" className="block text-sm font-medium text-streaming-muted mb-1">
          Tipo do cliente
        </label>
        <select
          id="client_type"
          name="client_type"
          className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="prefeitura">Prefeitura</option>
          <option value="agencia_transito">Agência de trânsito</option>
          <option value="escola">Escola (cliente é uma única escola)</option>
        </select>
        <p className="mt-1 text-xs text-streaming-muted">O cliente pode gerir várias escolas. Se for uma única escola, escolha Escola e cadastre-a em Escolas.</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="active"
          name="active"
          type="checkbox"
          defaultChecked
          className="rounded border-streaming-border text-primary focus:ring-primary"
        />
        <label htmlFor="active" className="text-sm font-medium text-streaming-muted">
          Cliente ativo
        </label>
      </div>
      <div>
        <label htmlFor="manager_email" className="block text-sm font-medium text-streaming-muted mb-1">
          E-mail do gestor
        </label>
        <input
          id="manager_email"
          name="manager_email"
          type="email"
          placeholder="gestor@exemplo.com"
          className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-streaming-muted">O gestor receberá um convite por e-mail para definir a senha e acessar a área do gestor.</p>
      </div>
      <div>
        <label htmlFor="manager_name" className="block text-sm font-medium text-streaming-muted mb-1">
          Nome do gestor
        </label>
        <input
          id="manager_name"
          name="manager_name"
          type="text"
          placeholder="Nome do gestor (opcional)"
          className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Salvando…" : "Criar cliente"}
        </button>
        <Link
          href="/admin/clientes"
          className="px-4 py-2 border border-streaming-border rounded-lg font-medium text-streaming-muted hover:bg-streaming-bg-card"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
