"use client";

import { useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ButtonTransitionOverlay } from "./ButtonTransitionOverlay";

const STEPS = [
  { href: "/aluno", label: "Home" },
  { href: "/aluno/video", label: "Vídeo" },
  { href: "/aluno/interativo", label: "Interativo" },
  { href: "/aluno/missao", label: "Missão" },
] as const;

/** Barra de navegação: ao clicar, animação Lottie de transição e depois navega. */
export function AlunoSliceNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);
  const targetRef = useRef<string | null>(null);

  const handleTransitionComplete = useCallback(() => {
    const target = targetRef.current;
    targetRef.current = null;
    setTransitionTarget(null);
    if (target) router.push(target);
  }, [router]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      e.stopPropagation();
      const isActive =
        href === "/aluno"
          ? pathname === "/aluno" || pathname === "/aluno/"
          : pathname.startsWith(href);
      if (isActive) return;
      targetRef.current = href;
      setTransitionTarget(href);
    },
    [pathname]
  );

  return (
    <>
      <nav
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-xl border border-white/20 bg-black/60 px-3 py-2 backdrop-blur-sm font-kalitha text-sm"
        aria-label="Mockup: navegação entre telas"
      >
        {STEPS.map(({ href, label }) => {
          const isActive =
            href === "/aluno"
              ? pathname === "/aluno" || pathname === "/aluno/"
              : pathname.startsWith(href);
          return (
            <a
              key={href}
              href={href}
              onClick={(e) => handleClick(e, href)}
              className={
                "rounded-lg px-3 py-1.5 transition-colors " +
                (isActive
                  ? "bg-white/25 text-white"
                  : "text-white/80 hover:bg-white/15 hover:text-white")
              }
            >
              {label}
            </a>
          );
        })}
      </nav>
      {transitionTarget && (
        <ButtonTransitionOverlay onComplete={handleTransitionComplete} />
      )}
    </>
  );
}
