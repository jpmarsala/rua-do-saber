"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const BG_DARK = "#0f2a32";
const SIDEBAR_BG = "#102c36";

interface AlunoDemoLayoutProps {
  title?: string;
  titleSvg?: string;
  leftSlot: ReactNode;
  children: ReactNode;
  showTeacherMessage?: boolean;
  nextMissionOpen?: boolean;
}

export function AlunoDemoLayout({
  title = "O meio ambiente e o trânsito",
  titleSvg,
  leftSlot,
  children,
  showTeacherMessage = false,
  nextMissionOpen = false,
}: AlunoDemoLayoutProps) {
  return (
    <div className="min-h-screen flex text-white" style={{ backgroundColor: BG_DARK }}>
      <aside className="w-[280px] flex-shrink-0 flex flex-col p-6 gap-4" style={{ backgroundColor: SIDEBAR_BG }}>
        <Link href="/aluno" className="block w-full max-w-[200px]">
          <img src="/svg/logo-rua-do-saber.svg" alt="Rua do Saber" className="w-full h-auto" />
        </Link>
        <button type="button" className="w-full block text-left">
          <img src="/svg/settings-button.svg" alt="Configurações" className="w-full h-auto max-h-10" />
        </button>
        <button type="button" className="w-full block text-left">
          <img src="/svg/achievment-button.svg" alt="Conquistas" className="w-full h-auto max-h-10" />
        </button>
        <div className="mt-auto">{leftSlot}</div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 p-6">
        <div className="flex justify-center mb-4">
          {titleSvg ? (
            <img src={"/svg/" + titleSvg} alt="" className="max-h-14 w-auto object-contain" aria-hidden />
          ) : (
            <div className="bg-[#1e3d47] text-white px-6 py-3 rounded-xl text-xl font-bold">{title}</div>
          )}
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden">{children}</div>
      </main>
      <aside className="w-[260px] flex-shrink-0 flex flex-col p-6 gap-4" style={{ backgroundColor: SIDEBAR_BG }}>
        <img src="/svg/avatar-student.svg" alt="" className="w-20 h-20 mx-auto rounded-full" aria-hidden />
        <p className="text-center font-semibold text-white">João Augusto</p>
        <img src="/svg/status-student.svg" alt="" className="w-full h-auto" aria-hidden />
        <img src="/svg/level-student.svg" alt="" className="w-full h-auto" aria-hidden />
        <img src="/svg/xp-total-student.svg" alt="" className="w-full h-auto" aria-hidden />
        <div className="flex gap-2">
          <img src="/svg/xp1000-card.svg" alt="" className="flex-1 h-auto" aria-hidden />
          <img src="/svg/xp500-card.svg" alt="" className="flex-1 h-auto" aria-hidden />
        </div>
        <Link href="/aluno/cards" className="block w-full">
          <img src="/svg/mycards-student.svg" alt="Meus Cards" className="w-full h-auto" />
        </Link>
        <div className="mt-auto space-y-2">
          <p className="text-sm font-medium text-white/90">Próxima missão</p>
          <img src={nextMissionOpen ? "/svg/open-arch-mission-card.svg" : "/svg/closed-arch.svg"} alt="" className="w-full h-auto" aria-hidden />
        </div>
        {showTeacherMessage && (
          <div className="mt-4">
            <p className="text-sm font-medium text-white/90 mb-2">Mensagem do Professor</p>
            <img src="/svg/teacher-message-mission.svg" alt="" className="w-full h-auto" aria-hidden />
          </div>
        )}
      </aside>
    </div>
  );
}
