export default async function GamePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; gameId: string }>;
}) {
  const { tenantSlug, gameId } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Jogo {gameId}
      </h1>
      <p className="text-slate-600 mb-6">
        Aqui será renderizado o motor do jogo (decision, match, quiz, memory,
        garage, novel) conforme config no Supabase.
      </p>
      <div className="bg-slate-100 rounded-lg aspect-video flex items-center justify-center text-slate-500">
        Área do jogo (tenant: {tenantSlug})
      </div>
    </div>
  );
}
