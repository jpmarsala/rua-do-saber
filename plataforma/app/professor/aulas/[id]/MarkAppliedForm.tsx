"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markLessonApplied } from "./actions";

export function MarkAppliedForm({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await markLessonApplied(lessonId, notes);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }
  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-semibold text-slate-800 mb-2">Marcar como aplicada</h3>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações (opcional)" rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2" />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">Marcar como aplicada</button>
    </form>
  );
}
