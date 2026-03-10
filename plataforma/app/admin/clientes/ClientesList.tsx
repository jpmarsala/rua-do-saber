"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTenant, inviteManagerForTenant } from "./actions";

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
  client_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const clientTypeLabel: Record<string, string> = {
  prefeitura: "Prefeitura",
  agencia_transito: "Agência de trânsito",
  escola: "Escola",
};

function formatDate(s: string | null | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return s;
  }
}

export function ClientesList({ tenants }: { tenants: TenantRow[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resendTenantId, setResendTenantId] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendName, setResendName] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(tenantId: string) {
    setDeleteError(null);
    setDeleteLoading(true);
    const result = await deleteTenant(tenantId);
    setDeleteLoading(false);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    setDeleteConfirm(null);
    router.refresh();
  }

  async function handleResendInvite(tenantId: string) {
    if (!resendEmail.trim()) return;
    setResendError(null);
    setResendSuccess(null);
    setResendLoading(true);
    const result = await inviteManagerForTenant(tenantId, resendEmail.trim(), resendName.trim() || undefined);
    setResendLoading(false);
    if (result.error) {
      setResendError(result.error);
      return;
    }
    if ((result.data as { resendExisting?: boolean })?.resendExisting) {
      setResendSuccess("Foi enviado um novo e-mail com link de acesso para o gestor.");
    }
    setResendTenantId(null);
    setResendEmail("");
    setResendName("");
    setResendError(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {tenants.map((t) => (
        <div
          key={t.id}
          className="border border-streaming-border rounded-lg overflow-hidden bg-streaming-bg-card"
        >
          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                className="text-streaming-muted hover:text-white shrink-0"
                aria-label={expandedId === t.id ? "Recolher" : "Expandir"}
              >
                {expandedId === t.id ? "▼" : "▶"}
              </button>
              <div className="min-w-0">
                <span className="font-medium text-white block truncate">{t.name}</span>
                <span className="text-sm text-streaming-muted">{t.slug}</span>
              </div>
              <span className={t.active !== false ? "text-emerald-400 text-sm" : "text-streaming-muted text-sm"}>
                {t.active !== false ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/admin/clientes/${t.id}`}
                className="text-sm px-3 py-1.5 rounded-lg border border-streaming-border text-primary hover:bg-streaming-bg"
              >
                Coleções
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResendTenantId(t.id);
                  setResendEmail("");
                  setResendName("");
                  setResendError(null);
                }}
                className="text-sm px-3 py-1.5 rounded-lg border border-streaming-border text-streaming-muted hover:bg-streaming-bg"
              >
                Reenviar convite
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(deleteConfirm === t.id ? null : t.id)}
                className="text-sm px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-500/10"
              >
                Deletar
              </button>
            </div>
          </div>
          {deleteConfirm === t.id && (
            <div className="px-4 pb-4 pt-0 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-amber-200">Excluir este cliente? Escolas, turmas e vínculos serão removidos.</span>
              {deleteError && <span className="text-red-400">{deleteError}</span>}
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                disabled={deleteLoading}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Excluindo…" : "Sim, excluir"}
              </button>
              <button
                type="button"
                onClick={() => { setDeleteConfirm(null); setDeleteError(null); }}
                className="px-3 py-1.5 rounded-lg border border-streaming-border text-streaming-muted hover:bg-streaming-bg"
              >
                Não
              </button>
            </div>
          )}
          {expandedId === t.id && (
            <div className="px-4 pb-4 pt-0 border-t border-streaming-border mt-0">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-3">
                <dt className="text-streaming-muted">Nome</dt>
                <dd className="text-white">{t.name}</dd>
                <dt className="text-streaming-muted">Slug</dt>
                <dd className="text-white">{t.slug}</dd>
                <dt className="text-streaming-muted">Status</dt>
                <dd className={t.active !== false ? "text-emerald-400" : "text-streaming-muted"}>{t.active !== false ? "Ativo" : "Inativo"}</dd>
                <dt className="text-streaming-muted">Tipo</dt>
                <dd className="text-white">{clientTypeLabel[t.client_type ?? ""] ?? t.client_type ?? "—"}</dd>
                <dt className="text-streaming-muted">Criado em</dt>
                <dd className="text-white">{formatDate(t.created_at)}</dd>
                <dt className="text-streaming-muted">Atualizado em</dt>
                <dd className="text-white">{formatDate(t.updated_at)}</dd>
              </dl>
            </div>
          )}
        </div>
      ))}

      {resendTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true">
          <div className="bg-streaming-bg-card border border-streaming-border rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reenviar convite ao gestor</h3>
            <p className="text-sm text-streaming-muted mb-4">Informe o e-mail do gestor para enviar um novo convite.</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="resend_email" className="block text-sm font-medium text-streaming-muted mb-1">E-mail *</label>
                <input
                  id="resend_email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  placeholder="gestor@exemplo.com"
                  className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label htmlFor="resend_name" className="block text-sm font-medium text-streaming-muted mb-1">Nome (opcional)</label>
                <input
                  id="resend_name"
                  type="text"
                  value={resendName}
                  onChange={(e) => setResendName(e.target.value)}
                  placeholder="Nome do gestor"
                  className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white"
                />
              </div>
              {resendSuccess && <p className="text-sm text-emerald-400 mt-2">{resendSuccess}</p>}
              {resendError && <p className="text-sm text-red-400 mt-2">{resendError}</p>}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => handleResendInvite(resendTenantId)}
                disabled={resendLoading || !resendEmail.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              >
                {resendLoading ? "Enviando…" : "Enviar convite"}
              </button>
              <button
                type="button"
                onClick={() => { setResendTenantId(null); setResendError(null); setResendSuccess(null); }}
                className="px-4 py-2 border border-streaming-border rounded-lg text-streaming-muted hover:bg-streaming-bg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
