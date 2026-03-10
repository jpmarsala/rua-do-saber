"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface ButtonTransitionOverlayProps {
  onComplete: () => void;
}

const FALLBACK_MS = 3500;

/** Overlay em portal (body): animação Lottie de transição; onComplete ao terminar ou após timeout. */
export function ButtonTransitionOverlay({ onComplete }: ButtonTransitionOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(finish, FALLBACK_MS);
    return () => clearTimeout(t);
  }, [onComplete, mounted]);

  useEffect(() => {
    return () => {
      if (!completedRef.current) finish();
    };
  }, [onComplete]);

  const handleRef = (instance: unknown) => {
    if (!instance || completedRef.current) return;
    const dotlottie = instance as { addEventListener?: (e: string, cb: () => void) => void };
    dotlottie.addEventListener?.("complete", finish);
  };

  if (!mounted || typeof document === "undefined") return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--rua-dark,#1a2a3d)]"
      style={{ backgroundColor: "var(--rua-dark, #1a2a3d)" }}
      aria-hidden
    >
      <div className="flex h-full w-full max-h-[100vh] max-w-[100vw] items-center justify-center">
        <DotLottieReact
          src="/lottie/button-transition.lottie"
          loop={false}
          autoplay
          dotLottieRefCallback={handleRef}
          className="h-full w-full max-h-[90vmin] max-w-[90vmin]"
        />
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
