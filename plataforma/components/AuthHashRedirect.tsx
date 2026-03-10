"use client";

import { useEffect } from "react";

/**
 * Se o usuário cai na raiz (ou em qualquer página) com hash de erro do Supabase
 * (ex.: #error=access_denied&error_code=otp_expired), redireciona para o login
 * para exibir a mensagem amigável.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash && hash.includes("error=")) {
      window.location.replace(`/auth/login${hash}`);
    }
  }, []);
  return null;
}
