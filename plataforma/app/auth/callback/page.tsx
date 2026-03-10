"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function parseHash(hash: string): Record<string, string> {
  if (!hash || !hash.startsWith("#")) return {};
  const out: Record<string, string> = {};
  hash
    .slice(1)
    .split("&")
    .forEach((part) => {
      const [key, val] = part.split("=");
      if (key && val) out[decodeURIComponent(key)] = decodeURIComponent(val);
    });
  return out;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/auth/login?error=link_expired");
      return;
    }

    const hashParams = typeof window !== "undefined" ? parseHash(window.location.hash) : {};
    const code = searchParams.get("code");
    const redirectToNovaSenha = (nextPath?: string) => {
      const path = nextPath ?? searchParams.get("next") ?? "/professor";
      router.replace(`/auth/nova-senha?next=${encodeURIComponent(path)}`);
    };

    const redirectToLoginExpired = () => {
      setStatus("error");
      router.replace("/auth/login?error=link_expired");
    };

    // Fluxo 1: tokens no hash (convite/recovery do Supabase)
    const access_token = hashParams.access_token;
    const refresh_token = hashParams.refresh_token;
    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(async ({ error }) => {
          if (error) {
            redirectToLoginExpired();
            return;
          }
          if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname + window.location.search);
          const { data: { user } } = await supabase.auth.getUser();
          const role = user?.user_metadata?.role;
          const nextPath = role === "manager" ? "/gestor" : undefined;
          redirectToNovaSenha(nextPath);
        })
        .catch(() => redirectToLoginExpired());
      return;
    }

    // Fluxo 2: code na query (PKCE)
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(async ({ error }) => {
          if (error) {
            redirectToLoginExpired();
            return;
          }
          const { data: { user } } = await supabase.auth.getUser();
          const role = user?.user_metadata?.role;
          const nextPath = role === "manager" ? "/gestor" : undefined;
          redirectToNovaSenha(nextPath);
        })
        .catch(() => redirectToLoginExpired());
      return;
    }

    redirectToLoginExpired();
  }, [router, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 shadow-xl text-center">
        <p className="text-streaming-muted">
          {status === "loading" ? "Ativando sua conta…" : "Redirecionando…"}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-xl border border-streaming-border bg-streaming-bg-card p-8 shadow-xl text-center">
          <p className="text-streaming-muted">Ativando sua conta…</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
