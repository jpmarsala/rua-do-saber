import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { NovaEscolaForm } from "./NovaEscolaForm";

export default async function GestorNovaEscolaPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const params = await searchParams;
  const tenantId = params.tenantId ?? undefined;
  const qs = params.tenantId ? `?tenantId=${params.tenantId}` : "";

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <Link href={`/gestor/escolas${qs}`} className="hover:text-slate-700">Escolas</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Nova escola</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Nova escola</h1>
      <p className="text-slate-600 mb-6">Cadastre uma nova escola na sua instituição.</p>
      <NovaEscolaForm tenantIdOverride={tenantId} />
    </div>
  );
}
