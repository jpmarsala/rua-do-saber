import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { ClientesList } from "./ClientesList";

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const admin = createServiceRoleClient();
  const client = admin ?? supabase;
  const { data: tenants } = client
    ? await client.from("tenants").select("id, name, slug, active, client_type, created_at, updated_at").order("name")
    : { data: [] };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Clientes</h1>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="text-streaming-muted">
          Gerencie clientes (tenants) e atribua coleções a cada um.
        </p>
        <Link href="/admin/clientes/nova" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90">Novo cliente</Link>
      </div>
      {!tenants?.length ? (
        <div className="border border-streaming-border rounded-lg p-8 text-center text-streaming-muted">
          Nenhum cliente cadastrado. <Link href="/admin/clientes/nova" className="text-primary hover:underline">Criar primeiro cliente</Link>.
        </div>
      ) : (
        <Suspense fallback={<div className="border border-streaming-border rounded-lg p-8 text-center text-streaming-muted">Carregando…</div>}>
          <ClientesList tenants={tenants} />
        </Suspense>
      )}
    </div>
  );
}
