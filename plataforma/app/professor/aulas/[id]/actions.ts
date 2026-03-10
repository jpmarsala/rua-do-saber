"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";

export async function markLessonApplied(lessonId: string, notes?: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };
  const { error } = await supabase.from("applied_lessons").insert({
    teacher_id: session.id,
    lesson_id: lessonId,
    notes: notes || null,
  });
  if (error) return { error: error.message };
  return { data: { ok: true } };
}
