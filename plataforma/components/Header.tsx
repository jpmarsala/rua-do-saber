"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/lib/supabase/types";

interface SessionUser {
  id: string;
  email: string | null;
  role: UserRole;
  tenantId: string | null;
  fullName: string | null;
}

const ROLE_LINKS: { role: UserRole; href: string; label: string }[] = [
  { role: "super_admin", href: "/admin", label: "Admin" },
  { role: "super_admin", href: "/gestor", label: "Gestor" },
  { role: "editor", href: "/admin", label: "Admin" },
  { role: "support", href: "/suporte", label: "Suporte" },
  { role: "manager", href: "/gestor", label: "Gestor" },
  { role: "teacher", href: "/professor", label: "Professor" },
  { role: "student", href: "/aluno", label: "Aluno" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const roleLinks = user
    ? ROLE_LINKS.filter((l) => l.role === user.role).filter(
        (l, i, arr) => arr.findIndex((x) => x.href === l.href) === i
      )
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-streaming-border bg-streaming-bg/95 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-tight text-streaming-text hover:text-primary transition-colors">
          Educação no Trânsito
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-primary" : "text-streaming-muted hover:text-streaming-text"
            }`}
          >
            Início
          </Link>
          {user === undefined ? (
            <span className="text-streaming-muted text-sm">...</span>
          ) : user ? (
            <>
              {roleLinks.map(({ href, label }) => (
                <Link
                  key={href + label}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith(href) ? "text-primary" : "text-streaming-muted hover:text-streaming-text"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-streaming-muted hover:text-streaming-text transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
