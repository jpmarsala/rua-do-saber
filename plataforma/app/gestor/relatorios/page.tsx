import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getGestorDashboardStats } from "@/lib/gestor/dashboard-data";
import { redirect } from "next/navigation";

export default async function GestorRelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const params = await searchParams;
  const tenantId = params.tenantId ?? undefined;
  const stats = await getGestorDashboardStats(tenantId);
  const qs = params.tenantId ? `?tenantId=${params.tenantId}` : "";

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Relatórios</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Relatórios</h1>
      <p className="text-slate-600 mb-6">Panorama geral da instituição e uso da plataforma.</p>

      {stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="p-6 rounded-xl border border-slate-200 bg-white">
            <p className="text-3xl font-bold text-slate-800">{stats.schoolsCount}</p>
            <p className="text-slate-600 text-sm mt-1">Escolas ativas</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 bg-white">
            <p className="text-3xl font-bold text-slate-800">{stats.teachersCount}</p>
            <p className="text-slate-600 text-sm mt-1">Professores</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 bg-white">
            <p className="text-3xl font-bold text-slate-800">{stats.classesCount}</p>
            <p className="text-slate-600 text-sm mt-1">Turmas</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 bg-white">
            <p className="text-3xl font-bold text-slate-800">{stats.studentsCount}</p>
            <p className="text-slate-600 text-sm mt-1">Alunos</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm mb-6">
          Não foi possível carregar os dados.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Acesso rápido</h2>
        <ul className="space-y-2">
          <li><Link href={`/gestor/escolas${qs}`} className="text-primary hover:underline">Ver escolas</Link></li>
          <li><Link href={`/gestor/professores${qs}`} className="text-primary hover:underline">Ver professores</Link></li>
          <li><Link href={`/gestor/turmas${qs}`} className="text-primary hover:underline">Ver turmas</Link></li>
        </ul>
      </div>

      <Link href={`/gestor${qs}`} className="inline-block mt-6 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">Voltar ao dashboard</Link>
    </div>
  );
}
