"use client";

import React from "react";
import Link from "next/link";
import type { StudentJourneyData, JourneyLesson } from "@/lib/auth/student-journey-data";

function getMascotMessage(lessons: JourneyLesson[], currentLessonId: string | null): string {
  if (!lessons.length) return "Nenhuma aula disponível.";
  const current = lessons.find((l) => l.id === currentLessonId);
  if (!current) {
    const last = lessons[lessons.length - 1];
    if (last?.state === "lesson_completed") return "Parabéns! Você concluiu todas as aulas desta jornada.";
    return "Continue sua jornada!";
  }
  switch (current.state) {
    case "locked":
      return "O professor ainda não liberou esta aula. Aguarde na próxima aula.";
    case "available":
      return "Vamos começar! Clique na aula e assista ao vídeo.";
    case "video_completed":
      return "Vídeo visto! Abra o baú e pegue seu card.";
    case "reward_collected":
    case "challenge_completed":
      return "Agora é hora do desafio! Jogue e complete para subir de nível.";
    case "mission_unlocked":
      return "Missão liberada! Conecte o que você aprendeu com o mundo real.";
    case "mission_pending_validation":
      return "Missão feita! Aguarde o professor validar na próxima aula.";
    case "mission_validated":
    case "lesson_completed":
      return "Aula concluída! Siga para a próxima.";
    default:
      return "Vamos começar a primeira aula!";
  }
}

function getNodeDisplayState(lesson: JourneyLesson): "locked" | "current" | "done" {
  if (lesson.state === "locked") return "locked";
  if (lesson.isCurrent) return "current";
  if (lesson.state === "lesson_completed") return "done";
  return "current";
}

function toPct(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

function lessonPosition(index: number, total: number): { left: string; top: string } {
  if (total <= 1) return { left: "50%", top: "50%" };
  const pct = (index / (total - 1)) * 70;
  const topNum = 15 + pct;
  const leftNum = 40 + 20 * Math.sin((index / Math.max(1, total - 1)) * Math.PI * 0.8);
  return { left: toPct(leftNum), top: toPct(topNum) };
}

interface StudentJourneyMockupProps {
  journeyData: StudentJourneyData | null;
}

export default function StudentJourneyMockup({ journeyData }: StudentJourneyMockupProps) {
  const lessons = journeyData?.lessons ?? [];
  const currentLessonId = journeyData?.currentLessonId ?? null;
  const totalXp = journeyData?.profile?.total_xp ?? 0;
  const level = Math.floor(totalXp / 50) + 1;

  const LessonNode = ({ lesson, index }: { lesson: JourneyLesson; index: number }) => {
    const displayState = getNodeDisplayState(lesson);
    const styles = {
      current: "bg-sky-400 border-yellow-200",
      done: "bg-emerald-400 border-yellow-200",
      locked: "bg-gray-400 border-gray-300",
    };
    const pos = lessonPosition(index, lessons.length);
    const content = (
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${displayState === "locked" ? "cursor-not-allowed" : "cursor-pointer"}`}
        style={{ left: pos.left, top: pos.top }}
      >
        <div
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-bold ${styles[displayState]}`}
        >
          {displayState === "locked" ? "🔒" : lesson.number_in_collection}
        </div>
      </div>
    );
    if (displayState === "locked") return content;
    return <Link href={`/aluno/aulas/${lesson.id}`}>{content}</Link>;
  };

  const mascotMessage = getMascotMessage(lessons, currentLessonId);

  return (
    <div className="min-h-screen bg-[#0f2a32] text-white flex">
      <aside className="w-64 bg-[#102c36] p-6 flex flex-col gap-6">
        <Link href="/aluno" className="block w-full max-w-[180px]">
          <img src="/assets/logoruadosaber.svg" alt="Rua do Saber" className="w-full h-auto" />
        </Link>
        <nav className="flex flex-col gap-3">
          <span className="text-left font-medium text-lime-200">🏠 Jornada</span>
          <Link href="/aluno/cards" className="text-left hover:text-lime-300">🎴 Coleção</Link>
          <span className="text-left opacity-80">🧠 Missões</span>
          <span className="text-left opacity-80">👤 Perfil</span>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold">Jornada do Aluno</h2>
          <div className="flex gap-4">
            <span>⭐ {totalXp} XP</span>
            <span>🧠 Nível {level}</span>
            <span>❤️ 5</span>
          </div>
        </div>

        <div className="relative h-[500px] rounded-3xl bg-gradient-to-b from-sky-200 to-green-200 p-6">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M300 0 C250 120 350 200 300 350"
              stroke="yellow"
              strokeWidth="10"
              strokeDasharray="15 10"
              fill="none"
            />
          </svg>

          {lessons.map((l, i) => (
            <LessonNode key={l.id} lesson={l} index={i} />
          ))}

          <div className="absolute bottom-6 left-6 flex items-end gap-3 bg-black/70 p-4 rounded-xl max-w-lg">
            <img src="/assets/robot.svg" alt="" className="w-20 h-20 flex-shrink-0" aria-hidden />
            <p className="text-xl text-white">{mascotMessage}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
