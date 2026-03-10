import { getSession } from "./get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { getCollectionsAndLessonsForCurrentTenant } from "./lessons-for-tenant";

/** Per-lesson state for the journey map (aligned with platform-state-machine). */
export type JourneyLessonState =
  | "locked"
  | "available"
  | "video_completed"
  | "reward_collected"
  | "challenge_completed"
  | "mission_unlocked"
  | "mission_pending_validation"
  | "mission_validated"
  | "lesson_completed";

export interface JourneyLesson {
  id: string;
  title: string;
  number_in_collection: number;
  state: JourneyLessonState;
  isCurrent: boolean;
}

export interface StudentJourneyData {
  lessons: JourneyLesson[];
  currentLessonId: string | null;
  profile: { total_xp: number };
  classId: string | null;
}

function deriveLessonState(
  introCompleted: boolean,
  activityCompleted: boolean,
  videoCompleted: boolean,
  gameCompleted: boolean,
  missionValidated: boolean
): JourneyLessonState {
  if (!introCompleted) return "locked";
  if (missionValidated) return "lesson_completed";
  if (activityCompleted && gameCompleted && !missionValidated) return "mission_pending_validation";
  if (activityCompleted && !gameCompleted) return "mission_unlocked";
  if (gameCompleted) return "challenge_completed";
  if (videoCompleted) return "reward_collected";
  return "available";
}

export async function getStudentJourneyData(): Promise<StudentJourneyData | null> {
  const session = await getSession();
  if (!session?.id || session.role !== "student") return null;

  const db = createServiceRoleClient();
  if (!db) return null;

  const { lessons: orderedLessons } = await getCollectionsAndLessonsForCurrentTenant();
  if (!orderedLessons?.length) {
    return {
      lessons: [],
      currentLessonId: null,
      profile: { total_xp: 0 },
      classId: null,
    };
  }

  const lessonIds = orderedLessons.map((l: { id: string }) => l.id);

  const { data: enrollment } = await db
    .from("student_classes")
    .select("class_id")
    .eq("student_id", session.id)
    .order("class_id")
    .limit(1)
    .maybeSingle();
  const classId = enrollment?.class_id ?? null;

  let classStateMap: Map<string, { intro_completed_at: string | null; activity_completed_at: string | null }> = new Map();
  if (classId) {
    const { data: classStates } = await db
      .from("class_lesson_state")
      .select("lesson_id, intro_completed_at, activity_completed_at")
      .eq("class_id", classId)
      .in("lesson_id", lessonIds);
    classStates?.forEach((r: { lesson_id: string; intro_completed_at: string | null; activity_completed_at: string | null }) => {
      classStateMap.set(r.lesson_id, { intro_completed_at: r.intro_completed_at ?? null, activity_completed_at: r.activity_completed_at ?? null });
    });
  }

  const { data: progressRows } = await db
    .from("student_lesson_progress")
    .select("lesson_id, video_completed_at, game_completed_at, mission_validated_at")
    .eq("user_id", session.id)
    .in("lesson_id", lessonIds);

  const progressMap = new Map(
    (progressRows ?? []).map((p: { lesson_id: string; video_completed_at: string | null; game_completed_at: string | null; mission_validated_at: string | null }) => [
      p.lesson_id,
      {
        video_completed_at: !!p.video_completed_at,
        game_completed_at: !!p.game_completed_at,
        mission_validated_at: !!p.mission_validated_at,
      },
    ])
  );

  const { data: profile } = await db.from("profiles").select("total_xp").eq("id", session.id).maybeSingle();
  const total_xp = profile?.total_xp ?? 0;

  const lessons: JourneyLesson[] = orderedLessons.map((l: { id: string; title: string; number_in_collection?: number }, index: number) => {
    const classState = classId ? classStateMap.get(l.id) : null;
    const introCompleted = classId ? !!classState?.intro_completed_at : true;
    const activityCompleted = classId ? !!classState?.activity_completed_at : false;
    const prog = progressMap.get(l.id) ?? { video_completed_at: false, game_completed_at: false, mission_validated_at: false };
    const state = deriveLessonState(
      introCompleted,
      activityCompleted,
      prog.video_completed_at,
      prog.game_completed_at,
      prog.mission_validated_at
    );
    return {
      id: l.id,
      title: l.title,
      number_in_collection: l.number_in_collection ?? index + 1,
      state,
      isCurrent: false,
    };
  });

  const firstNonCompleted = lessons.find((l) => l.state !== "locked" && l.state !== "lesson_completed");
  if (firstNonCompleted) firstNonCompleted.isCurrent = true;

  const currentLessonId = firstNonCompleted?.id ?? null;

  return {
    lessons,
    currentLessonId,
    profile: { total_xp: total_xp as number },
    classId,
  };
}
