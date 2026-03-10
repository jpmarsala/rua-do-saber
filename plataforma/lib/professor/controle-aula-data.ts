import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { getSession } from "@/lib/auth/get-session";

export interface TeacherClass {
  id: string;
  name: string;
  schoolName: string;
}

export interface ClassLessonState {
  intro_completed_at: string | null;
  activity_completed_at: string | null;
}

export interface StudentProgressItem {
  user_id: string;
  full_name: string | null;
  call_number: number | null;
  video_completed_at: string | null;
  game_completed_at: string | null;
  mission_validated_at: string | null;
}

export async function getTeacherClasses(): Promise<TeacherClass[]> {
  const session = await getSession();
  if (!session) return [];
  const db = createServiceRoleClient();
  if (!db) return [];

  const { data: links } = await db
    .from("teacher_classes")
    .select("class_id")
    .eq("teacher_id", session.id);
  if (!links?.length) return [];

  const classIds = links.map((r) => r.class_id);
  const { data: classes } = await db
    .from("classes")
    .select("id, name, school_id")
    .in("id", classIds);
  if (!classes?.length) return [];

  const schoolIds = [...new Set(classes.map((c) => c.school_id))];
  const { data: schools } = await db.from("schools").select("id, name").in("id", schoolIds);
  const schoolMap = new Map((schools ?? []).map((s) => [s.id, s.name]));

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    schoolName: schoolMap.get(c.school_id) ?? "—",
  }));
}

export async function getClassLessonState(
  classId: string,
  lessonId: string
): Promise<ClassLessonState | null> {
  const db = createServiceRoleClient();
  if (!db) return null;
  const { data } = await db
    .from("class_lesson_state")
    .select("intro_completed_at, activity_completed_at")
    .eq("class_id", classId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  return data;
}

export async function getStudentsWithProgress(
  classId: string,
  lessonId: string
): Promise<StudentProgressItem[]> {
  const db = createServiceRoleClient();
  if (!db) return [];

  const { data: enrollments } = await db
    .from("student_classes")
    .select("student_id, call_number")
    .eq("class_id", classId);
  if (!enrollments?.length) return [];

  const userIds = enrollments.map((e) => e.student_id);
  const { data: profiles } = await db.from("profiles").select("id, full_name").in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const callMap = new Map(enrollments.map((e) => [e.student_id, e.call_number]));

  const { data: progressList } = await db
    .from("student_lesson_progress")
    .select("user_id, video_completed_at, game_completed_at, mission_validated_at")
    .eq("lesson_id", lessonId)
    .in("user_id", userIds);

  const progressMap = new Map(
    (progressList ?? []).map((p) => [
      p.user_id,
      {
        video_completed_at: p.video_completed_at,
        game_completed_at: p.game_completed_at,
        mission_validated_at: p.mission_validated_at,
      },
    ])
  );

  return userIds.map((uid) => {
    const p = progressMap.get(uid);
    return {
      user_id: uid,
      full_name: profileMap.get(uid) ?? null,
      call_number: callMap.get(uid) ?? null,
      video_completed_at: p?.video_completed_at ?? null,
      game_completed_at: p?.game_completed_at ?? null,
      mission_validated_at: p?.mission_validated_at ?? null,
    };
  });
}
