import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { getSession } from "@/lib/auth/get-session";

export interface GestorDashboardStats {
  schoolsCount: number;
  teachersCount: number;
  classesCount: number;
  studentsCount: number;
}

/** Para super_admin: pode passar tenantId (ex.: searchParams). Para manager: usa session.tenantId. */
function getEffectiveTenantId(tenantIdOverride: string | null | undefined): string | null {
  return tenantIdOverride ?? null;
}

export async function getGestorDashboardStats(
  tenantIdOverride?: string | null
): Promise<GestorDashboardStats | null> {
  const session = await getSession();
  if (!session) return null;
  const db = createServiceRoleClient();
  if (!db) return null;

  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId) return null;

  const [schoolsRes, teachersRes, studentsRes] = await Promise.all([
    db.from("schools").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("active", true),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("role", "teacher").eq("status", "active"),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("role", "student").eq("status", "active"),
  ]);

  const { data: schoolList } = await db.from("schools").select("id").eq("tenant_id", tenantId);
  const schoolIds = (schoolList ?? []).map((s) => s.id);
  let classesCount = 0;
  if (schoolIds.length > 0) {
    const classesRes = await db.from("classes").select("id", { count: "exact", head: true }).in("school_id", schoolIds);
    classesCount = classesRes.count ?? 0;
  }

  return {
    schoolsCount: schoolsRes.count ?? 0,
    teachersCount: teachersRes.count ?? 0,
    classesCount,
    studentsCount: studentsRes.count ?? 0,
  };
}

/** Lista de clientes (tenants) para super_admin escolher no painel do gestor. */
export interface GestorTenantOption {
  client_type?: string;
  id: string;
  name: string;
  slug: string;
}

export async function getTenantsForGestor(): Promise<GestorTenantOption[]> {
  const session = await getSession();
  if (session?.role !== "super_admin") return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const { data } = await db.from("tenants").select("id, name, slug, client_type").eq("active", true).order("name");
  return data ?? [];
}

export interface GestorSchool {
  slug?: string | null;
  created_at?: string;
  id: string;
  name: string;
  active: boolean;
}

export async function getGestorSchools(
  tenantIdOverride?: string | null
): Promise<GestorSchool[]> {
  const session = await getSession();
  if (!session) return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId) return [];
  const { data } = await db.from("schools").select("id, name, active, slug, created_at").eq("tenant_id", tenantId).order("name");
  return data ?? [];
}

export interface GestorTeacher {
  id: string;
  full_name: string | null;
  email: string | null;
  status?: string | null;
  grade_ids?: string[] | null;
}

export async function getGestorTeachers(
  tenantIdOverride?: string | null
): Promise<GestorTeacher[]> {
  const session = await getSession();
  if (!session) return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId) return [];
  const { data } = await db.from("profiles").select("id, full_name, email").eq("tenant_id", tenantId).eq("role", "teacher").order("full_name");
  return data ?? [];
}


export interface GestorGrade {
  id: string;
  name: string;
  sort_order: number;
}

/** Anos (1º–5º) para seleção no convite de professor; define acesso à biblioteca por ano. */
export async function getGradesForGestor(): Promise<GestorGrade[]> {
  const db = createServiceRoleClient();
  if (!db) return [];
  const { data } = await db.from("grades").select("id, name, sort_order").order("sort_order");
  return data ?? [];
}

export interface GestorClass {
  id: string;
  name: string;
  schoolName: string;
}

export async function getGestorClasses(
  tenantIdOverride?: string | null
): Promise<GestorClass[]> {
  const session = await getSession();
  if (!session) return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId) return [];
  const { data: schools } = await db.from("schools").select("id, name").eq("tenant_id", tenantId);
  if (!schools?.length) return [];
  const schoolMap = new Map(schools.map((s) => [s.id, s.name]));
  const { data: classes } = await db.from("classes").select("id, name, school_id").in("school_id", schools.map((s) => s.id)).order("name");
  return (classes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    schoolName: schoolMap.get(c.school_id) ?? "—",
  }));
}

export interface GestorSchoolDetail extends GestorSchool {
  slug?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function getSchoolById(
  schoolId: string,
  tenantIdOverride?: string | null
): Promise<GestorSchoolDetail | null> {
  const session = await getSession();
  if (!session) return null;
  const db = createServiceRoleClient();
  if (!db) return null;
  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId) return null;
  const { data } = await db
    .from("schools")
    .select("id, name, active, slug, created_at, updated_at")
    .eq("id", schoolId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    active: !!data.active,
    slug: data.slug ?? null,
    created_at: data.created_at ?? undefined,
    updated_at: data.updated_at ?? undefined,
  };
}

export interface GestorTeacherClass {
  id: string;
  name: string;
  schoolId: string;
  schoolName: string;
}

export interface GestorTeacherWithSchoolAndClasses extends GestorTeacher {
  schools: { id: string; name: string }[];
  classes: GestorTeacherClass[];
}

export async function getGestorTeachersWithSchoolAndClasses(
  tenantIdOverride?: string | null
): Promise<GestorTeacherWithSchoolAndClasses[]> {
  const session = await getSession();
  if (!session) return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId) return [];
  const { data: teachers } = await db
    .from("profiles")
    .select("id, full_name, email, status, grade_ids")
    .eq("tenant_id", tenantId)
    .eq("role", "teacher")
    .order("full_name");
  if (!teachers?.length) return [];

  const teacherIds = teachers.map((t) => t.id);
  const [linksRes, teacherSchoolsRes] = await Promise.all([
    db.from("teacher_classes").select("teacher_id, class_id").in("teacher_id", teacherIds),
    db.from("teacher_schools").select("teacher_id, school_id").in("teacher_id", teacherIds),
  ]);
  const links = linksRes.data ?? [];
  const teacherSchools = teacherSchoolsRes.data ?? [];

  const parseGradeIds = (raw: unknown): string[] | null => {
    if (raw == null) return null;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const tsSchoolIds = [...new Set(teacherSchools.map((ts) => ts.school_id))];
  const allSchoolIdsSet = new Set<string>(tsSchoolIds);

  if (links.length > 0) {
    const classIds = [...new Set(links.map((l) => l.class_id))];
    const { data: classes } = await db.from("classes").select("id, name, school_id").in("id", classIds);
    (classes ?? []).forEach((c) => allSchoolIdsSet.add(c.school_id));
  }
  const allSchoolIds = [...allSchoolIdsSet];
  const { data: schools } = await db.from("schools").select("id, name").in("id", allSchoolIds);
  const schoolMap = new Map((schools ?? []).map((s) => [s.id, s.name]));

  const teacherToSchoolIdsFromTs = new Map<string, string[]>();
  for (const ts of teacherSchools) {
    const arr = teacherToSchoolIdsFromTs.get(ts.teacher_id) ?? [];
    if (!arr.includes(ts.school_id)) arr.push(ts.school_id);
    teacherToSchoolIdsFromTs.set(ts.teacher_id, arr);
  }

  if (!links.length) {
    return teachers.map((t) => {
      const schoolIdsFromTs = teacherToSchoolIdsFromTs.get(t.id) ?? [];
      const schoolsForTeacher = schoolIdsFromTs.map((id) => ({ id, name: schoolMap.get(id) ?? "—" }));
      return {
        ...t,
        email: t.email ?? null,
        status: t.status ?? null,
        grade_ids: parseGradeIds((t as { grade_ids?: unknown }).grade_ids) ?? null,
        schools: schoolsForTeacher,
        classes: [],
      };
    });
  }

  const classIds = [...new Set(links.map((l) => l.class_id))];
  const { data: classes } = await db.from("classes").select("id, name, school_id").in("id", classIds);
  const classList = (classes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    schoolId: c.school_id,
    schoolName: schoolMap.get(c.school_id) ?? "—",
  }));

  const teacherToClasses = new Map<string, typeof classList>();
  for (const l of links) {
    const cls = classList.find((c) => c.id === l.class_id);
    if (cls) {
      const arr = teacherToClasses.get(l.teacher_id) ?? [];
      if (!arr.find((c) => c.id === cls.id)) arr.push(cls);
      teacherToClasses.set(l.teacher_id, arr);
    }
  }

  return teachers.map((t) => {
    const teacherClasses = teacherToClasses.get(t.id) ?? [];
    const schoolIdsFromClasses = [...new Set(teacherClasses.map((c) => c.schoolId))];
    const schoolIdsFromTs = teacherToSchoolIdsFromTs.get(t.id) ?? [];
    const schoolIdsForTeacher = [...new Set([...schoolIdsFromClasses, ...schoolIdsFromTs])];
    const schoolsForTeacher = schoolIdsForTeacher.map((id) => ({
      id,
      name: schoolMap.get(id) ?? "—",
    }));
    return {
      id: t.id,
      full_name: t.full_name ?? null,
      email: t.email ?? null,
      status: t.status ?? null,
      grade_ids: parseGradeIds((t as { grade_ids?: unknown }).grade_ids) ?? null,
      schools: schoolsForTeacher,
      classes: teacherClasses,
    };
  });
}

export interface GestorClassStudent {
  id: string;
  full_name: string | null;
  lessons_with_progress: number;
  lessons_completed: number;
}

export interface GestorClassWithStudents extends GestorClass {
  schoolId: string;
  students: GestorClassStudent[];
}

export async function getGestorClassesWithStudents(
  tenantIdOverride?: string | null
): Promise<GestorClassWithStudents[]> {
  const session = await getSession();
  if (!session) return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId) return [];

  const { data: schools } = await db.from("schools").select("id, name").eq("tenant_id", tenantId);
  if (!schools?.length) return [];
  const schoolMap = new Map(schools.map((s) => [s.id, s.name]));
  const { data: classes } = await db
    .from("classes")
    .select("id, name, school_id")
    .in("school_id", schools.map((s) => s.id))
    .order("name");
  if (!classes?.length) return [];

  const classIds = classes.map((c) => c.id);
  const { data: enrollments } = await db.from("student_classes").select("class_id, student_id").in("class_id", classIds);
  const studentIds = [...new Set((enrollments ?? []).map((e) => e.student_id))];
  const { data: profiles } = await db.from("profiles").select("id, full_name").in("id", studentIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const { data: progressRows } = await db
    .from("student_lesson_progress")
    .select("user_id, lesson_id, video_completed_at, game_completed_at, mission_validated_at")
    .in("user_id", studentIds);
  const completedPerUser = new Map<string, number>();
  for (const r of progressRows ?? []) {
    const done = [r.video_completed_at, r.game_completed_at, r.mission_validated_at].filter(Boolean).length;
    const key = r.user_id + "_" + r.lesson_id;
    const anyDone = done > 0 ? 1 : 0;
    completedPerUser.set(key, (completedPerUser.get(key) ?? 0) || anyDone);
  }
  const lessonsWithProgressPerUser = new Map<string, number>();
  const lessonsCompletedPerUser = new Map<string, number>();
  for (const r of progressRows ?? []) {
    const key = r.user_id;
    const lessonKey = r.user_id + "_" + r.lesson_id;
    const hasProgress = (r.video_completed_at || r.game_completed_at || r.mission_validated_at) ? 1 : 0;
    lessonsWithProgressPerUser.set(key, (lessonsWithProgressPerUser.get(key) ?? 0) + (hasProgress ? 1 : 0));
    const allDone = r.video_completed_at && r.game_completed_at && r.mission_validated_at ? 1 : 0;
    lessonsCompletedPerUser.set(key, (lessonsCompletedPerUser.get(key) ?? 0) + allDone);
  }

  return classes.map((c) => {
    const classEnrollments = (enrollments ?? []).filter((e) => e.class_id === c.id);
    const students: GestorClassStudent[] = classEnrollments.map((e) => {
      const p = profileMap.get(e.student_id);
      return {
        id: e.student_id,
        full_name: p?.full_name ?? null,
        lessons_with_progress: lessonsWithProgressPerUser.get(e.student_id) ?? 0,
        lessons_completed: lessonsCompletedPerUser.get(e.student_id) ?? 0,
      };
    });
    return {
      id: c.id,
      name: c.name,
      schoolName: schoolMap.get(c.school_id) ?? "—",
      schoolId: c.school_id,
      students,
    };
  });
}

export async function getGestorClassById(
  classId: string,
  tenantIdOverride?: string | null
): Promise<GestorClassWithStudents | null> {
  const list = await getGestorClassesWithStudents(tenantIdOverride);
  return list.find((c) => c.id === classId) ?? null;
}

export async function getClassTeacherIds(
  classId: string
): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];
  const db = createServiceRoleClient();
  if (!db) return [];
  const { data } = await db.from("teacher_classes").select("teacher_id").eq("class_id", classId);
  return (data ?? []).map((r) => r.teacher_id);
}

/** grade_id ativos por escola (coleções liberadas por escola). */
export async function getSchoolGradeIdsBySchool(
  schoolIds: string[],
  tenantIdOverride?: string | null
): Promise<Map<string, string[]>> {
  const session = await getSession();
  if (!session) return new Map();
  const db = createServiceRoleClient();
  if (!db) return new Map();
  const tenantId =
    session.role === "super_admin"
      ? getEffectiveTenantId(tenantIdOverride) ?? session.tenantId
      : session.role === "manager"
        ? session.tenantId
        : null;
  if (!tenantId || schoolIds.length === 0) return new Map();
  const { data: schools } = await db.from("schools").select("id").eq("tenant_id", tenantId).in("id", schoolIds);
  const allowedIds = new Set((schools ?? []).map((s) => s.id));
  const validSchoolIds = schoolIds.filter((id) => allowedIds.has(id));
  if (validSchoolIds.length === 0) return new Map();
  const { data: rows } = await db.from("school_grades").select("school_id, grade_id").in("school_id", validSchoolIds);
  const map = new Map<string, string[]>();
  for (const id of validSchoolIds) map.set(id, []);
  for (const r of rows ?? []) {
    const arr = map.get(r.school_id) ?? [];
    if (!arr.includes(r.grade_id)) arr.push(r.grade_id);
    map.set(r.school_id, arr);
  }
  return map;
}

