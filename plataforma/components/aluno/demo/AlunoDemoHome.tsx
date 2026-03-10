"use client";

import Link from "next/link";
import { AlunoDemoLayout } from "../AlunoDemoLayout";

export function AlunoDemoHome() {
  return (
    <AlunoDemoLayout
      titleSvg="title-class-home.svg"
      leftSlot={
        <div className="w-full">
          <img src="/svg/speech-robot-home.svg" alt="" className="w-full h-auto" aria-hidden />
        </div>
      }
    >
      <div className="relative w-full min-h-[500px] rounded-2xl overflow-hidden bg-[#87CEEB]/30">
        <img src="/svg/map-background-home.svg" alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center">
          <Link href="/aluno/demo/video" className="block">
            <img src="/svg/avatar-walking-map-home.svg" alt="Personagem no mapa" className="w-24 h-auto" />
          </Link>
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <img src="/svg/button-level1-map-home.svg" alt="" className="w-14 h-14" aria-hidden />
        </div>
      </div>
    </AlunoDemoLayout>
  );
}
