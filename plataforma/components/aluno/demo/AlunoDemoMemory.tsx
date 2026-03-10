"use client";

import Link from "next/link";
import { AlunoDemoLayout } from "../AlunoDemoLayout";

const CARDS = Array.from({ length: 12 }, (_, i) => (i % 2 === 0 ? "card-memory-robot.svg" : "card-memory-robot.svg"));

export function AlunoDemoMemory() {
  return (
    <AlunoDemoLayout
      title="O meio ambiente e o trânsito"
      leftSlot={
        <div className="w-full">
          <img src="/svg/speech-robot-interactivity.svg" alt="" className="w-full h-auto" aria-hidden />
        </div>
      }
    >
      <div className="w-full bg-[#1e3d47]/50 rounded-2xl p-6">
        <p className="text-white/90 text-center mb-4 text-sm">
          Descubra quais atitudes que podemos ter no trânsito que preservam o meio ambiente.
        </p>
        <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
          {CARDS.map((card, i) => (
            <button key={i} type="button" className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 hover:border-amber-400 transition-colors">
              <img src={"/svg/" + card} alt="" className="w-full h-full object-cover" aria-hidden />
            </button>
          ))}
        </div>
        <p className="text-center mt-4 text-white/70 text-sm">
          <Link href="/aluno/demo/missao" className="underline">Ir para a missão</Link>
        </p>
      </div>
    </AlunoDemoLayout>
  );
}
