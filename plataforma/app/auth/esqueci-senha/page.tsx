"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/nova-senha` : "";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 shadow-xl text-center">
          <h1 className="font-display text-2xl tracking-tight text-white mb-2">Verifique seu e-mail</h1>
          <p className="text-streaming-muted text-sm mb-6">
            Enviamos um link para <strong className="text-white">{email}</strong>. Clique no link para definir uma nova senha.
          </p>
          <p className="text-streaming-muted text-xs mb-6">
            Não recebeu? Verifique a pasta de spam ou <button type="button" onClick={() => setSent(false)} className="text-primary hover:underline">tentar outro e-mail</button>.
          </p>
          <Link href="/auth/login" className="text-primary font-medium hover:underline">Voltar ao login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 shadow-xl">
        <h1 className="font-display text-2xl tracking-tight text-white mb-2">Esqueci minha senha</h1>
        <p className="text-streaming-muted text-sm mb-6">
          Informe seu e-mail e enviaremos um link para redefinir a senha.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-streaming-muted mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-streaming-border bg-streaming-bg text-white placeholder-streaming-muted focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="seu@email.com"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando…" : "Enviar link"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-streaming-muted">
          <Link href="/auth/login" className="text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
