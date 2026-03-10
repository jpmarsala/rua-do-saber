import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getGestorClassById, getGestorTeachers, getClassTeacherIds } from "@/lib/gestor/dashboard-data";
import { redirect, notFound } from "next/navigation";
import { EditarTurmaForm } from "./EditarTurmaForm";

export default async function GestorTurmaEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const { id } = await params;
  const { tenantId } = await searchParams;
  const [turma, teachers, classTeacherIds] = await Promise.all([
    getGestorClassById(id, tenantId ?? undefined),
    getGestorTeachers(tenantId ?? undefined),
    getClassTeacherIds(id),
  ]);
  if (!turma) notFound();

  const qs = tenantId ? `?tenantId=${tenantId}` : "";

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <Link href={`/gestor/turmas${qs}`} className="hover:text-slate-700">Turmas</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{turma.name}</span>
      </nav>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{turma.name}</h1>
        <p className="text-slate-600 mb-4">Escola: <Link href={`/gestor/escolas/${turma.schoolId}${qs}`} className="text-primary hover:underline">{turma.schoolName}</Link></p>
        <EditarTurmaForm classId={turma.id} initialName={turma.name} initialTeacherIds={classTeacherIds} teachers={teachers} tenantIdOverride={tenantId ?? null} qs={qs} />
      </div>
    </div>
  );
}
