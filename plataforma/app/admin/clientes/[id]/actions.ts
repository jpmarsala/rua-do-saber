"use server";

import { createClient } from "@/lib/supabase/server";

export async function setTenantCollections(tenantId: string, collectionIds: string[]) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  await supabase.from("tenant_collections").delete().eq("tenant_id", tenantId);
  if (collectionIds.length > 0) {
    const { error } = await supabase.from("tenant_collections").insert(
      collectionIds.map((collection_id) => ({ tenant_id: tenantId, collection_id }))
    );
    if (error) return { error: error.message };
  }
  return { data: { ok: true } };
}
