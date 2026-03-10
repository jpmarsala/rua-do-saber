"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TenantCollectionsForm({
  tenantId,
  collections,
  initialAssignedIds,
  setTenantCollections,
}: {
  tenantId: string;
  collections: { id: string; title: string; year?: number }[];
  initialAssignedIds: string[];
  setTenantCollections: (tenantId: string, collectionIds: string[]) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAssignedIds));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await setTenantCollections(tenantId, Array.from(selected));
    setLoading(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="space-y-2">
        {collections.map((c) => (
          <label key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-streaming-border hover:bg-streaming-bg-card cursor-pointer">
            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="rounded" />
            <span className="font-medium text-white">{c.title}</span>
            {c.year != null && <span className="text-streaming-muted text-sm">{c.year}</span>}
          </label>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
        {loading ? "Salvando…" : "Salvar coleções"}
      </button>
    </form>
  );
}
