import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, var(--kids-yellow) 0%, var(--kids-lime) 100%)",
  "linear-gradient(135deg, var(--kids-lime) 0%, var(--kids-green) 100%)",
  "linear-gradient(135deg, var(--kids-pink) 0%, var(--kids-orange) 100%)",
  "linear-gradient(135deg, var(--kids-green) 0%, #16a34a 100%)",
];

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const supabase = await createClient();
  let tenantName = tenantSlug === "demo" ? "Município Demo" : decodeURIComponent(tenantSlug);
  let collectionIds: string[] | null = null;

  if (supabase) {
    const { data: tenant } = await supabase.from("tenants").select("id, name").eq("slug", tenantSlug).maybeSingle();
    if (tenant) {
      tenantName = tenant.name;
      const { data: assigned } = await supabase.from("tenant_collections").select("collection_id").eq("tenant_id", tenant.id);
      if (assigned?.length) collectionIds = assigned.map((r: { collection_id: string }) => r.collection_id);
    }
  }

  const { data: allCollections } = supabase
    ? await supabase.from("collections").select("id, title, year").order("year", { ascending: false })
    : { data: [] };
  const collections = collectionIds && collectionIds.length > 0
    ? (allCollections ?? []).filter((c: { id: string }) => collectionIds!.includes(c.id))
    : (allCollections ?? []);

  return (
    <div className="min-h-screen">
      <section className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent z-0" />
        <div className="container mx-auto relative z-10">
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-white mb-2">
            Programa — {tenantName}
          </h1>
          <p className="text-streaming-muted">Coleções e episódios disponíveis.</p>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-20">
        {!collections.length ? (
          <div className="rounded-xl bg-streaming-bg-card border border-streaming-border p-8 text-center">
            <p className="text-streaming-muted">
              Nenhuma coleção disponível. Atribua coleções em Admin → Clientes.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((c: { id: string; title: string; year?: number }, i: number) => (
              <Link
                key={c.id}
                href={`/t/${tenantSlug}/colecoes/${c.id}`}
                className="group block rounded-xl overflow-hidden bg-streaming-bg-card border border-streaming-border hover:border-primary/50 transition-all hover:scale-[1.02]"
              >
                <div className="aspect-video flex items-center justify-center" style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}>
                  <span className="font-display text-4xl text-white/90 drop-shadow group-hover:scale-110 transition-transform">▶</span>
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-white group-hover:text-primary transition-colors">{c.title}</h2>
                  {c.year != null && <p className="text-streaming-muted text-sm mt-1">{c.year}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
