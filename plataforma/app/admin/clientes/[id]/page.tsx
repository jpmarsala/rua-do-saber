import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { notFound, redirect } from "next/navigation";
import { setTenantCollections } from "./actions";
import { InviteGestorForm } from "./InviteGestorForm";
import { TenantCollectionsForm } from "./TenantCollectionsForm";

export default async function AdminClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "nova") redirect("/admin/clientes/nova");
  const supabase = await createClient();
  if (!supabase) notFound();
  const admin = createServiceRoleClient();
  const tenantClient = admin ?? supabase;
  const { data: tenant } = await tenantClient.from("tenants").select("id, name, slug").eq("id", id).single();
  if (!tenant) notFound();
  const [collections, assigned] = await Promise.all([
    supabase.from("collections").select("id, title, year").order("year", { ascending: false }),
    supabase.from("tenant_collections").select("collection_id").eq("tenant_id", id),
  ]);
  const assignedIds = (assigned.data ?? []).map((r: { collection_id: string }) => r.collection_id);
  return (
    <div>
      <nav className="text-sm text-streaming-muted mb-4">
        <Link href="/admin/clientes" className="hover:text-slate-700">Clientes</Link>
        <span className="mx-2">/</span>
        <span className="text-white font-medium">{tenant.name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-white mb-2">{tenant.name}</h1>
      <p className="text-streaming-muted mb-6">Coleções liberadas para este cliente (programa em /t/{tenant.slug}).</p>
      <Suspense fallback={null}>
        <InviteGestorForm tenantId={id} />
      </Suspense>
      <TenantCollectionsForm
        tenantId={id}
        collections={(collections.data ?? []) as { id: string; title: string; year?: number }[]}
        initialAssignedIds={assignedIds}
        setTenantCollections={setTenantCollections}
      />
    </div>
  );
}
