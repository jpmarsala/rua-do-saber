import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAulasPage() {
  const supabase = await createClient();
  const { data: lessons } = supabase
    ? await supabase
        .from("lessons")
        .select(`
          id,
          title,
          slug,
          status,
          number_in_collection,
          created_at,
          collections(title),
          grades(name),
          pillars(name)
        `)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Aulas</h1>
        <Link
          href="/admin/aulas/nova"
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90"
        >
          Nova aula
        </Link>
      </div>
      {!lessons?.length ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center text-slate-600">
          Nenhuma aula cadastrada. Crie a primeira em &quot;Nova aula&quot;.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-3 font-medium text-slate-700">#</th>
                <th className="text-left p-3 font-medium text-slate-700">Título</th>
                <th className="text-left p-3 font-medium text-slate-700">Coleção</th>
                <th className="text-left p-3 font-medium text-slate-700">Ano</th>
                <th className="text-left p-3 font-medium text-slate-700">Status</th>
                <th className="text-left p-3 font-medium text-slate-700"></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 text-slate-600">{l.number_in_collection ?? "—"}</td>
                  <td className="p-3 font-medium text-slate-800">{l.title}</td>
                  <td className="p-3 text-slate-600">{(Array.isArray(l.collections) ? l.collections[0]?.title : (l.collections as { title?: string } | null)?.title) ?? "—"}</td>
                  <td className="p-3 text-slate-600">{(Array.isArray(l.grades) ? l.grades[0]?.name : (l.grades as { name?: string } | null)?.name) ?? "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      l.status === "published" ? "bg-green-100 text-green-800" :
                      l.status === "draft" ? "bg-slate-100 text-slate-700" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/aulas/${l.id}`} className="text-primary hover:underline font-medium">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
