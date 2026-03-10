import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { getProfessorSchoolsWithClasses, getProfessorGradeIds } from "@/lib/professor/escolas-turmas-data";
import { getGradesForGestor } from "@/lib/gestor/dashboard-data";
import { redirect } from "next/navigation";
import { EscolasTurmasCards } from "./components/EscolasTurmasCards";
import type { ProfessorSchool } from "@/lib/professor/escolas-turmas-data";

export default async function ProfessorTurmasPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [schools, allGrades, teacherGradeIds] = await Promise.all([
    getProfessorSchoolsWithClasses(),
    getGradesForGestor(),
    getProfessorGradeIds(),
  ]);
  const gradesForTeacher = allGrades.filter((g) => teacherGradeIds.includes(g.id));

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/professor" className="hover:text-slate-700">Professor</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Escolas e turmas</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Escolas e turmas</h1>
      <p className="text-slate-600 mb-6">
        Gerencie as turmas das suas escolas: adicione e edite turmas e os alunos de cada turma.
      </p>

      {schools.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-600">
          <p>Nenhuma escola vinculada a você ainda.</p>
          <p className="text-sm mt-2">
            Peça ao gestor para vinculá-lo a uma turma em Gestor → Turmas → Editar turma → Professores desta turma.
          </p>
          <Link href="/professor/controle-aula" className="inline-block mt-4 text-primary font-medium hover:underline">
            Ir para Controle da aula
          </Link>
        </div>
      ) : (
        <EscolasTurmasCards schools={schools} grades={gradesForTeacher} />
      )}
    </div>
  );
}
