"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function parseHashParams(hash: string): Record<string, string> {
  if (!hash || !hash.startsWith("#")) return {};
  const params: Record<string, string> = {};
  hash.slice(1).split("&").forEach((part) => {
    const [key, value] = part.split("=");
    if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "));
  });
  return params;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expiredInvite, setExpiredInvite] = useState(false);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const tokenParams: Record<string, string> = {};
    if (hash && hash.startsWith("#")) {
      hash.slice(1).split("&").forEach((part) => {
        const [key, val] = part.split("=");
        if (key && val) tokenParams[decodeURIComponent(key)] = decodeURIComponent(val);
      });
    }
    const access_token = tokenParams.access_token;
    const refresh_token = tokenParams.refresh_token;
    if (access_token && refresh_token) {
      const supabase = createClient();
      if (supabase) {
        supabase.auth.setSession({ access_token, refresh_token }).then(async ({ error }) => {
          if (!error) {
            if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname + window.location.search);
            const { data: { user } } = await supabase.auth.getUser();
            const next = user?.user_metadata?.role === "manager" ? "/gestor" : "/professor";
            router.replace(`/auth/nova-senha?next=${encodeURIComponent(next)}`);
          }
        });
      }
      return;
    }
  }, [router]);

  useEffect(() => {
    if (errorParam === "auth" || errorParam === "link_expired") {
      setError(
        "Link de convite inválido ou expirado. Peça um novo convite ao gestor ou use o link abaixo para definir sua senha e entrar."
      );
      setExpiredInvite(true);
    }
  }, [errorParam]);

  useEffect(() => {
    const params = parseHashParams(window.location.hash);
    const errorCode = params.error_code;
    const errorDesc = params.error_description;
    if (params.error === "access_denied" && errorCode === "otp_expired") {
      setError(
        "O link do convite expirou. Peça um novo convite ao gestor ou use o link abaixo para definir sua senha e entrar."
      );
      setExpiredInvite(true);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } else if (params.error && errorDesc) {
      setError(errorDesc);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

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
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.push("/entrar");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 shadow-xl">
      <h1 className="font-display text-2xl tracking-tight text-white mb-2">Entrar</h1>
      <p className="text-streaming-muted text-sm mb-6">
        Use seu e-mail e senha para acessar a plataforma.
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
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-streaming-muted mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-streaming-border bg-streaming-bg text-white placeholder-streaming-muted focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <p className="text-right text-sm">
          <Link href="/auth/esqueci-senha" className="text-primary hover:underline">Esqueci minha senha</Link>
        </p>
        {error && (
          <div className="space-y-2">
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
            {expiredInvite && (
              <p className="text-sm text-streaming-muted">
                Ainda não definiu uma senha?{" "}
                <Link href="/auth/esqueci-senha" className="text-primary font-medium hover:underline">
                  Clique aqui para receber um e-mail e definir sua senha
                </Link>
                .
              </p>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-streaming-muted">
        <Link href="/" className="text-primary hover:underline">
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="w-full max-w-sm h-64 rounded-xl bg-streaming-bg-card border border-streaming-border animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
