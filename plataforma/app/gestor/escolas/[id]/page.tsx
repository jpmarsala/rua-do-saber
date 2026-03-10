import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getSchoolById } from "@/lib/gestor/dashboard-data";
import { redirect, notFound } from "next/navigation";

export default async function GestorEscolaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const { id } = await params;
  const { tenantId } = await searchParams;
  const school = await getSchoolById(id, tenantId ?? undefined);
  if (!school) notFound();

  const qs = tenantId ? `?tenantId=${tenantId}` : "";

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <Link href={`/gestor/escolas${qs}`} className="hover:text-slate-700">Escolas</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{school.name}</span>
      </nav>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{school.name}</h1>
        <dl className="space-y-2 text-slate-600">
          <div><dt className="font-medium text-slate-700 inline">Status: </dt><dd className="inline">{school.active ? "Ativa" : "Inativa"}</dd></div>
          {school.slug != null && school.slug !== "" && <div><dt className="font-medium text-slate-700 inline">Slug: </dt><dd className="inline">{school.slug}</dd></div>}
          {school.created_at && <div><dt className="font-medium text-slate-700 inline">Cadastrada em: </dt><dd className="inline">{new Date(school.created_at).toLocaleDateString("pt-BR")}</dd></div>}
        </dl>
        <Link href={`/gestor/escolas${qs}`} className="inline-block mt-4 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">Voltar às escolas</Link>
      </div>
    </div>
  );
}
