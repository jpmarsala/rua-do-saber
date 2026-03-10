"use client";

import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import { useState } from "react";

const PLACEHOLDER = "/placeholders/aula-thumb.png";

type Lesson = { id: string; title: string; summary?: string; number_in_collection?: number };

export function AulaHeroCarousel({
  lessons,
  currentIndex: initialIndex = 0,
}: {
  lessons: Lesson[];
  currentIndex?: number;
}) {
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const [index, setIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, safeLessons.length - 1))
  );
  if (!safeLessons.length) {
    return (
      <section className="relative min-h-[50vh] flex flex-col justify-center items-center bg-streaming-bg-card border-b border-streaming-border">
        <p className="text-streaming-muted text-center px-4">Nenhuma aula disponível no momento.</p>
        <p className="text-streaming-muted text-sm mt-2">Verifique se seu perfil tem acesso a uma coleção.</p>
      </section>
    );
  }
  const lesson = safeLessons[index];
  if (!lesson) return null;
  const prev = () => setIndex((i) => (i <= 0 ? safeLessons.length - 1 : i - 1));
  const next = () => setIndex((i) => (i >= safeLessons.length - 1 ? 0 : i + 1));

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PLACEHOLDER}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-streaming-bg via-streaming-bg/60 to-transparent" />
      </div>
      <div className="relative z-10 container mx-auto px-4 pb-16 pt-32">
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Aula de hoje</p>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white drop-shadow-lg max-w-4xl mb-4">
          {formatLessonTitleForDisplay(lesson.title)}
        </h1>
        {lesson.summary && (
          <p className="text-white/90 text-lg max-w-2xl drop-shadow mb-8 line-clamp-2">{lesson.summary}</p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/aluno/aulas/${lesson.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white hover:bg-primary-hover transition-colors text-lg"
          >
            ▶ Assistir
          </Link>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        <button
          type="button"
          onClick={prev}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
          aria-label="Aula anterior"
        >
          ‹
        </button>
        <div className="flex gap-1.5">
          {safeLessons.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`}
              aria-label={`Aula ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
          aria-label="Próxima aula"
        >
          ›
        </button>
      </div>
    </section>
  );
}
