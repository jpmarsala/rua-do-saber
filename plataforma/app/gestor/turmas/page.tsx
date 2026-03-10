import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getGestorClassesWithStudents } from "@/lib/gestor/dashboard-data";
import { redirect } from "next/navigation";
import { TurmasCards } from "./components/TurmasCards";

export default async function GestorTurmasPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const params = await searchParams;
  const tenantId = params.tenantId ?? undefined;
  const classes = await getGestorClassesWithStudents(tenantId);
  const qs = params.tenantId ? `?tenantId=${params.tenantId}` : "";

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Turmas</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Turmas</h1>
      <p className="text-slate-600 mb-6">Turmas cadastradas nas escolas da sua instituição. Expanda para ver alunos e progresso.</p>
      <TurmasCards classes={classes} qs={qs} tenantId={tenantId} />
    </div>
  );
}
