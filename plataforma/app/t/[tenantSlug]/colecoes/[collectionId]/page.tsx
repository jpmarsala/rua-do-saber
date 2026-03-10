import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, var(--kids-yellow) 0%, var(--kids-lime) 100%)",
  "linear-gradient(135deg, var(--kids-lime) 0%, var(--kids-green) 100%)",
  "linear-gradient(135deg, var(--kids-pink) 0%, var(--kids-orange) 100%)",
  "linear-gradient(135deg, var(--kids-green) 0%, #16a34a 100%)",
  "linear-gradient(135deg, var(--kids-orange) 0%, var(--kids-yellow) 100%)",
];

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; collectionId: string }>;
}) {
  const { tenantSlug, collectionId } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  let collection: { id: string; title: string; year?: number } | null = null;
  if (collectionId === "demo") {
    const { data } = await supabase
      .from("collections")
      .select("id, title, year")
      .order("year", { ascending: false })
      .limit(1)
      .single();
    collection = data;
  } else {
    const { data } = await supabase
      .from("collections")
      .select("id, title, year")
      .eq("id", collectionId)
      .single();
    collection = data;
  }

  if (!collection) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, number_in_collection, summary")
    .eq("collection_id", collection.id)
    .order("number_in_collection", { ascending: true });

  return (
    <div className="min-h-screen">
      <nav className="container mx-auto px-4 pt-6 text-sm text-streaming-muted">
        <Link href={`/t/${tenantSlug}`} className="hover:text-white transition-colors">Programa</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{collection.title}</span>
      </nav>
      <section className="relative pt-8 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent z-0" />
        <div className="container mx-auto relative z-10">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-white mb-2">{collection.title}</h1>
          <p className="text-streaming-muted">{lessons?.length ? `${lessons.length} aulas` : "Nenhuma aula"} nesta coleção.</p>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20">
        {!lessons?.length ? (
          <p className="text-streaming-muted">Nenhum episódio cadastrado.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lessons.map((l: { id: string; title: string; number_in_collection?: number; summary?: string }, i: number) => (
              <Link
                key={l.id}
                href={`/t/${tenantSlug}/episodios/${l.id}`}
                className="group block rounded-xl overflow-hidden bg-streaming-bg-card border border-streaming-border hover:border-primary/50 transition-all hover:scale-[1.02]"
              >
                <div className="aspect-video flex items-center justify-center" style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}>
                  <span className="font-display text-4xl text-white/90 drop-shadow group-hover:scale-110 transition-transform">▶</span>
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-white group-hover:text-primary transition-colors">
                    {formatLessonTitleForDisplay(l.title)}
                  </h2>
                  {l.summary && (
                    <p className="text-streaming-muted text-sm mt-1 line-clamp-2">{l.summary}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
