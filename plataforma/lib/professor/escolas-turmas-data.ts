import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { getSession } from "@/lib/auth/get-session";

export interface ProfessorSchoolClass {
  id: string;
  name: string;
  studentsCount: number;
  gradeId?: string | null;
  gradeName?: string | null;
}

export interface ProfessorSchool {
  id: string;
  name: string;
  classes: ProfessorSchoolClass[];
}

/** Escolas vinculadas ao professor (por turma ou por teacher_schools); para cada escola, todas as turmas da escola. */
export async function getProfessorSchoolsWithClasses(): Promise<ProfessorSchool[]> {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher" || !session.tenantId) return [];
  const db = createServiceRoleClient();
  if (!db) return [];

  const schoolIdsFromClasses: string[] = [];
  const { data: links } = await db.from("teacher_classes").select("class_id").eq("teacher_id", session.id);
  if (links?.length) {
    const classIds = links.map((r) => r.class_id);
    const { data: myClasses } = await db.from("classes").select("id, name, school_id").in("id", classIds);
    if (myClasses?.length) {
      schoolIdsFromClasses.push(...myClasses.map((c) => c.school_id));
    }
  }
  const { data: teacherSchools } = await db.from("teacher_schools").select("school_id").eq("teacher_id", session.id);
  const schoolIdsFromTs = (teacherSchools ?? []).map((r) => r.school_id);
  const schoolIds = [...new Set([...schoolIdsFromClasses, ...schoolIdsFromTs])];
  if (schoolIds.length === 0) return [];
  const { data: schools } = await db.from("schools").select("id, name").eq("tenant_id", session.tenantId).in("id", schoolIds);
  if (!schools?.length) return [];

  const { data: allClassesInSchools } = await db.from("classes").select("id, name, school_id, grade_id").in("school_id", schoolIds);
  const classIdsAll = (allClassesInSchools ?? []).map((c) => c.id);
  const { data: enrollments } =
    classIdsAll.length > 0
      ? await db.from("student_classes").select("class_id").in("class_id", classIdsAll)
      : { data: [] };
  const countByClass = new Map<string, number>();
  for (const e of enrollments ?? []) {
    countByClass.set(e.class_id, (countByClass.get(e.class_id) ?? 0) + 1);
  }

  const gradeIds = [...new Set((allClassesInSchools ?? []).map((c) => c.grade_id).filter(Boolean))];
  const { data: gradesList } = gradeIds.length ? await db.from("grades").select("id, name").in("id", gradeIds) : { data: [] };
  const gradeMap = new Map((gradesList ?? []).map((g) => [g.id, g.name]));

  return schools.map((s) => {
    const classes = (allClassesInSchools ?? []).filter((c) => c.school_id === s.id).map((c) => ({
      id: c.id,
      name: c.name,
      studentsCount: countByClass.get(c.id) ?? 0,
      gradeId: c.grade_id ?? null,
      gradeName: c.grade_id ? gradeMap.get(c.grade_id) ?? null : null,
    }));
    return { id: s.id, name: s.name, classes };
  });
}

/** Alunos de uma turma (para o professor gerenciar). */
export async function getClassStudents(classId: string): Promise<{ id: string; full_name: string | null; email: string | null }[]> {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher") return [];
  const db = createServiceRoleClient();
  if (!db) return [];

  const { data: link } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId).eq("teacher_id", session.id).maybeSingle();
  if (!link) return [];

  const { data: enrollments } = await db.from("student_classes").select("student_id").eq("class_id", classId);
  if (!enrollments?.length) return [];
  const ids = enrollments.map((e) => e.student_id);
  const { data: profiles } = await db.from("profiles").select("id, full_name, email").in("id", ids);
  return (profiles ?? []).map((p) => ({ id: p.id, full_name: p.full_name ?? null, email: p.email ?? null }));
}

/** IDs dos anos (grades) que o professor leciona (profile.grade_ids). */
export async function getProfessorGradeIds(): Promise<string[]> {
  const session = await getSession();
  if (!session?.id || session.role !== "teacher") return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const { data: profile } = await db.from("profiles").select("grade_ids").eq("id", session.id).maybeSingle();
  if (!profile?.grade_ids) return [];
  const raw = profile.grade_ids;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  return [];
}
