"use client";

import Link from "next/link";
import { AlunoDemoLayout } from "../AlunoDemoLayout";

export function AlunoDemoVideo() {
  return (
    <AlunoDemoLayout
      titleSvg="title-class-video.svg"
      leftSlot={
        <div className="w-full">
          <img src="/svg/speech-robot-video-screen.svg" alt="" className="w-full h-auto" aria-hidden />
        </div>
      }
    >
      <div className="flex flex-col w-full bg-black/40 rounded-2xl overflow-hidden">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <div className="text-white/60 text-sm">Vídeo da aula (placeholder)</div>
          <div className="absolute bottom-2 right-2 flex gap-1">
            <img src="/svg/full-screen-button.svg" alt="" className="w-8 h-8 opacity-80" aria-hidden />
          </div>
        </div>
        <div className="h-1.5 bg-[#1e3d47]">
          <div className="h-full w-1/3 bg-amber-400 rounded-r" />
        </div>
        <div className="flex items-center justify-center gap-2 py-3 bg-[#1e3d47]">
          <img src="/svg/play-button.svg" alt="Play" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/pause-button.svg" alt="Pause" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/stop-button.svg" alt="Stop" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/reverse-button.svg" alt="Voltar" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/forward-button.svg" alt="Avançar" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/increase-sound-button.svg" alt="Volume" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/decrease-sound-button.svg" alt="Volume" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/mute-button.svg" alt="Mudo" className="w-10 h-10 cursor-pointer" />
          <img src="/svg/settings-bideo-button.svg" alt="Configurações" className="w-10 h-10 cursor-pointer" />
        </div>
      </div>
      <p className="text-center mt-2 text-white/70 text-sm">
        <Link href="/aluno/demo/jogo" className="underline">Ir para o jogo da memória</Link>
      </p>
    </AlunoDemoLayout>
  );
}
