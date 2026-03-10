"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { getSession } from "@/lib/auth/get-session";
import { revalidatePath } from "next/cache";

export async function registerLessonView(lessonId: string) {
  const session = await getSession();
  if (!session) return;
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("lesson_views").insert({ user_id: session.id, lesson_id: lessonId });

  const db = createServiceRoleClient();
  if (db) {
    const now = new Date().toISOString();
    const { data: existing } = await db.from("student_lesson_progress").select("id").eq("user_id", session.id).eq("lesson_id", lessonId).maybeSingle();
    if (existing) {
      await db.from("student_lesson_progress").update({ video_completed_at: now, updated_at: now }).eq("user_id", session.id).eq("lesson_id", lessonId);
    } else {
      await db.from("student_lesson_progress").insert({ user_id: session.id, lesson_id: lessonId, video_completed_at: now, updated_at: now });
    }
    revalidatePath("/aluno");
  }
}

export async function registerGameComplete(lessonId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const supabase = await createClient();
  if (!supabase) return { error: "Erro" };
  const { error } = await supabase.from("game_sessions").insert({ user_id: session.id, lesson_id: lessonId });
  if (error) return { error: error.message };

  const db = createServiceRoleClient();
  if (db) {
    const now = new Date().toISOString();
    const { data: existing } = await db.from("student_lesson_progress").select("id").eq("user_id", session.id).eq("lesson_id", lessonId).maybeSingle();
    if (existing) {
      await db.from("student_lesson_progress").update({ game_completed_at: now, updated_at: now }).eq("user_id", session.id).eq("lesson_id", lessonId);
    } else {
      await db.from("student_lesson_progress").insert({ user_id: session.id, lesson_id: lessonId, game_completed_at: now, updated_at: now });
    }
    revalidatePath("/aluno");
  }
  return { data: { ok: true } };
}
