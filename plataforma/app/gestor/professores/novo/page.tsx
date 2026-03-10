import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getGradesForGestor, getGestorSchools } from "@/lib/gestor/dashboard-data";
import { redirect } from "next/navigation";
import { ConvidarProfessorForm } from "./ConvidarProfessorForm";

export default async function GestorNovoProfessorPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (session.role !== "manager" && session.role !== "super_admin") redirect("/");

  const params = await searchParams;
  const tenantId = params.tenantId ?? undefined;
  const qs = params.tenantId ? `?tenantId=${params.tenantId}` : "";
  const [grades, schools] = await Promise.all([getGradesForGestor(), getGestorSchools(tenantId)]);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href={`/gestor${qs}`} className="hover:text-slate-700">Gestor</Link>
        <span className="mx-2">/</span>
        <Link href={`/gestor/professores${qs}`} className="hover:text-slate-700">Professores</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Convidar professor</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Convidar professor</h1>
      <p className="text-slate-600 mb-6">O professor receberá um e-mail para ativar a conta. Os anos selecionados definem a quais bibliotecas de aulas ele terá acesso.</p>
      <ConvidarProfessorForm tenantIdOverride={tenantId} grades={grades} schools={schools} />
    </div>
  );
}
