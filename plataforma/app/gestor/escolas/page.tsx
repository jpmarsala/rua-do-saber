import Link from "next/link";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth/get-session";
import { getGestorSchools, getGradesForGestor, getGestorTeachersWithSchoolAndClasses, getSchoolGradeIdsBySchool } from "@/lib/gestor/dashboard-data";
import { redirect } from "next/navigation";
import { EscolasCards } from "./components/EscolasCards";

export default async function GestorEscolasPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const params = await searchParams;
  const tenantId = params.tenantId ?? undefined;
  const schools = await getGestorSchools(tenantId);
  const [grades, teachers, schoolGradesMap] = await Promise.all([
    getGradesForGestor(),
    getGestorTeachersWithSchoolAndClasses(tenantId),
    getSchoolGradeIdsBySchool(schools.map((s) => s.id), tenantId),
  ]);
  const qs = params.tenantId ? `?tenantId=${params.tenantId}` : "";
  const effectiveTenantId =
    session.role === "super_admin"
      ? (tenantId ?? session.tenantId)
      : session.tenantId;

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Escolas</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Escolas</h1>
      <p className="text-slate-600 mb-6">Escolas vinculadas ao cliente. Adicione uma ou várias escolas para gerir; mesmo com um único cliente do tipo Escola, cadastre-a aqui.</p>
      <div className="mb-4">
        <Link href={"/gestor/escolas/nova" + qs} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">
          Nova escola
        </Link>
      </div>
      <EscolasCards
        schools={schools}
        grades={grades}
        teachers={teachers}
        schoolGradeIds={Object.fromEntries(schoolGradesMap)}
        tenantId={effectiveTenantId}
        qs={qs}
      />
    </div>
  );
}
