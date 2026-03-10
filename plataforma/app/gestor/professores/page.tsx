import Link from "next/link";

export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth/get-session";
import { getGestorTeachersWithSchoolAndClasses, getGestorSchools, getGradesForGestor } from "@/lib/gestor/dashboard-data";
import { redirect } from "next/navigation";
import { ProfessoresCards } from "./components/ProfessoresCards";

export default async function GestorProfessoresPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const params = await searchParams;
  const tenantId = params.tenantId ?? undefined;
  const [teachers, schools, grades] = await Promise.all([
    getGestorTeachersWithSchoolAndClasses(tenantId),
    getGestorSchools(tenantId),
    getGradesForGestor(),
  ]);
  const qs = params.tenantId ? `?tenantId=${params.tenantId}` : "";
  const effectiveTenantId = session.role === "super_admin" ? (tenantId ?? session.tenantId) : session.tenantId;

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Professores</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Professores</h1>
      <p className="text-slate-600 mb-6">Professores da sua instituição. Expanda para ver escola e turmas.</p>
      <div className="mb-4">
        <Link href={"/gestor/professores/novo" + qs} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90">
          Convidar professor
        </Link>
        {schools.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">Cadastre pelo menos uma escola em <Link href={"/gestor/escolas" + qs} className="underline">Escolas</Link> para poder convidar professores.</p>
        )}
      </div>
      <ProfessoresCards teachers={teachers} grades={grades} tenantId={effectiveTenantId} qs={qs} />
    </div>
  );
}
