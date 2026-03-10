"use server";

import { createClient } from "@/lib/supabase/server";
import type { LessonFormValues } from "@/lib/validators/lesson";

export async function createLesson(data: LessonFormValues) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .insert({
      collection_id: data.collection_id || null,
      title: data.title,
      slug: data.slug || null,
      summary: data.summary || null,
      grade_id: data.grade_id || null,
      pillar_id: data.pillar_id || null,
      skill_id: data.skill_id || null,
      number_in_collection: data.number_in_collection ?? null,
      status: data.status,
    })
    .select("id")
    .single();

  if (lessonError || !lesson) return { error: lessonError?.message ?? "Erro ao criar aula" };

  const { data: version, error: versionError } = await supabase
    .from("lesson_versions")
    .insert({ lesson_id: lesson.id, tenant_id: null, version_number: 1 })
    .select("id")
    .single();

  if (versionError || !version) {
    await supabase.from("lessons").delete().eq("id", lesson.id);
    return { error: versionError?.message ?? "Erro ao criar versão" };
  }

  await supabase.from("lesson_content").insert({
    lesson_version_id: version.id,
    learning_objective: data.learning_objective || null,
    teacher_introduction: data.teacher_introduction || null,
    discussion_questions: data.discussion_questions ?? [],
    activity_description: data.activity_description || null,
    home_mission: data.home_mission || null,
  });
  await supabase.from("lesson_media").insert({
    lesson_version_id: version.id,
    youtube_url: data.youtube_url || null,
    thumbnail_url: data.thumbnail_url || null,
  });
  await supabase.from("lesson_cards").insert({
    lesson_version_id: version.id,
    name: data.card_name || null,
    description: data.card_description || null,
    image_url: data.card_image_url || null,
  });
  await supabase.from("lesson_games").insert({
    lesson_version_id: version.id,
    game_type: data.game_type || "quiz",
    config_json: data.game_config_json ?? {},
  });

  return { data: { lessonId: lesson.id } };
}

export async function updateLesson(lessonId: string, data: LessonFormValues) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const { data: version } = await supabase
    .from("lesson_versions")
    .select("id")
    .eq("lesson_id", lessonId)
    .is("tenant_id", null)
    .single();

  if (!version) return { error: "Versão nacional não encontrada" };

  const { error: lessonError } = await supabase
    .from("lessons")
    .update({
      collection_id: data.collection_id || null,
      title: data.title,
      slug: data.slug || null,
      summary: data.summary || null,
      grade_id: data.grade_id || null,
      pillar_id: data.pillar_id || null,
      skill_id: data.skill_id || null,
      number_in_collection: data.number_in_collection ?? null,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId);

  if (lessonError) return { error: lessonError.message };

  await supabase.from("lesson_content").upsert({
    lesson_version_id: version.id,
    learning_objective: data.learning_objective || null,
    teacher_introduction: data.teacher_introduction || null,
    discussion_questions: data.discussion_questions ?? [],
    activity_description: data.activity_description || null,
    home_mission: data.home_mission || null,
  }, { onConflict: "lesson_version_id" });
  await supabase.from("lesson_media").upsert({
    lesson_version_id: version.id,
    youtube_url: data.youtube_url || null,
    thumbnail_url: data.thumbnail_url || null,
  }, { onConflict: "lesson_version_id" });
  await supabase.from("lesson_cards").upsert({
    lesson_version_id: version.id,
    name: data.card_name || null,
    description: data.card_description || null,
    image_url: data.card_image_url || null,
  }, { onConflict: "lesson_version_id" });
  await supabase.from("lesson_games").upsert({
    lesson_version_id: version.id,
    game_type: data.game_type || "quiz",
    config_json: data.game_config_json ?? {},
  }, { onConflict: "lesson_version_id" });

  return { data: { lessonId } };
}
