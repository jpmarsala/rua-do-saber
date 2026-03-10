import Link from "next/link";

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; episodeId: string }>;
}) {
  const { tenantSlug, episodeId } = await params;

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/t/${tenantSlug}`} className="hover:text-slate-700">
          Programa
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/t/${tenantSlug}/colecoes/demo`}
          className="hover:text-slate-700"
        >
          Coleção
        </Link>
        <span className="mx-2">/</span>
        <span>Episódio {episodeId}</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Episódio {episodeId}
      </h1>
      <p className="text-slate-600 mb-6">
        Vídeo, guia do professor e jogo. Dados virão do Supabase.
      </p>
      <div className="space-y-6">
        <section className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center text-slate-500">
          Player de vídeo (YouTube embed)
        </section>
        <div>
          <Link
            href={`/t/${tenantSlug}/jogos/1`}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:opacity-90"
          >
            Jogar agora
          </Link>
        </div>
        <section className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-2">
            Para o professor
          </h2>
          <p className="text-slate-600 text-sm">
            Guia da aula e atividade prática (conteúdo do episódio).
          </p>
        </section>
      </div>
    </div>
  );
}
