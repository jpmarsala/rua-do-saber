import Link from "next/link";

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenantName =
    tenantSlug === "demo" ? "Município Demo" : decodeURIComponent(tenantSlug);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Programa — {tenantName}
      </h1>
      <p className="text-slate-600 mb-6">
        Coleções e episódios disponíveis para este município.
      </p>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-slate-500 text-sm">
          Em breve: listagem de coleções. Configure o Supabase e rode o seed.
        </p>
        <Link
          href={`/t/${tenantSlug}/colecoes/demo`}
          className="inline-block mt-4 text-primary font-medium hover:underline"
        >
          Ver coleção demo →
        </Link>
      </div>
    </div>
  );
}
