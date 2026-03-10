"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { inviteManagerForTenant } from "../actions";

export function InviteGestorForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(searchParams.get("inviteWarning") === "1");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await inviteManagerForTenant(tenantId, email, name || undefined);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setEmail("");
    setName("");
    router.replace(`/admin/clientes/${tenantId}`, { scroll: false });
  }

  return (
    <div className="mb-8 space-y-4">
      {showWarning && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 px-4 py-3 text-sm">
          Cliente criado. O convite não pôde ser enviado agora (limite de e-mails). Reenvie o convite abaixo em alguns minutos.
        </div>
      )}
      <h2 className="text-lg font-semibold text-white">Convidar gestor</h2>
      <p className="text-sm text-streaming-muted">Envie um convite por e-mail para o gestor acessar a área do cliente.</p>
      <form onSubmit={handleSubmit} className="max-w-md space-y-3">
        <div>
          <label htmlFor="gestor_email" className="block text-sm font-medium text-streaming-muted mb-1">E-mail do gestor *</label>
          <input
            id="gestor_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="gestor@exemplo.com"
            className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="gestor_name" className="block text-sm font-medium text-streaming-muted mb-1">Nome (opcional)</label>
          <input
            id="gestor_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do gestor"
            className="w-full rounded-lg border border-streaming-border bg-streaming-bg px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-400">Convite enviado com sucesso.</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Enviar convite"}
        </button>
      </form>
    </div>
  );
}
