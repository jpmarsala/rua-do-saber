import Link from "next/link";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; collectionId: string }>;
}) {
  const { tenantSlug, collectionId } = await params;

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/t/${tenantSlug}`} className="hover:text-slate-700">
          Programa
        </Link>
        <span className="mx-2">/</span>
        <span>Coleção {collectionId}</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Coleção {collectionId}
      </h1>
      <p className="text-slate-600 mb-6">
        Episódios desta coleção. Dados virão do Supabase após o seed.
      </p>
      <div className="grid gap-4">
        <Link
          href={`/t/${tenantSlug}/episodios/1`}
          className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-primary/50"
        >
          <span className="font-medium">Episódio 1</span> — placeholder
        </Link>
      </div>
    </div>
  );
}
