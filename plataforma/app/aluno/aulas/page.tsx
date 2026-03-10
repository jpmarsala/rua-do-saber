import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/get-session";
import { getCollectionsAndLessonsForCurrentTenant } from "@/lib/auth/lessons-for-tenant";
import { getViewedLessonIds } from "@/lib/auth/aluno-progress";
import { redirect } from "next/navigation";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";

const PLACEHOLDER = "/placeholders/aula-thumb.png";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, var(--kids-yellow) 0%, var(--kids-lime) 100%)",
  "linear-gradient(135deg, var(--kids-lime) 0%, var(--kids-green) 100%)",
  "linear-gradient(135deg, var(--kids-pink) 0%, var(--kids-orange) 100%)",
  "linear-gradient(135deg, var(--kids-green) 0%, #16a34a 100%)",
  "linear-gradient(135deg, var(--kids-orange) 0%, var(--kids-yellow) 100%)",
];

export default async function AlunoAulasPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { lessons } = await getCollectionsAndLessonsForCurrentTenant();
  const viewedIds = await getViewedLessonIds();
  const ordered = [...(lessons ?? [])].sort(
    (a: { number_in_collection?: number }, b: { number_in_collection?: number }) =>
      (a.number_in_collection ?? 0) - (b.number_in_collection ?? 0)
  );
  const nextToWatch = ordered.find((l: { id: string }) => !viewedIds.has(l.id));
  const nextId = nextToWatch?.id ?? null;

  return (
    <div className="min-h-screen bg-streaming-bg">
      <section className="container mx-auto px-4 pt-8 pb-6">
        <h1 className="font-display text-3xl text-white mb-2">Todas as aulas</h1>
        <p className="text-streaming-muted">Aulas desbloqueadas podem ser assistidas. Conclua na ordem para liberar as próximas.</p>
      </section>
      <section className="container mx-auto px-4 pb-20">
        {!ordered.length ? (
          <p className="text-streaming-muted">Nenhuma aula disponível.</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {ordered.map((l: { id: string; title: string; summary?: string; number_in_collection?: number }, i: number) => {
              const unlocked = viewedIds.has(l.id) || l.id === nextId;
              return (
                <Link
                  key={l.id}
                  href={unlocked ? `/aluno/aulas/${l.id}` : "#"}
                  className={`group block rounded-xl overflow-hidden border-2 transition-all aspect-[3/4] ${
                    unlocked
                      ? "border-streaming-border hover:border-primary bg-streaming-bg-card"
                      : "border-streaming-border bg-streaming-bg-card opacity-75 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <div className="relative h-full">
                    {unlocked ? (
                      <Image
                        src={PLACEHOLDER}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-2xl">🔒</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-semibold text-white text-sm line-clamp-2 drop-shadow">
                        {formatLessonTitleForDisplay(l.title)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
