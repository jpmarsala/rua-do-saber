import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { redirect } from "next/navigation";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";

export const dynamic = "force-dynamic";

type Collection = { id: string; title: string; year?: number };
type Lesson = { id: string; title: string; number_in_collection?: number };

export default async function GestorColecoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/entrar");

  const params = await searchParams;
  const tenantIdParam = params.tenantId ?? null;
  const effectiveTenantId =
    session.role === "super_admin"
      ? tenantIdParam ?? session.tenantId
      : session.tenantId;

  if (!effectiveTenantId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Coleções de aula</h1>
        <p className="text-streaming-muted mb-4">
          Selecione um cliente no <Link href="/gestor" className="text-primary hover:underline">Dashboard do gestor</Link> para ver as coleções.
        </p>
      </div>
    );
  }

  const db = createServiceRoleClient();
  if (!db) return <p className="text-streaming-muted">Serviço indisponível.</p>;

  const { data: tenant } = await db
    .from("tenants")
    .select("id, name, slug")
    .eq("id", effectiveTenantId)
    .single();
  if (!tenant) return <p className="text-streaming-muted">Cliente não encontrado.</p>;

  const { data: assigned } = await db
    .from("tenant_collections")
    .select("collection_id")
    .eq("tenant_id", effectiveTenantId);
  const collectionIds = (assigned ?? []).map((r: { collection_id: string }) => r.collection_id);

  if (collectionIds.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Coleções de aula</h1>
        <p className="text-streaming-muted mb-2">Cliente: {tenant.name}</p>
        <p className="text-streaming-muted">
          Nenhuma coleção atribuída a este cliente. Atribua em Admin → Clientes → Coleções.
        </p>
      </div>
    );
  }

  const { data: collections } = await db
    .from("collections")
    .select("id, title, year")
    .in("id", collectionIds)
    .order("year", { ascending: false });

  const slug = tenant.slug ?? tenant.id;
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Coleções de aula</h1>
      <p className="text-streaming-muted mb-6">
        Cliente: <span className="text-white font-medium">{tenant.name}</span>. Abra cada coleção ou aula individualmente.
      </p>
      <div className="space-y-8">
        {(collections ?? []).map((col: Collection) => (
          <ColecaoBlock key={col.id} collection={col} slug={slug} />
        ))}
      </div>
    </div>
  );
}

async function ColecaoBlock({ collection, slug }: { collection: Collection; slug: string }) {
  const db = createServiceRoleClient();
  if (!db) return null;
  const { data: lessons } = await db
    .from("lessons")
    .select("id, title, number_in_collection")
    .eq("collection_id", collection.id)
    .order("number_in_collection", { ascending: true });

  return (
    <section className="rounded-xl border border-streaming-border bg-streaming-bg-card overflow-hidden">
      <div className="p-4 border-b border-streaming-border flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">{collection.title}</h2>
        <Link
          href={`/t/${slug}/colecoes/${collection.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-3 py-1.5 rounded-lg border border-streaming-border text-primary hover:bg-streaming-bg"
        >
          Abrir coleção
        </Link>
      </div>
      <ul className="divide-y divide-streaming-border">
        {(lessons ?? []).map((lesson: Lesson) => (
          <li key={lesson.id} className="px-4 py-2 flex items-center justify-between gap-2">
            <span className="text-streaming-text">
              {formatLessonTitleForDisplay(lesson.title)}
            </span>
            <Link
              href={`/t/${slug}/episodios/${lesson.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Ver aula
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
