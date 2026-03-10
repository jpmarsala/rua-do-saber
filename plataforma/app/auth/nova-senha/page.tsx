"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function NovaSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase não configurado.");
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    const nextParam = searchParams.get("next");
    const next = role === "manager" ? "/gestor" : (nextParam && nextParam.startsWith("/") ? nextParam : "/professor");
    router.push(next);
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 shadow-xl text-center">
          <p className="text-streaming-muted">Carregando…</p>
          <p className="text-streaming-muted text-sm mt-4">
            Se você veio pelo link do e-mail, aguarde um momento. Caso contrário, <Link href="/auth/esqueci-senha" className="text-primary hover:underline">solicite um novo link</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 shadow-xl">
        <h1 className="font-display text-2xl tracking-tight text-white mb-2">Nova senha</h1>
        <p className="text-streaming-muted text-sm mb-6">
          Defina uma nova senha para acessar a plataforma.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-streaming-muted mb-1">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg border border-streaming-border bg-streaming-bg text-white placeholder-streaming-muted focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-streaming-muted mb-1">
              Confirmar senha
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg border border-streaming-border bg-streaming-bg text-white placeholder-streaming-muted focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Repita a senha"
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
            {loading ? "Salvando…" : "Definir nova senha"}
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

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 text-center">
          <p className="text-streaming-muted">Carregando…</p>
        </div>
      </div>
    }>
      <NovaSenhaForm />
    </Suspense>
  );
}
