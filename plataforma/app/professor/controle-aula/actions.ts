"use server";

import { getSession } from "@/lib/auth/get-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { revalidatePath } from "next/cache";

const XP_POR_MISSAO_VALIDADA = 10;

/** Marca "Introdução concluída" para a turma + aula. Libera a aula (vídeo + game) para os alunos. */
export async function markIntroCompleted(classId: string, lessonId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: link } = await db
    .from("teacher_classes")
    .select("id")
    .eq("teacher_id", session.id)
    .eq("class_id", classId)
    .maybeSingle();
  if (!link) return { error: "Turma não encontrada ou você não é o professor desta turma" };

  const now = new Date().toISOString();
  const { error } = await db.from("class_lesson_state").upsert(
    {
      class_id: classId,
      lesson_id: lessonId,
      intro_completed_at: now,
      updated_at: now,
    },
    { onConflict: "class_id,lesson_id" }
  );
  if (error) return { error: error.message };
  revalidatePath("/professor/controle-aula");
  return { data: { ok: true } };
}

/** Marca "Atividade concluída" para a turma + aula. Libera a Missão para os alunos. */
export async function markActivityCompleted(classId: string, lessonId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const { data: link } = await db
    .from("teacher_classes")
    .select("id")
    .eq("teacher_id", session.id)
    .eq("class_id", classId)
    .maybeSingle();
  if (!link) return { error: "Turma não encontrada ou você não é o professor desta turma" };

  const now = new Date().toISOString();
  const { error } = await db.from("class_lesson_state").upsert(
    {
      class_id: classId,
      lesson_id: lessonId,
      activity_completed_at: now,
      updated_at: now,
    },
    { onConflict: "class_id,lesson_id" }
  );
  if (error) return { error: error.message };
  revalidatePath("/professor/controle-aula");
  return { data: { ok: true } };
}

/** Valida a missão do aluno para a aula: preenche mission_validated_at, concede card (mission) e XP. */
export async function validateMission(userId: string, lessonId: string) {
  const session = await getSession();
  if (!session) return { error: "Não autenticado" };
  const db = createServiceRoleClient();
  if (!db) return { error: "Serviço indisponível" };

  const now = new Date().toISOString();

  const { data: progressRow } = await db
    .from("student_lesson_progress")
    .select("id, mission_validated_at")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (progressRow?.mission_validated_at) {
    return { data: { ok: true } };
  }

  if (progressRow) {
    const { error: updErr } = await db
      .from("student_lesson_progress")
      .update({ mission_validated_at: now, updated_at: now })
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);
    if (updErr) return { error: updErr.message };
  } else {
    const { error: insErr } = await db.from("student_lesson_progress").insert({
      user_id: userId,
      lesson_id: lessonId,
      mission_validated_at: now,
      updated_at: now,
    });
    if (insErr) return { error: insErr.message };
  }

  const { error: cardErr } = await db.from("student_cards").upsert(
    { user_id: userId, lesson_id: lessonId, source: "mission", unlocked_at: now },
    { onConflict: "user_id,lesson_id,source" }
  );
  if (cardErr) return { error: cardErr.message };

  const { data: profile } = await db.from("profiles").select("total_xp").eq("id", userId).single();
  const newXp = (profile?.total_xp ?? 0) + XP_POR_MISSAO_VALIDADA;
  const { error: xpErr } = await db.from("profiles").update({ total_xp: newXp }).eq("id", userId);
  if (xpErr) return { error: xpErr.message };

  revalidatePath("/professor/controle-aula");
  return { data: { ok: true } };
}
