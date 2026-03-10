import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

export default async function AdminPage() {
  const admin = createServiceRoleClient();
  const [tenantsCount, lessonsCount, collectionsCount] = admin
    ? await Promise.all([
        admin.from("tenants").select("id", { count: "exact", head: true }).then((r) => r.count ?? 0),
        admin.from("lessons").select("id", { count: "exact", head: true }).then((r) => r.count ?? 0),
        admin.from("collections").select("id", { count: "exact", head: true }).then((r) => r.count ?? 0),
      ])
    : [0, 0, 0];

  const cards = [
    { label: "Clientes", value: tenantsCount, href: "/admin/clientes", cta: "Ver clientes", primary: true },
    { label: "Aulas", value: lessonsCount, href: "/admin/aulas", cta: "Ver aulas", primary: false },
    { label: "Coleções", value: collectionsCount, href: "/admin/aulas", cta: "Editorial", primary: false },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl tracking-tight text-white mb-2">Dashboard</h1>
      <p className="text-streaming-muted mb-8">
        Visão geral do conteúdo e clientes. Use o menu ao lado para acessar cada área.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, href, cta, primary }) => (
          <Link
            key={label}
            href={href}
            className={`block rounded-xl border p-6 transition hover:border-primary/40 ${
              primary ? "border-primary/30 bg-primary/10" : "border-streaming-border bg-streaming-bg-card"
            }`}
          >
            <p className="text-sm font-medium text-streaming-muted">{label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm font-medium text-primary">{cta} →</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/clientes/nova"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          Novo cliente
        </Link>
        <Link
          href="/admin/aulas/nova"
          className="inline-flex items-center rounded-lg border border-streaming-border px-4 py-2 text-sm font-medium text-streaming-text hover:bg-streaming-bg-card transition-colors"
        >
          Nova aula
        </Link>
      </div>
    </div>
  );
}
