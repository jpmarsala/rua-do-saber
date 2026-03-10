import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

function YouTubeEmbed({ url }: { url: string | null }) {
  if (!url) return null;
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
  if (!videoId) return null;
  return (
    <div className="aspect-video w-full max-w-4xl rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-white/10">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Vídeo da aula"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

/* Hero placeholder estilo thumbnail infantil (gradiente colorido) */
function HeroPlaceholder() {
  return (
    <div
      className="absolute inset-0 opacity-95"
      style={{
        background: "linear-gradient(135deg, var(--kids-yellow) 0%, var(--kids-lime) 30%, var(--kids-green) 60%, #16a34a 100%)",
        borderBottom: "6px solid var(--kids-lime)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur flex items-center justify-center border-4 border-white/50">
          <span className="text-4xl text-white drop-shadow">▶</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === 1 ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

/* Card secundário da aula (Objetivo, Introdução, etc.) */
function LessonCard({
  title,
  children,
  accentColor,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  accentColor: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden border-2 border-streaming-border bg-streaming-bg-card hover:border-primary/50 transition-all hover:scale-[1.01]"
      style={{ borderLeftWidth: "6px", borderLeftColor: accentColor }}
    >
      <div className="p-5 flex gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl text-white mb-2">{title}</h3>
          <div className="text-streaming-muted text-sm whitespace-pre-line">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; episodeId: string }>;
}) {
  const { tenantSlug, episodeId } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  let lesson: { id: string; title: string; summary?: string; collection_id?: string } | null = null;
  const isUuid = /^[0-9a-f-]{36}$/i.test(episodeId);
  if (isUuid) {
    const { data } = await supabase.from("lessons").select("id, title, summary, collection_id").eq("id", episodeId).single();
    lesson = data;
  } else {
    const { data: firstCol } = await supabase.from("collections").select("id").order("year", { ascending: false }).limit(1).single();
    if (firstCol) {
      const num = parseInt(episodeId, 10);
      const { data } = await supabase.from("lessons").select("id, title, summary, collection_id").eq("collection_id", firstCol.id).eq("number_in_collection", num).single();
      lesson = data;
    }
  }

  if (!lesson) notFound();

  const { data: version } = await supabase.from("lesson_versions").select("id").eq("lesson_id", lesson.id).is("tenant_id", null).single();
  if (!version) notFound();

  const [content, media, card] = await Promise.all([
    supabase.from("lesson_content").select("*").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_media").select("*").eq("lesson_version_id", version.id).maybeSingle(),
    supabase.from("lesson_cards").select("*").eq("lesson_version_id", version.id).maybeSingle(),
  ]);

  const collection = lesson.collection_id
    ? (await supabase.from("collections").select("id, title").eq("id", lesson.collection_id).single()).data
    : null;

  const c = content.data as { learning_objective?: string; teacher_introduction?: string; discussion_questions?: string[]; activity_description?: string; home_mission?: string } | null;
  const m = media.data as { youtube_url?: string } | null;
  const cardData = card.data as { name?: string; description?: string; image_url?: string } | null;

  const hasVideo = !!m?.youtube_url;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 pt-6 text-sm text-streaming-muted z-10 relative">
        <Link href={`/t/${tenantSlug}`} className="hover:text-white transition-colors">Programa</Link>
        <span className="mx-2">/</span>
        {collection && (
          <>
            <Link href={`/t/${tenantSlug}/colecoes/${collection.id}`} className="hover:text-white transition-colors">{collection.title}</Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-white">{formatLessonTitleForDisplay(lesson.title)}</span>
      </nav>

      {/* Hero full-screen — card forte estilo streaming */}
      <section className="relative min-h-[75vh] flex flex-col justify-end pb-12 pt-8 -mt-12">
        {hasVideo ? (
          <div className="absolute inset-0 flex items-center justify-center px-4 pt-20">
            <YouTubeEmbed url={m?.youtube_url ?? null} />
          </div>
        ) : (
          <HeroPlaceholder />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-streaming-bg via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 mt-auto">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-tight text-white drop-shadow-lg max-w-4xl">
            {formatLessonTitleForDisplay(lesson.title)}
          </h1>
          {lesson.summary && (
            <p className="text-lg text-white/90 mt-3 max-w-2xl drop-shadow">
              {lesson.summary}
            </p>
          )}
          {!hasVideo && (
            <p className="mt-4 text-streaming-muted text-sm">Vídeo em breve • Conteúdo da aula abaixo</p>
          )}
        </div>
      </section>

      {/* Cards secundários — Objetivo, Introdução, Perguntas, Atividade, Missão */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display text-3xl text-white mb-8">Conteúdo da aula</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {c?.learning_objective && (
            <LessonCard title="Objetivo" accentColor="var(--kids-green)" icon="🎯">
              {c.learning_objective}
            </LessonCard>
          )}
          {c?.teacher_introduction && (
            <LessonCard title="Introdução" accentColor="var(--kids-lime)" icon="📖">
              {c.teacher_introduction}
            </LessonCard>
          )}
          {c?.discussion_questions?.length ? (
            <LessonCard title="Perguntas para debate" accentColor="var(--kids-orange)" icon="💬">
              {c.discussion_questions.join("\n")}
            </LessonCard>
          ) : null}
          {c?.activity_description && (
            <LessonCard title="Atividade" accentColor="var(--kids-pink)" icon="✏️">
              {c.activity_description}
            </LessonCard>
          )}
          {c?.home_mission && (
            <LessonCard title="Missão para casa" accentColor="var(--kids-yellow)" icon="🏠">
              {c.home_mission}
            </LessonCard>
          )}
        </div>

        {cardData && (cardData.name || cardData.description) && (
          <div className="mt-10 rounded-2xl border-2 border-primary/50 bg-primary/10 p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/30 flex items-center justify-center text-3xl">🃏</div>
            <div>
              <h3 className="font-display text-xl text-white">Card conquistado</h3>
              <p className="font-semibold text-white">{cardData.name}</p>
              {cardData.description && <p className="text-streaming-muted text-sm mt-1">{cardData.description}</p>}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/t/${tenantSlug}/jogos/${lesson.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white hover:bg-primary-hover transition-colors text-lg"
          >
            ▶ Jogar agora
          </Link>
        </div>
      </section>
    </div>
  );
}
