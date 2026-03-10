"use client";

import Link from "next/link";
import { AlunoDemoLayout } from "../AlunoDemoLayout";

export function AlunoDemoMission() {
  return (
    <AlunoDemoLayout
      title="O meio ambiente e o trânsito"
      leftSlot={
        <div className="w-full">
          <img src="/svg/speech-robot-mission.svg" alt="" className="w-full h-auto" aria-hidden />
        </div>
      }
      showTeacherMessage
      nextMissionOpen
    >
      <div className="w-full bg-[#1e3d47] rounded-2xl p-8 text-white/90">
        <div className="flex justify-center mb-6">
          <img src="/svg/card-mission.svg" alt="" className="max-w-md w-full h-auto" aria-hidden />
        </div>
        <div className="max-w-2xl mx-auto space-y-4 text-sm leading-relaxed">
          <p>
            O trânsito também influencia o meio ambiente. A forma como nos deslocamos pela cidade pode afetar o ar que respiramos, o nível de ruído nas ruas e a qualidade de vida das pessoas.
          </p>
          <p>
            Nesta missão, observe o trânsito no caminho entre sua casa e a escola ou em algum lugar do seu bairro. Preste atenção em quantos carros passam, se há pessoas caminhando, andando de bicicleta ou usando transporte público.
          </p>
          <p>
            Depois, pense em uma pergunta: O que poderia mudar no trânsito da minha cidade para torná-lo melhor para o meio ambiente?
          </p>
          <p className="font-medium">
            Na próxima aula, você compartilhará suas observações com a turma.
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <img src="/svg/open-arch-mission-card.svg" alt="" className="w-48 h-auto opacity-90" aria-hidden />
        </div>
        <p className="text-center mt-6 text-white/70 text-sm">
          <Link href="/aluno/demo" className="underline">Voltar ao início</Link>
        </p>
      </div>
    </AlunoDemoLayout>
  );
}
