"use client";

import type { ReactNode } from "react";

const W_LEFT = 220;
const W_CENTER = 1000;
const W_RIGHT = 220;
const TOTAL_W = 1440;
const H_DESIGN = 900;

interface AlunoSliceLayoutProps {
  leftSrc: string;
  centerSrc: string;
  rightSrc: string;
  centerOverlay?: ReactNode;
  children?: ReactNode;
}

/** Layout exato 1440x900: esquerda 220px, centro 1000px, direita 220px. Children = overlay (ex.: navegação mockup). */
export function AlunoSliceLayout({ leftSrc, centerSrc, rightSrc, centerOverlay, children }: AlunoSliceLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen w-full justify-center overflow-x-auto font-kalitha"
      style={{ backgroundColor: "var(--rua-dark, #1a2a3d)" }}
    >
      <div
        className="flex shrink-0 overflow-hidden"
        style={{ width: TOTAL_W, minHeight: H_DESIGN, maxWidth: "100vw" }}
      >
        <aside className="shrink-0" style={{ width: W_LEFT, height: H_DESIGN }}>
          <img src={leftSrc} alt="" className="h-full w-full object-cover object-top" aria-hidden />
        </aside>
        <main className="relative shrink-0" style={{ width: W_CENTER, height: H_DESIGN }}>
          <img src={centerSrc} alt="" className="h-full w-full object-cover object-top" aria-hidden />
          {centerOverlay}
        </main>
        <aside className="shrink-0" style={{ width: W_RIGHT, height: H_DESIGN }}>
          <img src={rightSrc} alt="" className="h-full w-full object-cover object-top" aria-hidden />
        </aside>
      </div>
      {children}
    </div>
  );
}
