import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getGestorDashboardStats, getTenantsForGestor } from "@/lib/gestor/dashboard-data";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function GestorPage({

  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") {
    redirect("/entrar");
  }

  const params = await searchParams;
  const tenantId = params.tenantId ?? null;

  const isSuperAdmin = session.role === "super_admin";
  const effectiveTenantId = isSuperAdmin ? (tenantId ?? session.tenantId) : session.tenantId;

  if (isSuperAdmin && !effectiveTenantId) {
    const tenants = await getTenantsForGestor();
    return (
      <div>
        <h1 className="text-2xl font-display font-bold text-streaming-text mb-2">Painel do gestor</h1>
        <p className="text-streaming-muted mb-6">
          Selecione um cliente (prefeitura, agência de trânsito ou escola). Cada cliente gerencia suas escolas em Escolas.
        </p>
        <ul className="space-y-2">
          {tenants.map((t) => (
            <li key={t.id}>
              <Link
                href={`/gestor?tenantId=${t.id}`}
                className="block p-4 rounded-lg border border-streaming-border bg-streaming-bg-card hover:border-primary"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-streaming-text">{t.name}</span>
                  <span className="text-streaming-muted text-sm">({t.slug})</span>
                  {t.client_type === "prefeitura" && <span className="text-xs px-2 py-0.5 rounded bg-streaming-bg-card text-streaming-muted">Prefeitura</span>}
                  {t.client_type === "agencia_transito" && <span className="text-xs px-2 py-0.5 rounded bg-rua-pale text-rua-sky">Agência de trânsito</span>}
                  {t.client_type === "escola" && <span className="text-xs px-2 py-0.5 rounded bg-rua-cream/20 text-rua-orange">Escola</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {tenants.length === 0 && (
          <p className="text-streaming-muted">Nenhum cliente cadastrado.</p>
        )}
      </div>
    );
  }

  const stats = await getGestorDashboardStats(tenantId ?? undefined);
  const qs = effectiveTenantId ? `?tenantId=${effectiveTenantId}` : "";

  return (
    <div>
      {isSuperAdmin && effectiveTenantId && (
        <p className="text-sm text-streaming-muted mb-2">
          Visualizando como gestor do cliente selecionado.{" "}
          <Link href="/gestor" className="text-primary hover:underline">Trocar cliente</Link>
        </p>
      )}

      <h1 className="text-2xl font-display font-bold text-streaming-text mb-2">Painel do gestor</h1>
      <p className="text-streaming-muted mb-6">
        Visão geral da sua instituição: escolas, professores, turmas e alunos.
      </p>

      {stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/gestor/escolas${qs}`}
            className="block p-6 bg-streaming-bg-card rounded-xl border border-streaming-border hover:border-primary"
          >
            <p className="text-3xl font-display font-bold text-streaming-text">{stats.schoolsCount}</p>
            <p className="text-streaming-muted text-sm mt-1">Escolas ativas</p>
          </Link>
          <Link
            href={`/gestor/professores${qs}`}
            className="block p-6 bg-streaming-bg-card rounded-xl border border-streaming-border hover:border-primary"
          >
            <p className="text-3xl font-display font-bold text-streaming-text">{stats.teachersCount}</p>
            <p className="text-streaming-muted text-sm mt-1">Professores</p>
          </Link>
          <Link
            href={`/gestor/turmas${qs}`}
            className="block p-6 bg-streaming-bg-card rounded-xl border border-streaming-border hover:border-primary"
          >
            <p className="text-3xl font-display font-bold text-streaming-text">{stats.classesCount}</p>
            <p className="text-streaming-muted text-sm mt-1">Turmas</p>
          </Link>
          <Link
            href={`/gestor/relatorios${qs}`}
            className="block p-6 bg-streaming-bg-card rounded-xl border border-streaming-border hover:border-primary"
          >
            <p className="text-3xl font-display font-bold text-streaming-text">—</p>
            <p className="text-streaming-muted text-sm mt-1">Relatórios</p>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-streaming-border bg-streaming-bg-card text-streaming-text text-sm">
          <p>Não foi possível carregar os dados. Verifique se sua conta está vinculada a uma instituição (tenant).</p>
        </div>
      )}

      <div className="mt-8">
        <Link
          href={`/gestor/relatorios${qs}`}
          className="inline-block px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90"
        >
          Ver relatórios de uso
        </Link>
      </div>
    </div>
  );
}
