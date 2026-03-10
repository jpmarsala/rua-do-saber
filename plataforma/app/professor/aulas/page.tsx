import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getCollectionsAndLessonsForCurrentTenant } from "@/lib/auth/lessons-for-tenant";
import { redirect } from "next/navigation";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";

const CARD_W = 140;
const CARD_H = 210;

export default async function ProfessorAulasPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  const { lessons } = await getCollectionsAndLessonsForCurrentTenant();
  return (
    <div className="text-streaming-text">
      <h1 className="text-2xl font-display font-bold text-streaming-text mb-2">Biblioteca de aulas</h1>
      <p className="text-streaming-muted mb-6">Aulas disponíveis para seu município.</p>
      {!lessons.length ? (
        <p className="text-streaming-muted">Nenhuma aula disponível. Atribua coleções ao seu cliente em Admin.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {lessons.map((l: { id: string; title: string; summary?: string }) => (
            <Link
              key={l.id}
              href={`/professor/aulas/${l.id}`}
              className="group block overflow-hidden rounded-lg border border-streaming-border bg-streaming-bg-card hover:border-primary shrink-0 shadow-md"
              style={{ width: CARD_W, height: CARD_H }}
            >
              <div
                className="relative w-full h-full bg-rua-slate bg-cover bg-center"
                style={{
                  backgroundImage: "linear-gradient(180deg, var(--rua-bg-guide) 0%, var(--rua-dark) 100%)",
                }}
              >
                <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <span className="font-display font-semibold text-white text-sm leading-tight line-clamp-3 drop-shadow-md">
                    {formatLessonTitleForDisplay(l.title)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
