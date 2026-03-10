import Link from "next/link";
import { formatLessonTitleForDisplay } from "@/lib/lesson-title";
import { getSession } from "@/lib/auth/get-session";
import { getCollectionsAndLessonsForCurrentTenant } from "@/lib/auth/lessons-for-tenant";
import {
  getTeacherClasses,
  getClassLessonState,
  getStudentsWithProgress,
} from "@/lib/professor/controle-aula-data";
import { redirect } from "next/navigation";
import { ControleAulaPanel } from "./ControleAulaPanel";
import { Selectors } from "./Selectors";

export default async function ControleAulaPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; lessonId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const params = await searchParams;
  const classId = params.classId;
  const lessonId = params.lessonId;

  const [classes, { lessons }] = await Promise.all([
    getTeacherClasses(),
    getCollectionsAndLessonsForCurrentTenant(),
  ]);

  const selectedClass = classId ? classes.find((c) => c.id === classId) : null;
  const selectedLesson = lessonId ? lessons.find((l) => l.id === lessonId) : null;

  let state = null;
  let students: Awaited<ReturnType<typeof getStudentsWithProgress>> = [];
  if (classId && lessonId) {
    const [s, st] = await Promise.all([
      getClassLessonState(classId, lessonId),
      getStudentsWithProgress(classId, lessonId),
    ]);
    state = s;
    students = st;
  }

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/professor" className="hover:text-slate-700">Professor</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">Controle da aula</span>
      </nav>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Controle da aula</h1>
      <p className="text-slate-600 mb-6">
        Selecione a turma e a aula. Use os botões para liberar a sequência para os alunos.
      </p>

      <Selectors classes={classes} lessons={lessons} />

      {selectedClass && selectedLesson && (
        <ControleAulaPanel
          classId={classId!}
          lessonId={lessonId!}
          lessonTitle={formatLessonTitleForDisplay(selectedLesson.title)}
          state={state}
          students={students}
        />
      )}

      {(!classId || !lessonId) && (
        <p className="text-slate-500">Selecione turma e aula para ver o controle.</p>
      )}
    </div>
  );
}
